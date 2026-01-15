-- Debug Script untuk Sign Up Issues
-- Jalankan ini di Supabase SQL Editor untuk debugging

-- 1. Cek recent signups
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Cek recent profiles
SELECT
  id,
  email,
  username,
  credits,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Cek users tanpa profile
SELECT
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Manual create profile untuk orphan users (users tanpa profile)
INSERT INTO profiles (id, email, username, credits, full_name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  10,
  COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Fix credits untuk users dengan 0 credits
UPDATE profiles
SET credits = 10
WHERE credits = 0 OR credits IS NULL;

-- 6. Check trigger functions
SELECT
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- 7. Check triggers
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('auth.users', 'profiles')
ORDER BY trigger_name;

-- 8. Check RLS policies
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
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'itineraries', 'credit_transactions')
ORDER BY tablename, policyname;

-- 9. Test insert profile manually (GANTI user_id dengan valid UUID dari auth.users)
-- Copy user_id dari query #1, lalu jalankan:

-- INSERT INTO profiles (id, email, username, credits)
-- VALUES (
--   'COPY-USER-ID-HERE',
--   'test@example.com',
--   'testuser',
--   10
-- );

-- 10. Cek log error terkait (jika ada extension pg_stat_statements)
SELECT
  query,
  calls,
  total_time,
  rows
FROM pg_stat_statements
WHERE query LIKE '%profiles%'
ORDER BY total_time DESC
LIMIT 10;
