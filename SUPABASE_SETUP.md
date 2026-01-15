# Supabase Setup Guide

## Cara Setup Supabase untuk Vagabond

### 1. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com)
2. Sign up / Login
3. Klik "New Project"
4. Masukkan:
   - Name: `vagabond-app` (atau nama lain)
   - Database Password: Simpan password dengan baik!
   - Region: Pilih terdekat dengan lokasi user (Asia Southeast untuk Indonesia)

### 2. Jalankan Schema SQL

Setelah project dibuat:

1. Buka Supabase Dashboard
2. Navigasi ke **SQL Editor** (ikon SQL di sidebar)
3. Klik "New Query"
4. Copy semua isi dari file `supabase-schema.sql`
5. Paste dan klik "Run" untuk menjalankan

Schema akan membuat:
- **profiles**: User profile (extends auth.users)
- **itineraries**: Data itinerary tersimpan
- **credit_transactions**: Riwayat transaksi credit
- **activity_suggestions**: Cache untuk AI suggestions
- RLS Policies untuk keamanan data
- Triggers otomatis (create profile on signup, timestamps, dll)

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Dapatkan URL dan Anon Key dari:
- Supabase Dashboard → Settings → API

### 4. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 5. Setup Supabase Client

Buat file `utils/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 6. Contoh Penggunaan

#### Autentikasi

```typescript
import { supabase } from '@/utils/supabaseClient'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'traveler123'
    }
  }
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

#### Simpan Itinerary

```typescript
import { supabase } from '@/utils/supabaseClient'
import { Itinerary } from './types'

const saveItinerary = async (itinerary: Itinerary) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('itineraries')
    .insert({
      user_id: user.id,
      title: itinerary.title,
      destination: itinerary.destination,
      origin: itinerary.originalPrefs?.origin,
      total_days: itinerary.totalDays,
      budget_level: itinerary.budgetLevel,
      travel_style: itinerary.originalPrefs?.travelStyle,
      travelers: itinerary.originalPrefs?.travelers || 1,
      transport_mode: itinerary.originalPrefs?.transportMode,
      summary: itinerary.summary,
      weather_forecast: itinerary.weatherForecast,
      playlist_vibe: itinerary.playlistVibe,
      itinerary_data: {
        days: itinerary.days
      },
      estimated_cost: itinerary.estimatedCost,
      packing_list: itinerary.packingList,
      local_phrases: itinerary.localPhrases,
      travel_advisories: itinerary.travelAdvisories || []
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Load Itineraries User

```typescript
const loadUserItineraries = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

#### Deduct Credits

```typescript
const deductCredits = async (amount: number) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Start transaction
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError
  if (!profile || profile.credits < amount) throw new Error('Insufficient credits')

  // Deduct credits
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: profile.credits - amount })
    .eq('id', user.id)

  if (updateError) throw updateError

  // Record transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: user.id,
      amount: -amount,
      type: 'trip_generation',
      description: 'Itinerary generation'
    })

  if (transactionError) throw transactionError

  return true
}
```

#### Update Profile

```typescript
const updateProfile = async (updates: { username?: string, full_name?: string }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

#### Get User Stats

```typescript
const getUserStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}
```

### 7. Migration dari Local Storage ke Supabase

Untuk menghapus dependency `localStorage`:

**Hapus atau komentari kode localStorage:**
```typescript
// Hapus ini
const saved = localStorage.getItem('vagabond_saved_itineraries')
if (saved) {
  setSavedTrips(JSON.parse(saved))
}
```

**Ganti dengan Supabase:**
```typescript
useEffect(() => {
  if (isOpen && user.isLoggedIn) {
    loadUserItineraries().then(trips => {
      setSavedTrips(trips)
    }).catch(err => {
      console.error('Failed to load itineraries:', err)
    })
  }
}, [isOpen, user.isLoggedIn])
```

### 8. Testing di SQL Editor

Setelah menjalankan schema, test dengan query ini:

```sql
-- Cek tabel yang dibuat
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test insert user (ini akan otomatis dibuat saat signup)
-- Setelah signup di auth, cek profile:
SELECT * FROM profiles;

-- Test insert itinerary (ganti dengan user_id yang valid)
SELECT id FROM profiles LIMIT 1;  -- ambil user_id

INSERT INTO itineraries (
  user_id, title, destination, total_days, budget_level,
  itinerary_data, estimated_cost
) VALUES (
  'user-id-dari-query-atas',
  'Test Trip',
  'Bali',
  5,
  'Moderate',
  '{"days": []}'::jsonb,
  '{"total": "5000", "accommodation": "2000", "food": "1500", "activities": "1000", "transport": "500", "flights": "0", "explanation": "Test"}'::jsonb
);
```

### 9. Storage Opsional (untuk upload avatar)

Jika ingin fitur upload avatar:

1. Buat bucket `avatars` di Supabase Storage
2. Setup RLS policy untuk bucket
3. Tambah kolom `avatar_url` di tabel `profiles`

SQL untuk bucket policy:
```sql
-- Allow authenticated users to upload their avatar
INSERT INTO storage.policies (name, definition, role, bucket_id, operations)
VALUES (
  'Users can upload their avatar',
  'auth.uid()::text = (storage.foldername(name))[1]',
  'authenticated',
  'avatars',
  ARRAY['INSERT']
);

-- Allow public read access to avatars
INSERT INTO storage.policies (name, definition, role, bucket_id, operations)
VALUES (
  'Public can view avatars',
  'true',
  'authenticated',
  'avatars',
  ARRAY['SELECT']
);
```

### Troubleshooting

**Error: "relation does not exist"**
- Pastikan schema sudah dijalankan di SQL Editor
- Cek nama tabel dengan query: `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`

**RLS Policy Error**
- Pastikan user sudah login dengan `supabase.auth.signInWithPassword()`
- Cek user id: `const { data: { user } } = await supabase.auth.getUser()`

**Credits tidak berkurang**
- Pastikan transaksi berjalan dalam satu flow (deduct → insert transaction)
- Cek di table `credit_transactions` dan `profiles`

### Next Steps

1. Integrasikan Supabase auth dengan login form
2. Ganti localStorage dengan Supabase queries
3. Implement real-time updates (opsional)
4. Setup proper error handling di UI
5. Add loading states untuk async operations
