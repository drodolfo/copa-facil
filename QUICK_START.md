# 🚀 Guía Rápida de Despliegue - Copa Fácil

## Paso 1: Crear Repositorio en GitHub
1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `copa-facil`
3. Crea el repositorio

## Paso 2: Subir a GitHub
```bash
# Reemplaza TU_USERNAME con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USERNAME/copa-facil.git
git push -u origin main
```

## Paso 3: Desplegar en Vercel
1. Ve a [vercel.com](https://vercel.com) y regístrate con GitHub
2. Haz clic en "Add New Project"
3. Selecciona el repositorio `copa-facil`
4. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu clave de Supabase
5. Haz clic en "Deploy"

## ¡Listo! 🎉

Tu aplicación estará en línea en unos minutos.

## Para Actualizar
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel desplegará automáticamente.

## URL de Despliegue
Vercel te dará una URL como: `https://copa-facil.vercel.app`

Para más detalles, consulta `DEPLOYMENT.md`.
