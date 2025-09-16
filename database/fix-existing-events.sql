-- Fix for existing events not showing on frontend
-- Run this in your Supabase SQL editor

-- First, let's add the missing columns if they don't exist
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS slug character varying UNIQUE,
ADD COLUMN IF NOT EXISTS event_type character varying DEFAULT 'workshop',
ADD COLUMN IF NOT EXISTS event_format character varying DEFAULT 'on-campus',
ADD COLUMN IF NOT EXISTS city character varying,
ADD COLUMN IF NOT EXISTS campus character varying,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS host_org character varying,
ADD COLUMN IF NOT EXISTS agenda text,
ADD COLUMN IF NOT EXISTS speakers text,
ADD COLUMN IF NOT EXISTS what_to_bring text,
ADD COLUMN IF NOT EXISTS meeting_link character varying,
ADD COLUMN IF NOT EXISTS image_url character varying,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spots_taken integer DEFAULT 0;

-- Update your specific events with the missing data
UPDATE public.events SET
    slug = 'career-fair-2025',
    event_type = 'career-fair',
    event_format = 'on-campus',
    city = 'Marrakech',
    campus = 'Palm Plaza',
    host_org = 'EMSI Career Center',
    tags = ARRAY['career', 'networking', 'job-opportunities'],
    image_url = '/images/career-fair.jpg',
    spots_taken = 0
WHERE id = 4 AND title = 'Career Fair 2025';

UPDATE public.events SET
    slug = 'tech-workshop-2024',
    event_type = 'workshop',
    event_format = 'on-campus',
    city = 'Marrakech',
    campus = 'EMSI Campus',
    host_org = 'EMSI IT Department',
    tags = ARRAY['technology', 'programming', 'skills'],
    image_url = '/images/career-event-students.jpg',
    spots_taken = 0
WHERE id = 11 AND title = 'Tech Workshop 2024';

-- Also make sure the dates are in the future for the upcoming filter
-- Update event dates to be in the future if needed
UPDATE public.events SET
    event_date = '2025-12-30'
WHERE id = 4 AND event_date < CURRENT_DATE;

UPDATE public.events SET
    event_date = '2025-12-15'
WHERE id = 11 AND event_date < CURRENT_DATE;

-- Create index on slug if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- Function to auto-generate slug if missing
CREATE OR REPLACE FUNCTION update_missing_slugs()
RETURNS void AS $$
BEGIN
    UPDATE public.events
    SET slug = LOWER(REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE slug IS NULL OR slug = '';

    -- Remove leading/trailing hyphens
    UPDATE public.events
    SET slug = TRIM(BOTH '-' FROM slug)
    WHERE slug LIKE '-%' OR slug LIKE '%-';
END;
$$ LANGUAGE plpgsql;

-- Run the function to update any missing slugs
SELECT update_missing_slugs();

-- Verify the events are updated
SELECT id, title, slug, event_type, event_format, event_date, status, spots_taken
FROM public.events
WHERE id IN (4, 11);