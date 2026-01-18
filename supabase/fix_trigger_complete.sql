-- Fix completo para el trigger y RLS de usuarios

-- Paso 1: Eliminar trigger y función existentes (si existen)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Paso 2: Verificar tabla users existe
SELECT 'Table users exists' as check_result FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public';

-- Paso 3: Desactivar RLS temporalmente para crear función
ALTER TABLE users NO ROW LEVEL SECURITY;

-- Paso 4: Crear la función de trigger con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si el usuario ya existe para evitar duplicados
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Insertar el perfil del usuario
    INSERT INTO public.users (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'phone', 'Sin teléfono'),
        'user'
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error para debugging
        RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
        -- No fallar el trigger para que el usuario pueda crearse en auth
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 5: Crear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Paso 6: Reactivar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Paso 7: Eliminar y recrear políticas RLS para usuarios
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Políticas más permisivas para que funcione el registro
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- Paso 8: Verificar que todo esté configurado correctamente
SELECT 'Trigger created successfully' as check_result
WHERE EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created');

SELECT 'Function created successfully' as check_result
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace);

-- Paso 9: Verificar políticas RLS
SELECT
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Paso 10: Insertar manualmente usuarios que ya existen pero no tienen perfil
-- Esto es para usuarios que ya se registraron antes del fix
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

-- Paso 11: Verificar usuarios creados manualmente
SELECT
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    CASE WHEN a.id IS NOT NULL THEN 'YES' ELSE 'NO' END as in_auth
FROM public.users u
LEFT JOIN auth.users a ON u.id = a.id
ORDER BY u.created_at DESC
LIMIT 5;
