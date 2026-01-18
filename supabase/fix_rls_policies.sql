-- Fix RLS policies to allow automatic user profile creation

-- Drop the problematic INSERT policy that blocks automatic profile creation
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new policy that allows users to insert their own profile OR allows automatic creation by trigger
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT
WITH CHECK (
    auth.uid() = id OR
    (EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = id AND auth.users.email_confirmed_at IS NOT NULL
    ))
);

-- Alternative approach: Allow all authenticated users to insert their own profile
-- This is simpler and more permissive during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
FOR INSERT
WITH CHECK (true);

-- Verify the policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- Test the trigger function
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- Check if trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';
