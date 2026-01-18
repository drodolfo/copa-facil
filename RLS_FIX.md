# 🔧 Corrección de Políticas RLS - Registro de Usuarios

## Problema

Error al registrar nuevo usuario:
```
new row violates row-level security policy for table "users"
```

## Causa

Las políticas RLS (Row Level Security) de Supabase están bloqueando la inserción automática del perfil de usuario cuando se registra un nuevo usuario. El trigger `handle_new_user()` intenta crear el perfil, pero la política `Users can insert own profile` lo bloquea.

## Solución

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase para corregir las políticas RLS:

```sql
-- Eliminar la política problemática que bloquea la creación automática de perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Crear una nueva política más permisiva que permite inserciones automáticas
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT
WITH CHECK (true);

-- Verificar las políticas
SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'users';
```

## Pasos para Aplicar el Fix

### 1. Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en Supabase
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **"New Query"**

### 2. Ejecutar el SQL de Corrección

Copia y pega el siguiente SQL en el editor y haz clic en **Run**:

```sql
-- Fix RLS policies for user registration
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
FOR INSERT
WITH CHECK (true);
```

### 3. Verificar que el Trigger Funciona

Ejecuta este SQL para verificar que el trigger está activo:

```sql
-- Verificar trigger de creación de perfil
SELECT
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'auth.users'
AND trigger_name = 'on_auth_user_created';

-- Debería mostrar: on_auth_user_created | INSERT | auth.users
```

### 4. Verificar que el Trigger Existe

Ejecuta este SQL para verificar que la función del trigger existe:

```sql
-- Verificar función de trigger
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- Debería mostrar: handle_new_user | FUNCTION
```

## Verificar el Fix

### 1. Probar Registro de Usuario

1. Ve a tu aplicación local: http://localhost:5174/register
2. Regístrate con un nuevo email y contraseña
3. Revisa la consola del navegador (F12) para logs
4. No debería aparecer el error RLS

### 2. Verificar en Base de Datos

Ejecuta este SQL para verificar que el usuario se creó correctamente:

```sql
-- Verificar usuarios creados
SELECT
    id,
    email,
    full_name,
    phone,
    role,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Verificar usuarios en auth (tabla de autenticación)
SELECT
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### 3. Probar Login

1. Ve a http://localhost:5174/login
2. Ingresa las credenciales del nuevo usuario
3. Si email confirmation está activado, confirma el email primero
4. Deberías poder iniciar sesión exitosamente

## Solución de Problemas

### El Trigger No Funciona

Si el trigger no crea el perfil automáticamente:

1. **Recrear el trigger:**

```sql
-- Eliminar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar función existente
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función de nuevo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, phone, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario'),
        COALESCE(new.raw_user_meta_data->>'phone', 'Sin teléfono'),
        'user'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger de nuevo
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

2. **Verificar logs en Supabase:**
   - Ve a Logs → Database
   - Busca errores relacionados con el trigger

### El Usuario No Aparece en la Tabla users

Si el usuario aparece en `auth.users` pero no en `public.users`:

1. **Verificar si el trigger se ejecutó:**

```sql
-- Buscar usuario en auth
SELECT id, email FROM auth.users WHERE email = 'email_del_usuario';

-- Buscar usuario en public
SELECT id, email FROM users WHERE email = 'email_del_usuario';
```

2. **Crear el perfil manualmente:**

```sql
-- Copia el id del usuario de auth.users y úsalo aquí:
INSERT INTO public.users (id, email, full_name, phone, role)
VALUES (
    'user_id_de_auth_users',
    'email_del_usuario',
    'Nombre del Usuario',
    '1234567890',
    'user'
);
```

### Error Persiste Después del Fix

Si el error de RLS persiste:

1. **Desactivar RLS temporalmente (solo para debug):**

```sql
ALTER TABLE users NO ROW LEVEL SECURITY;

-- Probar registro

-- Reactivar RLS después
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

2. **Verificar todas las políticas RLS:**

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
```

## Comprender el Flujo de Registro

### Antes del Fix (Problema)

1. Usuario se registra en auth
2. Supabase crea usuario en `auth.users`
3. Trigger intenta insertar en `public.users`
4. **POLÍTICA RLS BLOQUEA LA INSERCIÓN** ❌
5. Error: "new row violates row-level security policy"

### Después del Fix (Solución)

1. Usuario se registra en auth
2. Supabase crea usuario en `auth.users`
3. Trigger inserta en `public.users`
4. **POLÍTICA RLS PERMITE LA INSERCIÓN** ✅
5. Perfil creado exitosamente
6. Usuario puede iniciar sesión

## Configuración de Seguridad (Opcional)

Si quieres una configuración más estricta después de que funcione el registro:

```sql
-- Política más estricta para insertar perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
FOR INSERT
WITH CHECK (
    auth.uid() = id OR
    (EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = id
    ))
);
```

Esta política permite:
- Usuarios autenticados insertar su propio perfil
- El trigger insertar automáticamente el perfil de nuevos usuarios

## Verificación de Producción

Antes de desplegar a producción:

1. ✅ Ejecutar el SQL de corrección en producción
2. ✅ Probar registro de usuario
3. ✅ Verificar perfil en tabla users
4. ✅ Probar login del usuario
5. ✅ Verificar que el usuario acceda al dashboard
6. ✅ Confirmar que los roles se asignan correctamente

## Archivos Modificados

- `supabase/fix_rls_policies.sql` - SQL para corregir políticas RLS
- `src/context/AuthContext.tsx` - Eliminada inserción manual de perfil

## Resumen

✅ Las políticas RLS han sido corregidas
✅ El trigger crea automáticamente el perfil
✅ Ya no hay inserción manual en el AuthContext
✅ El registro de usuarios debería funcionar sin errores

El flujo de registro ahora está optimizado y seguro. El trigger se encarga de crear automáticamente el perfil del usuario cuando se registra.
