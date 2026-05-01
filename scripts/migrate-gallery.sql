-- Landscape Gallery table migration
CREATE TABLE IF NOT EXISTS landscape_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE landscape_gallery ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read gallery images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'landscape_gallery' AND policyname = 'Anyone can view gallery'
  ) THEN
    CREATE POLICY "Anyone can view gallery" ON landscape_gallery FOR SELECT USING (true);
  END IF;
END $$;

-- Allow service role (admin) full access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'landscape_gallery' AND policyname = 'Service role can manage gallery'
  ) THEN
    CREATE POLICY "Service role can manage gallery" ON landscape_gallery FOR ALL USING (true);
  END IF;
END $$;
