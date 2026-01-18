# Configuración Rápida de Copa Fácil

## Pasos para poner en marcha el proyecto:

### 1. Configurar Supabase
1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Ve a "SQL Editor" en el panel lateral
4. Abre el archivo `supabase/schema.sql` y ejecuta todo el contenido
5. Ve a Settings > API y copia:
   - Project URL
   - anon public key

### 2. Configurar Variables de Entorno
Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Iniciar el Proyecto

```bash
# Instalar dependencias (ya hecho)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Crear Usuario Administrador

1. Regístrate en la aplicación con tu email y contraseña
2. Ve al SQL Editor de Supabase
3. Ejecuta el siguiente SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu_email@example.com';
```

Reemplaza `tu_email@example.com` con el email que usaste para registrarte.

### 5. Usar la Aplicación

**Como Usuario:**
- Inicia sesión con tu cuenta
- Explora los torneos disponibles
- Mira la tabla de posiciones
- Contacta a otros jugadores

**Como Administrador:**
- Entra a la sección "Admin" en el menú
- Crea un torneo nuevo
- Añade equipos al torneo
- Programa partidos
- Actualiza resultados

## Resumen de Funcionalidades

### Usuarios
- ✅ Registro e inicio de sesión
- ✅ Perfil personal
- ✅ Ver torneos
- ✅ Ver partidos
- ✅ Ver contactos
- ✅ Tabla de posiciones

### Administradores
- ✅ Crear torneos
- ✅ Gestionar equipos
- ✅ Programar partidos
- ✅ Actualizar resultados
- ✅ Tabla de posiciones automática
- 🚧 Eliminatorias (en desarrollo)

## Solución de Problemas Comunes

### Error de conexión con Supabase
- Verifica que las variables de entorno estén correctas en `.env.local`
- Asegúrate de que el proyecto de Supabase esté activo
- Revisa que hayas ejecutado el archivo `schema.sql` en el SQL Editor

### No puedo ver la pestaña de Admin
- Verifica que tu usuario tenga el rol 'admin' en la base de datos
- Ejecuta: `SELECT * FROM users;` para ver los roles

### La tabla de posiciones no se actualiza
- Asegúrate de que los partidos estén marcados como "completed"
- Verifica que el torneo tenga partidos con resultados

## Archivos Importantes

- `src/App.tsx` - Configuración de rutas
- `src/context/AuthContext.tsx` - Manejo de autenticación
- `src/services/` - Servicios de Supabase
- `supabase/schema.sql` - Esquema de base de datos
- `tailwind.config.js` - Configuración de Tailwind
