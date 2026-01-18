# 🔧 Guía Paso a Paso - Solución de Registro de Usuarios

## Problema

El usuario se registra y recibe email de confirmación, pero:
- ❌ El usuario NO aparece en la tabla `public.users`
- ❌ Al iniciar sesión: "Invalid login credentials"
- ✅ El usuario SÍ aparece en `auth.users`

## Solución - Ejecutar Scripts en Orden

Ejecuta cada paso por separado en el **SQL Editor** de Supabase.

---

## 📋 PASO 1: Eliminar Trigger Existente

1. Ve a tu proyecto en Supabase
2. **SQL Editor** → **New Query**
3. Copia el contenido del archivo `supabase/step1_drop_trigger.sql`
4. Haz clic en **Run**
5. Deberías ver: "Trigger eliminado correctamente"

**¿Qué hace este paso?**
Elimina el trigger antiguo que no funcionaba correctamente.

---

## 📋 PASO 2: Crear Función del Trigger

1. **New Query** (nueva consulta)
2. Copia el contenido del archivo `supabase/step2_create_function.sql`
3. Haz clic en **Run**
4. Deberías ver: "Función creada correctamente"

**¿Qué hace este paso?**
Crea una nueva función con mejor manejo de errores para crear perfiles automáticamente.

---

## 📋 PASO 3: Crear el Trigger

1. **New Query** (nueva consulta)
2. Copia el contenido del archivo `supabase/step3_create_trigger.sql`
3. Haz clic en **Run**
4. Deberías ver: "Trigger creado correctamente"

**¿Qué hace este paso?**
Conecta la función al evento de crear usuario en `auth.users`.

---

## 📋 PASO 4: Corregir Políticas RLS

1. **New Query** (nueva consulta)
2. Copia el contenido del archivo `supabase/step4_fix_rls.sql`
3. Haz clic en **Run**
4. Deberías ver: "Políticas RLS actualizadas correctamente"

**¿Qué hace este paso?**
Actualiza las políticas de seguridad para permitir la inserción automática de perfiles.

---

## 📋 PASO 5: Crear Perfiles para Usuarios Existentes

1. **New Query** (nueva consulta)
2. Copia el contenido del archivo `supabase/step5_create_existing_profiles.sql`
3. Haz clic en **Run**
4. Deberías ver mensajes como: "Found X users without profiles" y "Created profile for user: email"

**¿Qué hace este paso?**
Crea perfiles automáticamente para usuarios que ya se registraron pero no tienen perfil en `public.users`.

---

## 📋 PASO 6: Verificar Configuración

1. **New Query** (nueva consulta)
2. Copia el contenido del archivo `supabase/step6_verify.sql`
3. Haz clic en **Run**
4. Deberías ver varios checks con ✅

**¿Qué debería mostrar?**
- ✅ Trigger EXISTS
- ✅ Function EXISTS
- ✅ 3 policies found (correct)
- ✅ Users in public.users table
- Lista de usuarios recientes creados

---

## ✅ Verificación Final

### 1. Verificar Usuarios en Ambas Tablas

Ejecuta este SQL:

```sql
-- Usuarios en auth.users (autenticación)
SELECT
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

```sql
-- Usuarios en public.users (perfiles)
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

**Los usuarios deberían aparecer en ambas tablas.**

### 2. Verificar que Coinciden

```sql
-- Usuarios que están en auth pero NO en public
SELECT
    a.id,
    a.email,
    'Missing profile in public.users' as issue
FROM auth.users a
WHERE a.id NOT IN (SELECT id FROM public.users);

-- Debería devolver 0 resultados
```

### 3. Probar Registro de Usuario

1. Ve a http://localhost:5174/register
2. Regístrate con un nuevo email
3. Confirma el email
4. Intenta iniciar sesión
5. **¡Debería funcionar!**

### 4. Verificar en Base de Datos

Después de registrar un nuevo usuario, ejecuta:

```sql
SELECT
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 1;

-- Debería mostrar el nuevo usuario
```

---

## 🔧 Solución de Problemas

### Error en PASO 1: "permission denied for table auth.users"

**Causa:** No tienes permisos para acceder a `auth.users`.

**Solución:**
1. Necesitas permisos de administrador en Supabase
2. Usa el "service_role" para ejecutar estos scripts
3. Ve a Settings → Database → Connection string
4. Copia la connection string del "service_role"

### Error en PASO 2: "function already exists"

**Solución:** Está bien, significa que la función ya existe. Continúa al paso 3.

### Error en PASO 5: No se crean perfiles para usuarios existentes

**Verifica:**
1. Ejecuta PASO 6 (verificar)
2. Si no aparecen usuarios, prueba crear un perfil manualmente:

```sql
-- Crear perfil manual para un usuario específico
-- Primero encuentra el UUID del usuario
SELECT id, email FROM auth.users WHERE email = 'email_del_usuario';

-- Luego crea el perfil con ese UUID
INSERT INTO public.users (id, email, full_name, phone, role)
VALUES (
    'UUID_DEL_USUARIO',
    'email_del_usuario',
    'Nombre del Usuario',
    '1234567890',
    'user'
);
```

### El Trigger No Funciona Después de Todos los Pasos

**Solución:** Revisa los logs de Supabase:

1. Ve a tu proyecto en Supabase
2. **Logs** → **Database**
3. Busca errores relacionados con `handle_new_user`

---

## 📊 Flujo Completo Después del Fix

### Registro de Usuario (Después del Fix)
```
1. Usuario se registra en la aplicación
   ↓
2. Supabase crea usuario en auth.users
   ↓
3. Trigger detecta nuevo usuario
   ↓
4. Trigger llama función handle_new_user()
   ↓
5. Función inserta automáticamente en public.users
   ↓
6. ✅ Perfil creado exitosamente
   ↓
7. Usuario confirma email (si está activado)
   ↓
8. Usuario inicia sesión
   ↓
9. Sistema carga perfil desde public.users
   ↓
10. ✅ Usuario accede al dashboard
```

### Fallback en Frontend
Si el trigger falla por alguna razón:

```
1. Usuario inicia sesión
   ↓
2. Sistema detecta que no hay perfil
   ↓
3. Sistema crea el perfil automáticamente
   ↓
4. ✅ Usuario puede acceder
```

---

## 📚 Scripts Disponibles

| Archivo | Descripción |
|---------|-------------|
| `supabase/step1_drop_trigger.sql` | Eliminar trigger antiguo |
| `supabase/step2_create_function.sql` | Crear nueva función del trigger |
| `supabase/step3_create_trigger.sql` | Crear el trigger |
| `supabase/step4_fix_rls.sql` | Corregir políticas RLS |
| `supabase/step5_create_existing_profiles.sql` | Crear perfiles para usuarios existentes |
| `supabase/step6_verify.sql` | Verificar configuración |

---

## 🎯 Checklist de Completado

Antes de probar el registro:

- [ ] PASO 1 completado (trigger eliminado)
- [ ] PASO 2 completado (función creada)
- [ ] PASO 3 completado (trigger creado)
- [ ] PASO 4 completado (políticas RLS corregidas)
- [ ] PASO 5 completado (perfiles de usuarios existentes creados)
- [ ] PASO 6 completado (verificación exitosa)
- [ ] Usuarios aparecen en `public.users`
- [ ] Trigger existe en `auth.users`
- [ ] Función existe en `public`
- [ ] 3 políticas RLS configuradas
- [ ] Nuevo usuario se puede registrar
- [ ] Usuario puede iniciar sesión
- [ ] Usuario puede acceder al dashboard

---

## 🚀 Prueba Final

1. **Registrar nuevo usuario:**
   - Ve a http://localhost:5174/register
   - Regístrate con email nuevo
   - Confirma email

2. **Iniciar sesión:**
   - Ve a http://localhost:5174/login
   - Ingresa credenciales
   - Deberías acceder al dashboard

3. **Verificar en base de datos:**
   - Ejecuta PASO 6
   - Deberías ver el nuevo usuario

---

## 📞 Soporte

Si después de todos los pasos el problema persiste:

1. Revisa los logs de Supabase
2. Verifica la consola del navegador (F12)
3. Ejecuta cada paso nuevamente
4. Consulta la documentación de Supabase: https://supabase.com/docs

---

## Resumen

✅ 6 pasos para corregir el problema
✅ Scripts separados para ejecutar fácilmente
✅ Verificación completa de la configuración
✅ Perfiles de usuarios existentes creados automáticamente
✅ Trigger recreado con mejor manejo de errores
✅ Políticas RLS corregidas

El flujo de registro debería funcionar perfectamente después de ejecutar estos 6 pasos.
