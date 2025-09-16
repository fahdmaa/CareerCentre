-- Update events table for enhanced features
-- Run this after the initial schema

-- Add new columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'workshop';
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_format VARCHAR(50) DEFAULT 'on-campus';
ALTER TABLE events ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS campus VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_org VARCHAR(200);
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS speakers TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS what_to_bring TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS spots_taken INTEGER DEFAULT 0;

-- Add waitlist support to event_registrations
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS on_waitlist BOOLEAN DEFAULT false;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS consent_updates BOOLEAN DEFAULT false;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS student_year VARCHAR(50);
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS student_program VARCHAR(100);

-- Create index for slug
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_format ON events(event_format);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

-- Update existing events with slugs
UPDATE events SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Update event types and formats for sample data
UPDATE events SET
    event_type = CASE
        WHEN title LIKE '%Career Fair%' THEN 'career-fair'
        WHEN title LIKE '%Workshop%' THEN 'workshop'
        WHEN title LIKE '%Talk%' THEN 'alumni-talk'
        ELSE 'workshop'
    END,
    event_format = 'on-campus',
    city = 'Marrakech',
    campus = 'EMSI Main Campus',
    host_org = 'EMSI Career Center',
    tags = ARRAY['career', 'professional-development'],
    image_url = '/images/career-event-students.jpg'
WHERE event_type IS NULL;

-- Add some more sample events with variety
INSERT INTO events (
    title, slug, description, event_date, event_time, location, capacity, spots_taken,
    status, event_type, event_format, city, campus, host_org, tags, image_url, featured
) VALUES
(
    'Cloud Computing Essentials', 'cloud-computing-essentials',
    'Learn the fundamentals of cloud computing with AWS and Azure. Get hands-on experience with cloud services.',
    '2024-10-20', '14:00:00', 'Computer Lab 3', 40, 12,
    'upcoming', 'workshop', 'on-campus', 'Marrakech', 'EMSI Main Campus',
    'EMSI IT Department', ARRAY['cloud', 'aws', 'azure', 'technology'],
    '/images/career-event-students.jpg', false
),
(
    'Alumni Success Stories: Tech Entrepreneurs', 'alumni-success-stories-tech',
    'Join successful EMSI alumni who built their own tech startups. Learn from their journey and get inspired.',
    '2024-10-22', '16:00:00', 'Online via Zoom', 100, 45,
    'upcoming', 'alumni-talk', 'online', NULL, NULL,
    'EMSI Alumni Association', ARRAY['entrepreneurship', 'startup', 'technology'],
    '/images/career-fair.jpg', true
),
(
    'Mock Interview Marathon', 'mock-interview-marathon',
    'Practice your interview skills with industry professionals. Get instant feedback and improve your technique.',
    '2024-10-25', '09:00:00', 'Conference Center', 60, 58,
    'upcoming', 'workshop', 'hybrid', 'Casablanca', 'EMSI Casablanca',
    'Career Services', ARRAY['interview', 'soft-skills', 'career-prep'],
    '/images/career-event-students.jpg', false
),
(
    'Data Science Info Session', 'data-science-info-session',
    'Discover career opportunities in data science. Meet with data scientists from leading companies.',
    '2024-10-28', '15:00:00', 'Auditorium B', 80, 35,
    'upcoming', 'info-session', 'on-campus', 'Marrakech', 'EMSI Main Campus',
    'Mathematics & CS Department', ARRAY['data-science', 'ai', 'career'],
    '/images/career-fair.jpg', false
)
ON CONFLICT DO NOTHING;

-- Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug = LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
DROP TRIGGER IF EXISTS generate_event_slug ON events;
CREATE TRIGGER generate_event_slug
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- Create a view for event with registration counts
CREATE OR REPLACE VIEW events_with_counts AS
SELECT
    e.*,
    COUNT(DISTINCT er.id) FILTER (WHERE er.on_waitlist = false) as registered_count,
    COUNT(DISTINCT er.id) FILTER (WHERE er.on_waitlist = true) as waitlist_count,
    (e.capacity - e.spots_taken) as spots_available
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id;

-- Function to handle RSVP with capacity management
CREATE OR REPLACE FUNCTION handle_event_rsvp(
    p_event_id INTEGER,
    p_student_name VARCHAR,
    p_student_email VARCHAR,
    p_student_phone VARCHAR,
    p_student_year VARCHAR,
    p_student_program VARCHAR,
    p_consent_updates BOOLEAN
) RETURNS JSON AS $$
DECLARE
    v_event RECORD;
    v_registration_id INTEGER;
    v_on_waitlist BOOLEAN;
    v_waitlist_position INTEGER;
BEGIN
    -- Check if event exists and get capacity info
    SELECT * INTO v_event FROM events WHERE id = p_event_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Event not found');
    END IF;

    -- Check if already registered
    IF EXISTS (
        SELECT 1 FROM event_registrations
        WHERE event_id = p_event_id AND student_email = p_student_email
    ) THEN
        RETURN json_build_object('success', false, 'message', 'Already registered for this event');
    END IF;

    -- Determine if should be on waitlist
    IF v_event.spots_taken >= v_event.capacity THEN
        v_on_waitlist := true;
        -- Calculate waitlist position
        SELECT COUNT(*) + 1 INTO v_waitlist_position
        FROM event_registrations
        WHERE event_id = p_event_id AND on_waitlist = true;
    ELSE
        v_on_waitlist := false;
        v_waitlist_position := NULL;
        -- Increment spots taken
        UPDATE events SET spots_taken = spots_taken + 1 WHERE id = p_event_id;
    END IF;

    -- Insert registration
    INSERT INTO event_registrations (
        event_id, student_name, student_email, student_phone,
        student_year, student_program, on_waitlist, waitlist_position,
        consent_updates
    ) VALUES (
        p_event_id, p_student_name, p_student_email, p_student_phone,
        p_student_year, p_student_program, v_on_waitlist, v_waitlist_position,
        p_consent_updates
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

COMMIT;