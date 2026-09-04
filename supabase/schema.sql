-- MoodSync V1 PostgreSQL Schema for Supabase
-- Ultra-lightweight, strict Row Level Security, two-person pairing, Bangla-first

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'প্রিয়জন',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COUPLES TABLE
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  retention_days INTEGER NOT NULL DEFAULT 30 CHECK (retention_days IN (7, 14, 30)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COUPLE MEMBERS TABLE (Exactly 2 members maximum per couple)
CREATE TABLE IF NOT EXISTS public.couple_members (
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (couple_id, user_id)
);

-- Constraint: Limit to max 2 members per couple
CREATE OR REPLACE FUNCTION public.check_couple_member_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.couple_members WHERE couple_id = NEW.couple_id) >= 2 THEN
    RAISE EXCEPTION 'এই কাপলে ইতোমধ্যে ২ জন সদস্য যুক্ত আছেন।';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_couple_member_limit ON public.couple_members;
CREATE TRIGGER trg_check_couple_member_limit
  BEFORE INSERT ON public.couple_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_couple_member_limit();

-- 4. DEFINITION TABLES
CREATE TABLE IF NOT EXISTS public.mood_definitions (
  id TEXT PRIMARY KEY,
  emoji TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.need_definitions (
  id TEXT PRIMARY KEY,
  emoji TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.intimacy_definitions (
  id TEXT PRIMARY KEY,
  emoji TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 5. MOOD EVENTS TABLE (Append-only)
CREATE TABLE IF NOT EXISTS public.mood_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_id TEXT REFERENCES public.mood_definitions(id),
  need_id TEXT REFERENCES public.need_definitions(id),
  intimacy_mood_id TEXT REFERENCES public.intimacy_definitions(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast retrieval of latest mood and daily timeline
CREATE INDEX IF NOT EXISTS idx_mood_events_couple_time ON public.mood_events (couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_events_user_time ON public.mood_events (user_id, created_at DESC);

-- 6. PUSH SUBSCRIPTIONS TABLE (Web Push API)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_couple ON public.push_subscriptions (couple_id);

-- SEED DEFINITIONS
INSERT INTO public.mood_definitions (id, emoji, name_bn, description_bn, sort_order) VALUES
  ('very_good', '😄', 'খুব ভালো', 'মন খুব প্রফুল্ল আর হালকা লাগছে।', 1),
  ('good', '🙂', 'ভালো', 'সবকিছু বেশ স্বাভাবিক আর সুন্দর কাটছে।', 2),
  ('peaceful', '😌', 'শান্ত', 'এখন মনটা বেশ স্থির ও স্বস্তিতে আছে।', 3),
  ('neutral', '😐', 'মোটামুটি', 'বিশেষ কোনো অনুভূতি নেই, সাধারণ সময়।', 4),
  ('sad', '😔', 'মন খারাপ', 'মনটা একটু ভার লাগছে। হয়তো কোনো নির্দিষ্ট কারণ আছে, হয়তো নেই।', 5),
  ('very_bad', '😣', 'খুব খারাপ', 'ভেতরটা কেমন যেন ছটফট করছে, একদম ভালো লাগছে না।', 6),
  ('angry', '😡', 'রাগ লাগছে', 'কোনো কিছু নিয়ে বিরক্ত, রাগ বা ক্ষোভ অনুভব করছি।', 7),
  ('hurt', '🥺', 'কষ্ট লাগছে', 'মন খুব আঘাত পেয়েছে বা ভীষণ অভিমান হচ্ছে।', 8)
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name_bn = EXCLUDED.name_bn,
  description_bn = EXCLUDED.description_bn,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.need_definitions (id, emoji, name_bn, description_bn, sort_order) VALUES
  ('affection', '🫂', 'একটু আদর', 'কাছে আসতে বা একটু affection পেতে ইচ্ছে করছি।', 1),
  ('talk', '💬', 'কথা বলতে চাই', 'আমার সাথে কথা বলতে ভালো লাগবে।', 2),
  ('listen', '👂', 'শুধু শুনো', 'সমাধান নয়, শুধু চাই তুমি আমাকে শুনো।', 3),
  ('space', '🧘', 'একটু space', 'এখন কিছুটা একা থাকতে চাই।', 4),
  ('be_there', '🤍', 'পাশে থাকো', 'কিছু বলতে হবে না, শুধু পাশে থাকলেই ভালো লাগবে।', 5),
  ('not_sure', '🤷', 'জানি না', 'নিজেরও ঠিক বুঝতে পারছি না কী দরকার।', 6)
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name_bn = EXCLUDED.name_bn,
  description_bn = EXCLUDED.description_bn,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.intimacy_definitions (id, emoji, name_bn, description_bn, sort_order) VALUES
  ('cuddle', '🤍', 'আদর চাই', 'একটু উষ্ণ স্পর্শ বা জড়িয়ে থাকা চাই।', 1),
  ('stay_close', '🫂', 'কাছে থাকতে চাই', 'কাছাকাছি সময় কাটাতে ইচ্ছা করছে।', 2),
  ('romantic', '❤️', 'রোমান্টিক লাগছে', 'মনটা বেশ প্রণয়ময় ও রোমান্টিক।', 3),
  ('intimate', '🔥', 'Intimate mood', 'শারীরিক ও মানসিক ঘনিষ্ঠতা অনুভব করছি।', 4),
  ('nothing_special', '😐', 'বিশেষ কিছু না', 'আজ সাধারণ দিনের মতোই স্বাভাবিক।', 5),
  ('prefer_not_to_say', '—', 'বলতে চাই না', 'এই মুহূর্তে বিষয়টি শেয়ার করতে চাইছি না।', 6)
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name_bn = EXCLUDED.name_bn,
  description_bn = EXCLUDED.description_bn,
  sort_order = EXCLUDED.sort_order;

-- 7. HELPER FUNCTION TO PREVENT RLS INFINITE RECURSION
CREATE OR REPLACE FUNCTION public.get_my_couple_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid();
$$;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.need_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intimacy_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Definitions can be read by any authenticated user
DROP POLICY IF EXISTS "Public read mood definitions" ON public.mood_definitions;
CREATE POLICY "Public read mood definitions" ON public.mood_definitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Public read need definitions" ON public.need_definitions;
CREATE POLICY "Public read need definitions" ON public.need_definitions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Public read intimacy definitions" ON public.intimacy_definitions;
CREATE POLICY "Public read intimacy definitions" ON public.intimacy_definitions FOR SELECT TO authenticated USING (true);

-- Profiles RLS:
-- User can read own profile OR partner's profile
DROP POLICY IF EXISTS "Read profiles in couple" ON public.profiles;
CREATE POLICY "Read profiles in couple" ON public.profiles FOR SELECT TO authenticated USING (
  id = auth.uid()
  OR id IN (
    SELECT cm.user_id FROM public.couple_members cm WHERE cm.couple_id IN (SELECT public.get_my_couple_ids())
  )
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Couple Members RLS:
DROP POLICY IF EXISTS "Read couple members" ON public.couple_members;
CREATE POLICY "Read couple members" ON public.couple_members FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR couple_id IN (SELECT public.get_my_couple_ids())
);

-- Couples RLS:
DROP POLICY IF EXISTS "Read own couple" ON public.couples;
CREATE POLICY "Read own couple" ON public.couples FOR SELECT TO authenticated USING (
  id IN (SELECT public.get_my_couple_ids())
);

DROP POLICY IF EXISTS "Update own couple" ON public.couples;
CREATE POLICY "Update own couple" ON public.couples FOR UPDATE TO authenticated USING (
  id IN (SELECT public.get_my_couple_ids())
);

-- Mood Events RLS:
-- Strict: A user can only SELECT events belonging to their couple
DROP POLICY IF EXISTS "Read own couple mood events" ON public.mood_events;
CREATE POLICY "Read own couple mood events" ON public.mood_events FOR SELECT TO authenticated USING (
  couple_id IN (SELECT public.get_my_couple_ids())
);

-- Strict: A user can only INSERT as themselves and for their own couple
DROP POLICY IF EXISTS "Insert own mood event" ON public.mood_events;
CREATE POLICY "Insert own mood event" ON public.mood_events FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND couple_id IN (SELECT public.get_my_couple_ids())
);

-- Users can delete their own couple mood events if resetting
DROP POLICY IF EXISTS "Delete own mood events" ON public.mood_events;
CREATE POLICY "Delete own mood events" ON public.mood_events FOR DELETE TO authenticated USING (
  couple_id IN (SELECT public.get_my_couple_ids())
);

-- Push subscriptions RLS:
DROP POLICY IF EXISTS "Manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Manage own push subscriptions" ON public.push_subscriptions FOR ALL TO authenticated USING (
  user_id = auth.uid()
);

-- 9. SECURE HELPER FUNCTIONS

-- Helper to generate 6-character random alphanumeric invite code (skipping confusing chars 0, O, 1, I)
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function: Create a new couple with invite code
CREATE OR REPLACE FUNCTION public.create_couple(partner_name TEXT DEFAULT 'প্রিয়জন')
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing_couple_id UUID;
  v_couple_id UUID;
  v_code TEXT;
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, name)
  VALUES (v_user_id, partner_name)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Check if user is already in a couple
  SELECT couple_id INTO v_existing_couple_id
  FROM public.couple_members
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_existing_couple_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'id', c.id,
      'invite_code', c.invite_code,
      'retention_days', c.retention_days,
      'created_at', c.created_at
    ) INTO v_result
    FROM public.couples c
    WHERE c.id = v_existing_couple_id;
    RETURN v_result;
  END IF;

  -- Generate unique invite code
  LOOP
    v_code := public.generate_invite_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.couples WHERE invite_code = v_code);
  END LOOP;

  -- Create couple (invite valid for 7 days)
  INSERT INTO public.couples (invite_code, invite_expires_at, retention_days)
  VALUES (v_code, NOW() + INTERVAL '7 days', 30)
  RETURNING id INTO v_couple_id;

  -- Add user as first couple member
  INSERT INTO public.couple_members (couple_id, user_id)
  VALUES (v_couple_id, v_user_id);

  SELECT jsonb_build_object(
    'id', c.id,
    'invite_code', c.invite_code,
    'retention_days', c.retention_days,
    'created_at', c.created_at
  ) INTO v_result
  FROM public.couples c
  WHERE c.id = v_couple_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Join a couple with invite code
CREATE OR REPLACE FUNCTION public.join_couple_with_code(code TEXT, partner_name TEXT DEFAULT 'প্রিয়জন')
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_couple RECORD;
  v_member_count INTEGER;
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, name)
  VALUES (v_user_id, partner_name)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Clean up code
  code := upper(trim(code));

  -- Find couple
  SELECT id, invite_code, invite_expires_at, retention_days, created_at
  INTO v_couple
  FROM public.couples
  WHERE upper(invite_code) = code;

  IF v_couple.id IS NULL THEN
    RAISE EXCEPTION 'আমন্ত্রণ কোডটি সঠিক নয়। অনুগ্রহ করে পুনরায় পরীক্ষা করুন।';
  END IF;

  IF v_couple.invite_expires_at IS NOT NULL AND v_couple.invite_expires_at < NOW() THEN
    RAISE EXCEPTION 'আমন্ত্রণ কোডটির মেয়াদ শেষ হয়ে গেছে।';
  END IF;

  -- Check current member count
  SELECT COUNT(*) INTO v_member_count
  FROM public.couple_members
  WHERE couple_id = v_couple.id;

  IF v_member_count >= 2 THEN
    -- Check if user is already one of the members
    IF EXISTS (SELECT 1 FROM public.couple_members WHERE couple_id = v_couple.id AND user_id = v_user_id) THEN
      RETURN jsonb_build_object(
        'id', v_couple.id,
        'invite_code', v_couple.invite_code,
        'retention_days', v_couple.retention_days,
        'already_member', true
      );
    ELSE
      RAISE EXCEPTION 'এই কাপলে ইতোমধ্যে ২ জন সদস্য যুক্ত আছেন।';
    END IF;
  END IF;

  -- If user was in an existing single-person couple, clean it up before joining partner's couple
  DELETE FROM public.couples c
  WHERE c.id IN (
    SELECT cm.couple_id
    FROM public.couple_members cm
    WHERE cm.user_id = v_user_id
      AND (SELECT COUNT(*) FROM public.couple_members WHERE couple_id = cm.couple_id) <= 1
  );

  -- Add user as member
  INSERT INTO public.couple_members (couple_id, user_id)
  VALUES (v_couple.id, v_user_id)
  ON CONFLICT (couple_id, user_id) DO NOTHING;

  -- Invalidate code after second member joins for security
  UPDATE public.couples
  SET invite_code = NULL, invite_expires_at = NULL, updated_at = NOW()
  WHERE id = v_couple.id;

  SELECT jsonb_build_object(
    'id', v_couple.id,
    'retention_days', v_couple.retention_days,
    'joined', true
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: 30-day retention cleanup
CREATE OR REPLACE FUNCTION public.cleanup_expired_mood_events()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.mood_events me
    USING public.couples c
    WHERE me.couple_id = c.id
      AND me.created_at < (NOW() - (c.retention_days || ' days')::INTERVAL)
    RETURNING me.id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create profile on new auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'প্রিয়জন')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Supabase Realtime for mood_events and couple_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mood_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'couple_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_members;
  END IF;
END $$;
