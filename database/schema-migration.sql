-- Migration to add missing columns to align with implementation
-- Run this in your Supabase SQL editor

-- Add missing columns to events table
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

-- Add missing columns to event_registrations table
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS on_waitlist boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS waitlist_position integer,
ADD COLUMN IF NOT EXISTS consent_updates boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS student_year character varying,
ADD COLUMN IF NOT EXISTS student_program character varying;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_event_format ON public.events(event_format);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);
CREATE INDEX IF NOT EXISTS idx_events_spots_taken ON public.events(spots_taken);
CREATE INDEX IF NOT EXISTS idx_event_registrations_on_waitlist ON public.event_registrations(on_waitlist);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
        -- Remove leading/trailing hyphens
        NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS trigger_generate_event_slug ON public.events;
CREATE TRIGGER trigger_generate_event_slug
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION generate_event_slug();

-- Function to handle RSVP with capacity management
CREATE OR REPLACE FUNCTION handle_event_rsvp(
    p_event_id INTEGER,
    p_student_name VARCHAR,
    p_student_email VARCHAR,
    p_student_phone VARCHAR DEFAULT NULL,
    p_student_year VARCHAR DEFAULT NULL,
    p_student_program VARCHAR DEFAULT NULL,
    p_consent_updates BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
    v_event RECORD;
    v_registration_id INTEGER;
    v_on_waitlist BOOLEAN;
    v_waitlist_position INTEGER;
    v_existing_registration INTEGER;
BEGIN
    -- Check if event exists and get capacity info
    SELECT * INTO v_event FROM public.events WHERE id = p_event_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Event not found');
    END IF;

    -- Check if already registered
    SELECT id INTO v_existing_registration
    FROM public.event_registrations
    WHERE event_id = p_event_id AND student_email = p_student_email;

    IF v_existing_registration IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'Already registered for this event');
    END IF;

    -- Determine if should be on waitlist
    IF v_event.spots_taken >= v_event.capacity THEN
        v_on_waitlist := true;
        -- Calculate waitlist position
        SELECT COUNT(*) + 1 INTO v_waitlist_position
        FROM public.event_registrations
        WHERE event_id = p_event_id AND on_waitlist = true;
    ELSE
        v_on_waitlist := false;
        v_waitlist_position := NULL;
        -- Increment spots taken
        UPDATE public.events SET spots_taken = spots_taken + 1 WHERE id = p_event_id;
    END IF;

    -- Insert registration
    INSERT INTO public.event_registrations (
        event_id, student_name, student_email, student_phone,
        student_year, student_program, on_waitlist, waitlist_position,
        consent_updates, major, year
    ) VALUES (
        p_event_id, p_student_name, p_student_email, p_student_phone,
        p_student_year, p_student_program, v_on_waitlist, v_waitlist_position,
        p_consent_updates, p_student_program, p_student_year
    ) RETURNING id INTO v_registration_id;

    IF v_on_waitlist THEN
        RETURN json_build_object(
            'success', true,
            'on_waitlist', true,
            'waitlist_position', v_waitlist_position,
            'message', 'Added to waitlist'
        );
    ELSE
        RETURN json_build_object(
            'success', true,
            'on_waitlist', false,
            'message', 'Registration confirmed'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing events with sample data
UPDATE public.events SET
    event_type = CASE
        WHEN title ILIKE '%career fair%' THEN 'career-fair'
        WHEN title ILIKE '%workshop%' THEN 'workshop'
        WHEN title ILIKE '%talk%' THEN 'alumni-talk'
        WHEN title ILIKE '%info%' OR title ILIKE '%session%' THEN 'info-session'
        ELSE 'workshop'
    END,
    event_format = 'on-campus',
    city = 'Marrakech',
    campus = 'EMSI Main Campus',
    host_org = 'EMSI Career Center',
    tags = ARRAY['career', 'professional-development'],
    image_url = '/images/career-event-students.jpg',
    spots_taken = FLOOR(RANDOM() * (capacity * 0.6))
WHERE event_type IS NULL;

-- Insert sample events if none exist
INSERT INTO public.events (
    title, description, event_date, event_time, location, capacity,
    event_type, event_format, city, campus, host_org, tags, spots_taken, status
)
SELECT * FROM (
    VALUES
    ('Cloud Computing Essentials', 'Learn the fundamentals of cloud computing with AWS and Azure. Get hands-on experience with cloud services.', '2024-12-15', '14:00:00', 'Computer Lab 3', 40, 'workshop', 'on-campus', 'Marrakech', 'EMSI Main Campus', 'EMSI IT Department', ARRAY['cloud', 'aws', 'azure', 'technology'], 12, 'upcoming'),
    ('Alumni Success Stories', 'Join successful EMSI alumni who built their own tech startups. Learn from their journey and get inspired.', '2024-12-18', '16:00:00', 'Conference Room A', 100, 'alumni-talk', 'hybrid', 'Marrakech', 'EMSI Main Campus', 'EMSI Alumni Association', ARRAY['entrepreneurship', 'startup', 'inspiration'], 45, 'upcoming'),
    ('Mock Interview Marathon', 'Practice your interview skills with industry professionals. Get instant feedback and improve your technique.', '2024-12-20', '09:00:00', 'Training Center', 60, 'workshop', 'on-campus', 'Casablanca', 'EMSI Casablanca', 'Career Services', ARRAY['interview', 'soft-skills', 'career-prep'], 58, 'upcoming'),
    ('Data Science Career Fair', 'Meet with data scientists from leading companies and explore career opportunities in AI and machine learning.', '2024-12-22', '10:00:00', 'Main Auditorium', 200, 'career-fair', 'on-campus', 'Marrakech', 'EMSI Main Campus', 'EMSI Career Center', ARRAY['data-science', 'ai', 'career', 'networking'], 89, 'upcoming')
) AS new_events(title, description, event_date, event_time, location, capacity, event_type, event_format, city, campus, host_org, tags, spots_taken, status)
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = new_events.title);

COMMIT;