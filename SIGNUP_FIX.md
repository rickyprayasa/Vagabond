# Solusi Perbaikan Sign Up

## Masalah: "Database error saving new user"

### Langkah Perbaikan:

## 1. Jalankan Fixed Schema di Supabase

Buka Supabase Dashboard → SQL Editor, lalu jalankan isi file `supabase-schema-fixed.sql`

File ini berisi perbaikan:
- ✅ Drop trigger/function yang lama untuk menghindari konflik
- ✅ Error handling yang lebih baik di trigger
- ✅ Cek duplicate profile sebelum insert
- ✅ Handle UNIQUE violation secara graceful

## 2. Setup Email Confirmation di Supabase

**Opsional tapi disarankan untuk security:**

### Option A: Matikan Email Confirmation (untuk testing)
1. Buka Supabase Dashboard
2. Authentication → Providers → Email
3. Matikan "Confirm email"
4. Simpan

### Option B: Biarkan Email Confirmation (production recommended)
1. Pastikan email confirmation di-enable
2. Set email redirect URL: `http://localhost:3000` (untuk dev)
3. User harus cek email setelah sign up

## 3. Test Sign Up Flow

### Jika Email Confirmation DIOFF:
```
Sign Up → User langsung login → Profile terbuka otomatis
```

### Jika Email Confirmation ON:
```
Sign Up → "Please check your email" → User cek email → Klik link → Login
```

## 4. Debug Jika Masih Gagal

### Check di Browser Console:
```javascript
// Buka browser console dan jalankan:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_URL', 'YOUR_ANON_KEY')

// Test signup
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
})

console.log('Auth result:', data, error)
```

### Check di Supabase SQL Editor:
```sql
-- Cek apakah user terbuaat
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Cek apakah profile terbuat
SELECT id, email, username, credits
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- Cek trigger functions
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%';
```

### Check di Supabase Logs:
1. Dashboard → Database → Logs
2. Filter: POSTGRES
3. Cari error terkait profiles atau auth

## 5. Manual Fix Jika Profile Gagal Terbuat

Jika user terbuat tapi profile tidak:

```sql
-- Cari user tanpa profile
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Manual create profile untuk user yang terproblem
INSERT INTO profiles (id, email, username, credits)
SELECT
  id,
  email,
  split_part(email, '@', 1) as username,
  10
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## 6. Common Issues & Solutions

### Issue: "User already registered"
**Solusi:** Email sudah terdaftar, user harus login bukan sign up lagi

### Issue: "Invalid login credentials"
**Solusi:** Password salah, coba reset password atau login dengan email yang benar

### Issue: "Database error saving new user"
**Solusi:**
1. Pastikan schema fixed sudah dijalankan
2. Cek logs di Supabase Dashboard
3. Pastikan trigger `handle_new_user` berjalan

### Issue: User login tapi credits = 0
**Solusi:**
```sql
-- Update credits untuk user yang salah
UPDATE profiles
SET credits = 10
WHERE credits = 0 OR credits IS NULL;
```

## 7. Test Checklist

- [ ] Run `supabase-schema-fixed.sql` di SQL Editor
- [ ] Setup email confirmation (on/off)
- [ ] Sign up dengan email baru
- [ ] Check auth.users di Supabase
- [ ] Check profiles table di Supabase
- [ ] Cek browser console untuk error
- [ ] Cek Supabase logs untuk error
- [ ] Login dan cek credits
- [ ] Generate itinerary
- [ ] Save itinerary
- [ ] Logout dan login kembali

## 8. Environment Variables

Pastikan `.env.local` sudah terisi:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key
```

## 9. Next Steps

Setelah sign up berhasil:
1. Generate itinerary → Deduct 5 credits
2. Save itinerary ke database
3. Buka profile untuk melihat saved trips
4. Load itinerary dari profile
5. Test semua CRUD operations
