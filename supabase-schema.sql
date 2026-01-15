-- Vagabond Travel App - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 10,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 2. ITINERARIES TABLE
-- =====================================================
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin TEXT,
  total_days INTEGER NOT NULL,
  budget_level TEXT NOT NULL,
  travel_style TEXT,
  travelers INTEGER DEFAULT 1,
  transport_mode TEXT,
  summary TEXT,
  weather_forecast TEXT,
  playlist_vibe TEXT,
  itinerary_data JSONB NOT NULL,
  estimated_cost JSONB NOT NULL,
  packing_list JSONB DEFAULT '[]',
  local_phrases JSONB DEFAULT '[]',
  travel_advisories JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT FALSE,
  shared_link_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 3. CREDIT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 4. ACTIVITY SUGGESTIONS (Optional Cache)
-- =====================================================
CREATE TABLE activity_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination TEXT NOT NULL,
  day_theme TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  suggestions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_destination ON itineraries(destination);
CREATE INDEX idx_itineraries_created_at ON itineraries(created_at DESC);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_activity_suggestions_destination ON activity_suggestions(destination);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_suggestions_updated_at BEFORE UPDATE ON activity_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate shared link ID for public itineraries
CREATE OR REPLACE FUNCTION generate_shared_link_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = TRUE AND NEW.shared_link_id IS NULL THEN
    NEW.shared_link_id := encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_shared_link_for_public_itineraries BEFORE INSERT OR UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION generate_shared_link_id();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/write own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Itineraries: Users can read/write own itineraries
CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itineraries"
  ON itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries"
  ON itineraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries"
  ON itineraries FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public itineraries via shared link"
  ON itineraries FOR SELECT
  USING (is_public = TRUE);

-- Credit Transactions: Users can read own transactions
CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activity Suggestions: Read-only for all users
CREATE POLICY "Anyone can view activity suggestions"
  ON activity_suggestions FOR SELECT
  USING (true);

CREATE POLICY "System can insert activity suggestions"
  ON activity_suggestions FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- VIEWS
-- =====================================================

-- View: User statistics
CREATE VIEW user_stats AS
SELECT 
  p.id AS user_id,
  p.username,
  p.credits,
  COUNT(DISTINCT i.id) AS total_itineraries,
  COALESCE(SUM(i.total_days), 0) AS total_days_traveled,
  p.created_at AS member_since
FROM profiles p
LEFT JOIN itineraries i ON p.id = i.user_id
GROUP BY p.id, p.username, p.credits, p.created_at;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample data
/*
INSERT INTO credit_transactions (user_id, amount, type, description)
SELECT 
  id,
  10,
  'welcome_bonus',
  'Welcome bonus for new user'
FROM profiles
WHERE created_at = updated_at;
*/
