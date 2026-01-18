-- PASO 1: Eliminar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Mensaje: Trigger eliminado correctamente
