# Copa Fácil - Sistema de Gestión de Torneos de Fútbol

Aplicación web completa para gestionar torneos de fútbol con React, Tailwind CSS y Supabase.

## Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS v3.4
- **Base de Datos**: Supabase (PostgreSQL)
- **Enrutamiento**: React Router v6
- **Autenticación**: Supabase Auth
- **Despliegue**: Vercel

## 🚀 Despliegue Rápido

### Producción en Vercel

Para desplegar la aplicación en producción, sigue la [Guía de Despliegue](DEPLOYMENT.md) o la [Guía Rápida](QUICK_START.md).

**Resumen rápido:**
1. Sube el código a GitHub
2. Conecta el repositorio con Vercel
3. Configura las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. ¡Despliega!

### URL de Producción
Una vez desplegado, tu aplicación estará disponible en una URL como: `https://copa-facil.vercel.app`

## Características

### Para Usuarios
- Registro e inicio de sesión
- Perfil de usuario personalizable
- Visualización de torneos activos
- Tabla de posiciones en tiempo real
- Directorio de contactos de otros usuarios
- Información detallada de partidos

### Para Administradores
- Creación y gestión de torneos
- Registro y gestión de equipos
- Programación de partidos
- Actualización de resultados
- Gestión de tabla de posiciones
- Gestión de fases eliminatorias (en desarrollo)

## Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase (gratuita en https://supabase.com)

### Configuración de Supabase

1. Crea un nuevo proyecto en Supabase
2. Ve al SQL Editor en tu panel de Supabase
3. Ejecuta el contenido del archivo `supabase/schema.sql` para crear las tablas
4. Copia las credenciales desde Settings > API

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_supabase_project_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Instalación del Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Configuración del Usuario Administrador

Después de crear un usuario en la aplicación, debes actualizar su rol a administrador ejecutando este SQL en el editor de Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'tu_email@example.com';
```

**Importante:** El sistema ahora lee el rol directamente de la tabla `users` de la base de datos, por lo que los cambios de rol se reflejarán inmediatamente en la aplicación después de refrescar la página.

Para verificar que el usuario tiene el rol correcto:

```sql
SELECT id, email, full_name, role FROM users WHERE email = 'tu_email@example.com';
```

## Estructura del Proyecto

```
copa-facil/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── context/         # Contextos de React
│   │   └── AuthContext.tsx
│   ├── lib/            # Utilidades y configuraciones
│   │   └── supabase.ts
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── Dashboard.tsx
│   │   └── Admin.tsx
│   ├── services/       # Servicios de Supabase
│   │   ├── userService.ts
│   │   ├── tournamentService.ts
│   │   ├── teamService.ts
│   │   ├── matchService.ts
│   │   └── standingsService.ts
│   └── types/          # Tipos TypeScript
│       └── index.ts
├── supabase/           # Archivos de Supabase
│   └── schema.sql      # Esquema de base de datos
└── public/             # Archivos estáticos
```

## Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Compila para producción
npm run preview      # Previsualiza la compilación de producción
npm run lint         # Ejecuta ESLint
```

## Uso de la Aplicación

### Registro de Usuario
1. Ve a la página de registro
2. Completa el formulario con tus datos
3. Inicia sesión con tus credenciales

### Para Administradores
1. Ingresa al panel de administración
2. Crea un torneo nuevo
3. Añade equipos al torneo
4. Programa partidos
5. Actualiza resultados para actualizar la tabla de posiciones automáticamente

## Funcionalidades Futuras

- [ ] Sistema de eliminatorias completo
- [ ] Estadísticas detalladas de jugadores
- [ ] Notificaciones en tiempo real
- [ ] Carga de imágenes para equipos y torneos
- [ ] Generación de reportes PDF
- [ ] Móvil nativo (React Native)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## Licencia

MIT License - Siéntete libre de usar este proyecto para tus propios propósitos.
