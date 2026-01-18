-- PASO 5: Crear perfiles para usuarios que ya existen en auth.users pero no en public.users
DO $$
DECLARE
    auth_user RECORD;
    user_count INTEGER := 0;
BEGIN
    -- Contar usuarios sin perfil
    SELECT COUNT(*) INTO user_count
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users);

    RAISE NOTICE 'Found % users without profiles', user_count;

    -- Crear perfiles para usuarios existentes
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
        user_count := user_count - 1;
    END LOOP;

    RAISE NOTICE 'Finished creating user profiles';
END $$;

-- Mensaje: Perfiles de usuarios existentes creados correctamente
