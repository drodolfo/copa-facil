-- PASO 6: Verificar que todo está configurado correctamente

-- Verificar trigger
SELECT
    'Trigger Check' as check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
        THEN '✅ Trigger EXISTS'
        ELSE '❌ Trigger NOT FOUND'
    END as result;

-- Verificar función
SELECT
    'Function Check' as check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace)
        THEN '✅ Function EXISTS'
        ELSE '❌ Function NOT FOUND'
    END as result;

-- Verificar políticas RLS
SELECT
    'RLS Policies Check' as check_type,
    COUNT(*) as policy_count,
    CASE
        WHEN COUNT(*) = 3 THEN '✅ 3 policies found (correct)'
        ELSE '⚠️ Found ' || COUNT(*) || ' policies (expected 3)'
    END as result
FROM pg_policies
WHERE tablename = 'users';

-- Verificar usuarios en ambas tablas
SELECT
    'Users Count Check' as check_type,
    COUNT(*) as users_in_public,
    '✅ Users in public.users table' as result
FROM public.users;

-- Mostrar los últimos 5 usuarios creados
SELECT
    'Recent Users' as check_type,
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 5;
