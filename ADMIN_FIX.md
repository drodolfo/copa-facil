# Solución al problema del rol de usuario no actualizado

## Problema
El usuario diego.merclib@gmail.com se actualizó a 'admin' en la base de datos, pero en el perfil sigue apareciendo como 'user' y no puede acceder al panel de administración.

## Causa del problema
Anteriormente, el sistema leía el rol desde `user_metadata` de Supabase Auth, que no se actualiza automáticamente cuando cambiamos la tabla `users`.

## Solución implementada
He modificado el sistema para leer el rol directamente desde la tabla `users` de la base de datos, lo que garantiza que los cambios se reflejen inmediatamente.

## Cambios realizados

### 1. Actualización de `src/context/AuthContext.tsx`
- Se agregó una interfaz `UserProfile` para representar los datos del usuario en la base de datos
- Se creó una interfaz `ExtendedUser` que combina el usuario de Auth con su perfil
- Se agregó la función `loadUserProfile` que consulta la tabla `users` para obtener el rol actual
- Ahora el sistema carga automáticamente el rol desde la base de datos cada vez que hay cambios

### 2. Actualización de componentes
- `src/components/Navbar.tsx`: Ahora usa `user.profile?.role` en lugar de `user.user_metadata?.role`
- `src/pages/Profile.tsx`: Ahora muestra los datos desde `user.profile`
- `src/pages/Admin.tsx`: Ahora verifica el rol desde `user.profile`

## Pasos para solucionar tu caso específico

1. **Verifica que el usuario tenga el rol correcto en la base de datos:**

   Ejecuta este SQL en el SQL Editor de Supabase:
   ```sql
   SELECT id, email, full_name, role FROM users WHERE email = 'diego.merclib@gmail.com';
   ```

2. **Si el rol no es 'admin', actualízalo:**

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'diego.merclib@gmail.com';
   ```

3. **Cierra sesión y vuelve a iniciar sesión** en la aplicación

4. **Refresca la página** para que el sistema cargue los datos actualizados

## Verificación

Después de estos pasos:
- En el perfil de usuario deberías ver "Rol: Administrador"
- En el navbar debería aparecer el enlace "Admin"
- Deberías poder acceder a `/admin` y gestionar torneos

## Archivos SQL de ayuda

He creado `supabase/check_admin.sql` con consultas SQL para verificar y actualizar el rol del administrador.

## Notas importantes

- Los cambios de rol en la base de datos ahora se reflejan inmediatamente
- No es necesario actualizar `user_metadata` en Supabase Auth
- El sistema carga automáticamente el rol cada vez que hay cambios de autenticación
- Si el problema persiste, verifica en la consola del navegador si hay errores de carga de datos
