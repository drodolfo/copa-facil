# Guía de Despliegue en Producción - GitHub y Vercel

## Paso 1: Configurar Repositorio en GitHub

### Opción A: Usando la interfaz de GitHub (Recomendado)

1. Ve a [https://github.com/new](https://github.com/new)
2. Crea un nuevo repositorio con las siguientes opciones:
   - **Repository name**: `copa-facil`
   - **Description**: Sistema de Gestión de Torneos de Fútbol
   - **Public/Private**: Elige según tus preferencias
   - **NO marcar** "Initialize this repository with a README" (ya tenemos uno)
3. Haz clic en "Create repository"

### Opción B: Usando GitHub CLI (si está instalado)

```bash
gh repo create copa-facil --public --source=. --description "Sistema de Gestión de Torneos de Fútbol"
```

## Paso 2: Conectar y Subir a GitHub

Después de crear el repositorio en GitHub, ejecuta estos comandos:

```bash
# Añadir el repositorio remoto (reemplaza TU_USERNAME con tu nombre de usuario de GitHub)
git remote add origin https://github.com/TU_USERNAME/copa-facil.git

# Cambiar la rama principal a 'main'
git branch -M main

# Subir los archivos a GitHub
git push -u origin main
```

## Paso 3: Configurar Vercel

### 3.1 Crear Cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Regístrate usando tu cuenta de GitHub
3. Autoriza a Vercel a acceder a tus repositorios

### 3.2 Importar el Proyecto

1. En Vercel, haz clic en "Add New Project"
2. Busca y selecciona el repositorio `copa-facil`
3. Configura el proyecto:

#### Configuración del Build

- **Framework Preset**: Vite
- **Root Directory**: `.` (raíz del proyecto)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.3 Configurar Variables de Entorno

En la sección "Environment Variables", añade las siguientes variables:

**Obligatorias:**
- `VITE_SUPABASE_URL`: Tu URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase

Estos valores están en tu archivo `.env.local` local.

### 3.4 Desplegar

1. Haz clic en "Deploy"
2. Espera a que termine el proceso de construcción
3. Vercel te proporcionará una URL para tu aplicación

## Paso 4: Configurar la Base de Datos en Producción

### 4.1 Verificar Supabase

Asegúrate de que tu proyecto de Supabase esté configurado correctamente:

1. Ve a tu proyecto en Supabase
2. Verifica que el esquema esté ejecutado (`supabase/schema.sql`)
3. Asegúrate de que las políticas RLS están configuradas
4. Verifica que tengas las credenciales correctas para producción

### 4.2 Configurar Usuario Administrador en Producción

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'diego.merclib@gmail.com';
```

## Paso 5: Configurar Dominio Personalizado (Opcional)

Si deseas usar un dominio personalizado:

1. En el dashboard de Vercel, ve a "Settings"
2. Haz clic en "Domains"
3. Añade tu dominio
4. Sigue las instrucciones para configurar los registros DNS

## Paso 6: Monitoreo y Mantenimiento

### Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# Añadir cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

Vercel detectará automáticamente los cambios y hará un nuevo despliegue.

### Ver Despliegues

En el dashboard de Vercel puedes:
- Ver el historial de despliegues
- Revisar logs de construcción
- Ver métricas de rendimiento
- Revertir a versiones anteriores

## Consideraciones de Seguridad

### Variables de Entorno

- **NUNCA** subas archivos `.env` o `.env.local` a GitHub
- Usa las variables de entorno de Vercel para configuración
- Las variables con prefijo `VITE_` estarán disponibles en el navegador
- Para valores sensibles, usa el backend de Supabase

### Supabase

- Configura políticas RLS (Row Level Security) apropiadas
- Limita el acceso a las tablas según los roles de usuario
- Considera habilitar autenticación de dos factores para administradores
- Revisa regularmente los logs de actividad de Supabase

## Solución de Problemas Comunes

### Error de Despliegue en Vercel

1. Verifica las variables de entorno estén configuradas
2. Revisa los logs de construcción en el dashboard de Vercel
3. Asegúrate de que el comando `npm run build` funcione localmente

### Error de Conexión con Supabase

1. Verifica que las credenciales sean correctas
2. Asegúrate de que el proyecto de Supabase esté activo
3. Revisa las políticas RLS en Supabase
4. Verifica los logs de Supabase

### Estilos No Se Muestran

1. Limpia el caché de Vercel: Deployments → [último despliegue] → Redeploy
2. Verifica que Tailwind esté configurado correctamente
3. Revisa los logs de construcción

## Archivos Importantes

- `package.json` - Dependencias y scripts
- `vite.config.ts` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind
- `src/lib/supabase.ts` - Cliente de Supabase
- `.gitignore` - Archivos excluidos de Git

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación local
npm run preview

# Ver cambios pendientes
git status

# Ver historial de commits
git log --oneline

# Ver ramas
git branch

# Crear nueva rama
git checkout -b nombre-rama
```

## Siguientes Pasos

1. **Configurar dominio personalizado** (opcional)
2. **Habilitar analíticas** en Vercel
3. **Configurar notificaciones** para despliegues fallidos
4. **Implementar tests** automatizados
5. **Configurar CI/CD** con GitHub Actions
6. **Agregar monitoreo de errores** (ej. Sentry)

## Soporte

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
