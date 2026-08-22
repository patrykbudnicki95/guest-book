-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  names TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  qr_code_url TEXT,
  theme_color TEXT,
  cover_photo_url TEXT,
  welcome_message TEXT,
  schedule JSONB,
  menu JSONB,
  plan_id TEXT NOT NULL DEFAULT 'basic' CHECK (plan_id IN ('basic', 'silver', 'gold')),
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  guest_name TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for events
-- Public read access (for guest QR code access)
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Only authenticated owners can insert events
CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only authenticated owners can update their events
CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = owner_id);

-- Only authenticated owners can delete their events
CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for uploads
-- Public read access (for guest gallery viewing)
CREATE POLICY "Uploads are viewable by everyone"
  ON uploads FOR SELECT
  USING (true);

-- Anyone (including anonymous) can insert uploads (for guest uploads)
CREATE POLICY "Anyone can insert uploads"
  ON uploads FOR INSERT
  WITH CHECK (true);

-- Only event owners can delete uploads (moderation)
CREATE POLICY "Event owners can delete uploads"
  ON uploads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = uploads.event_id
      AND events.owner_id = auth.uid()
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Keep events.storage_used_bytes in sync with the uploads table so plan quota
-- checks are a single indexed read.
CREATE OR REPLACE FUNCTION sync_event_storage_used()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE events
      SET storage_used_bytes = storage_used_bytes + NEW.file_size_bytes
      WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE events
      SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size_bytes)
      WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE events
      SET storage_used_bytes = GREATEST(
        0,
        storage_used_bytes - OLD.file_size_bytes + NEW.file_size_bytes
      )
      WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_event_storage_used_trigger
  AFTER INSERT OR UPDATE OF file_size_bytes OR DELETE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION sync_event_storage_used();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_uploads_event_id ON uploads(event_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- Table privileges. RLS decides which rows a role sees; these GRANTs decide
-- whether the role may touch the table at all, and both are required.
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT ON public.uploads TO anon, authenticated;
GRANT DELETE ON public.uploads TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

