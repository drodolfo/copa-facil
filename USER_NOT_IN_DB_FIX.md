# 🔧 Solución: Usuario no aparece en base de datos pero recibe email de confirmación

## Problema

- ✅ El usuario se registra y recibe email de confirmación
- ❌ Al iniciar sesión: "Invalid login credentials"
- ❌ El usuario NO aparece en la tabla `public.users`
- ✅ El usuario SÍ aparece en la tabla `auth.users`

## Causa

El trigger `handle_new_user()` no está creando automáticamente el perfil del usuario en la tabla `public.users`. Esto puede ser porque:

1. El trigger no existe
2. El trigger existe pero falla silenciosamente
3. Las políticas RLS bloquean la inserción
4. El trigger se creó después de que el usuario ya existía

## Solución Completa

### Paso 1: Ejecutar SQL Completo en Supabase

1. Ve a tu proyecto en Supabase
2. **SQL Editor** → **New Query**
3. Copia y pega el contenido de `supabase/fix_trigger_complete.sql`
4. Haz clic en **Run**

Este SQL hará lo siguiente:
- ✅ Eliminar y recrear el trigger
- ✅ Crear la función con mejor manejo de errores
- ✅ Verificar y corregir políticas RLS
- ✅ Insertar manualmente perfiles de usuarios existentes
- ✅ Verificar que todo funcione correctamente

### Paso 2: Verificar Usuarios

Después de ejecutar el SQL, verifica que los usuarios aparezcan:

```sql
SELECT
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    CASE WHEN a.id IS NOT NULL THEN 'YES' ELSE 'NO' END as in_auth
FROM public.users u
LEFT JOIN auth.users a ON u.id = a.id
ORDER BY u.created_at DESC;
```

### Paso 3: Probar el Registro

1. Ve a http://localhost:5174/register
2. Regístrate con un nuevo email
3. Confirma el email
4. Intenta iniciar sesión
5. ¡Debería funcionar ahora!

## Verificación del Trigger

### Verificar que el Trigger Existe

Ejecuta este SQL:

```sql
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Deberías ver: `on_auth_user_created | auth.users`

### Verificar que la Función Existe

```sql
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';
```

Deberías ver: `handle_new_user | FUNCTION`

### Verificar Políticas RLS

```sql
SELECT
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'users';
```

Deberías ver 3 políticas para la tabla `users`.

## Solución para Usuarios Ya Existentes

Si ya registraste usuarios antes del fix, el SQL del Paso 1 ya creó sus perfiles automáticamente. Pero si prefieres hacerlo manualmente:

### Opción A: Ejecutar SQL Manual para Usuarios Existentes

```sql
DO $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN
        SELECT id, email, raw_user_meta_data
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.users)
    LOOP
        INSERT INTO public.users (id, email, full_name, phone, role)
        VALUES (
            auth_user.id,
            auth_user.email,
            COALESCE(auth_user.raw_user_meta_data->>'full_name', 'Usuario'),
            COALESCE(auth_user.raw_user_meta_data->>'phone', 'Sin teléfono'),
            'user'
        );
        RAISE NOTICE 'Created profile for user: %', auth_user.email;
    END LOOP;
END $$;
```

### Opción B: Crear Perfil Individualmente

Para cada usuario que no tenga perfil:

```sql
-- Primero encuentra el UUID del usuario en auth.users
SELECT id, email FROM auth.users WHERE email = 'email_del_usuario';

-- Usa ese UUID para crear el perfil
INSERT INTO public.users (id, email, full_name, phone, role)
VALUES (
    'UUID_DEL_USUARIO_DE_AUTH',
    'email_del_usuario',
    'Nombre del Usuario',
    '1234567890',
    'user'
);
```

## Solución en el Frontend (Fallback)

He actualizado `AuthContext.tsx` para que si el perfil no existe al iniciar sesión, intente crearlo automáticamente. Esto significa que:

1. Usuario se registra (auth.users)
2. Si el trigger falla, el perfil no se crea
3. Al iniciar sesión, el sistema detecta que falta el perfil
4. **El sistema crea el perfil automáticamente**
5. Usuario puede acceder al dashboard

## Verificación Completa

### Paso 1: Verificar en auth.users

```sql
SELECT
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### Paso 2: Verificar en public.users

```sql
SELECT
    id,
    email,
    full_name,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;
```

### Paso 3: Verificar que Coinciden

```sql
-- Usuarios en auth pero NO en public
SELECT
    a.id,
    a.email,
    'Missing in public.users' as issue
FROM auth.users a
WHERE a.id NOT IN (SELECT id FROM public.users);

-- Si esta query devuelve resultados, hay usuarios sin perfil
```

## Debugging Avanzado

### Ver Logs de Supabase

1. Ve a tu proyecto en Supabase
2. **Logs** → **Database**
3. Busca errores relacionados con `handle_new_user`
4. Busca errores de RLS

### Probar el Trigger Manualmente

```sql
-- Probar la función manualmente
SELECT public.handle_new_user()
FROM (
    SELECT
        'test-uuid'::uuid as id,
        'test@example.com' as email,
        '{"full_name": "Test User", "phone": "1234567890"}'::jsonb as raw_user_meta_data
) as auth_users
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'test@example.com');
```

### Verificar la Configuración de RLS

```sql
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users'
AND schemaname = 'public';
```

Debería mostrar `users | true`

## Solución de Problemas Específicos

### Error: "relation "auth.users" does not exist"

Este error ocurre cuando intentas crear el trigger pero no tienes permiso para acceder a `auth.users`.

**Solución:**
1. Asegúrate de que estás usando el usuario de servicio (service role)
2. Ve a Settings → Database → Connection string
3. Copia la connection string del "service_role"
4. Úsala para ejecutar el SQL

### Error: "permission denied for table auth.users"

Similar al anterior, necesitas permisos de servicio.

**Solución:**
Usa el "service_role" secret de Supabase para ejecutar el SQL del trigger.

### El Trigger No Funciona

Si después de todo el trigger no funciona:

**Opción 1: Desactivar RLS temporalmente**

```sql
ALTER TABLE users NO ROW LEVEL SECURITY;

-- Probar registro

-- Reactivar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**Opción 2: Usar el servicio REST de Supabase**

En lugar de usar el trigger, usa el servicio de auth de Supabase para crear el perfil.

**Opción 3: Crear perfil manualmente**

Usa el SQL de "Opción B: Crear Perfil Individualmente" para cada usuario.

## Checklist de Verificación

Antes de probar en producción:

- [ ] Ejecutar SQL completo del trigger
- [ ] Verificar que trigger existe
- [ ] Verificar que función existe
- [ ] Verificar políticas RLS
- [ ] Probar registro de nuevo usuario
- [ ] Verificar que el usuario aparezca en `public.users`
- [ ] Probar inicio de sesión
- [ ] Probar acceso al dashboard
- [ ] Crear perfiles para usuarios existentes
- [ ] Verificar que todos los usuarios tengan perfil

## Resumen del Fix

1. ✅ Trigger recreado con mejor manejo de errores
2. ✅ Función del trigger mejorada con logging
3. ✅ Políticas RLS corregidas
4. ✅ Perfiles de usuarios existentes creados automáticamente
5. ✅ Fallback en frontend para crear perfiles faltantes
6. ✅ Verificación completa de configuración

El flujo de registro ahora debería funcionar perfectamente. Los usuarios se crearán automáticamente tanto en `auth.users` como en `public.users`.
