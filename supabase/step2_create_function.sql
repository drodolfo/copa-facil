-- PASO 2: Crear función del trigger con mejor manejo de errores
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
        -- Log del error para debugging (no fallar el trigger)
        RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
        -- Continuar para que el usuario se pueda crear en auth
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje: Función creada correctamente
