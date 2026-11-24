-- ============================================================================
-- RACEPULSE DATABASE SCHEMA FOR SUPABASE (PostgreSQL + RLS + Auto Profile Trigger)
-- Run this entire script inside Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
  phone TEXT DEFAULT '',
  emergency_contact_name TEXT DEFAULT '',
  emergency_contact_phone TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EVENTS / RACES TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'Running',
  categories JSONB NOT NULL DEFAULT '["5K", "10K"]'::jsonb,
  capacity INTEGER NOT NULL DEFAULT 200,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'NPR',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=80',
  schedule_info TEXT DEFAULT '06:00 AM Check-in & Bib Pickup | 07:00 AM Flag Off | 10:30 AM Medal Ceremony',
  route_info TEXT DEFAULT 'Scenic loop course with hydration stations every 2.5km and full medical support.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  participant_phone TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  category TEXT NOT NULL,
  tshirt_size TEXT NOT NULL DEFAULT 'M',
  bib_number TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  medical_notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id, category)
);

-- ============================================================================
-- TRIGGER: Automatically create a profile row when a user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'participant'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTION: Check if current user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

-- Events policies
CREATE POLICY "Public can view non-draft events; admins view all"
  ON public.events FOR SELECT
  USING (status != 'draft' OR public.is_admin());

CREATE POLICY "Only admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update events"
  ON public.events FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete events"
  ON public.events FOR DELETE
  USING (public.is_admin());

-- Registrations policies
CREATE POLICY "Users view own registrations; admins view all"
  ON public.registrations FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can register themselves"
  ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own or admins update all"
  ON public.registrations FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can delete registrations"
  ON public.registrations FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- SAMPLE SEED DATA (3 Events)
-- ============================================================================
INSERT INTO public.events (title, description, event_date, location, sport_type, categories, capacity, price, currency, status, banner_url, schedule_info, route_info)
VALUES
(
  'Kathmandu Valley Trail Half Marathon 2026',
  'Conquer rugged forest singletracks, ridge climbs, and panoramic Himalayan viewpoints in our flagship trail running challenge.',
  NOW() + INTERVAL '24 days',
  'Shivapuri Nagarjun National Park, Kathmandu',
  'Trail Running',
  '["10K Trail", "21K Half Marathon", "42K Ultra"]'::jsonb,
  300,
  1500.00,
  'NPR',
  'open',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1400&q=80',
  '05:30 AM Kit Check | 06:30 AM 42K Start | 07:00 AM 21K & 10K Start | 12:00 PM Awards',
  '920m elevation gain through oak and rhododendron trails. Aid stations at 5km, 11km, and 16km.'
),
(
  'City Night Sprint 5K & 10K',
  'Fast, flat, neon-lit urban road race with live DJ pacing zones, chip timing, and finisher medals for all participants.',
  NOW() + INTERVAL '45 days',
  'Dasharath Stadium & Ring Road Circuit',
  'Road Running',
  '["5K Fun Run", "10K Timed Race"]'::jsonb,
  500,
  1000.00,
  'NPR',
  'open',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1400&q=80',
  '05:00 PM Expo Opens | 06:30 PM Warmup | 07:00 PM Race Start | 08:30 PM Afterparty',
  'Closed asphalt circuit with LED kilometer markers and hydration booths every 2.5km.'
),
(
  'Himalayan Gravel & MTB Enduro',
  'High-adrenaline cross-country mountain bike race combining fast gravel descents and technical climbs.',
  NOW() + INTERVAL '68 days',
  'Nagarkot to Dhulikhel Ridge',
  'Cycling',
  '["25K Sport", "50K Pro Enduro"]'::jsonb,
  180,
  2000.00,
  'NPR',
  'open',
  'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=1400&q=80',
  '06:30 AM Bike Inspection | 07:30 AM Pro Wave | 07:45 AM Sport Wave | 01:00 PM Podium',
  'Mixed gravel jeep tracks and singletrack ridge trails with mechanical support zones.'
);

-- NOTE: To make yourself an Admin after signing up on the site, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
