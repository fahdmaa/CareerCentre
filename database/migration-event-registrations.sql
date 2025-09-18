-- Migration script to update event_registrations table with missing fields
-- Run this SQL in your Supabase SQL editor to update the database schema

-- Add missing columns to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS on_waitlist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER NULL,
ADD COLUMN IF NOT EXISTS consent_updates BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add missing column to events table if it doesn't exist
ALTER TABLE events
ADD COLUMN IF NOT EXISTS spots_taken INTEGER DEFAULT 0;

-- Update existing events to have proper spots_taken counts
UPDATE events
SET spots_taken = COALESCE((
    SELECT COUNT(*)
    FROM event_registrations
    WHERE event_registrations.event_id = events.id
    AND event_registrations.on_waitlist = FALSE
    AND event_registrations.status = 'confirmed'
), 0)
WHERE spots_taken IS NULL OR spots_taken = 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_waitlist ON event_registrations(on_waitlist);
CREATE INDEX IF NOT EXISTS idx_event_registrations_waitlist_position ON event_registrations(waitlist_position);
CREATE INDEX IF NOT EXISTS idx_event_registrations_updated_at ON event_registrations(updated_at);

-- Add additional event table columns for enhanced functionality (optional)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'workshop',
ADD COLUMN IF NOT EXISTS event_format VARCHAR(50) DEFAULT 'on-campus',
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS campus VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS host_org VARCHAR(200),
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS guest_speaker_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS guest_speaker_occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS guest_speaker_bio TEXT,
ADD COLUMN IF NOT EXISTS guest_speaker_photo VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_speaker_linkedin VARCHAR(255),
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS speakers TEXT,
ADD COLUMN IF NOT EXISTS what_to_bring TEXT,
ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255);

-- Create indexes for new event fields
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_format ON events(event_format);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);

-- Create function to handle event RSVP with proper waitlist management (if not exists)
CREATE OR REPLACE FUNCTION handle_event_rsvp(
    p_event_id INTEGER,
    p_student_name VARCHAR(100),
    p_student_email VARCHAR(100),
    p_student_phone VARCHAR(20) DEFAULT NULL,
    p_student_year VARCHAR(10) DEFAULT NULL,
    p_student_program VARCHAR(100) DEFAULT NULL,
    p_consent_updates BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
DECLARE
    v_event events%ROWTYPE;
    v_spots_left INTEGER;
    v_on_waitlist BOOLEAN := FALSE;
    v_waitlist_position INTEGER := NULL;
    v_registration_id INTEGER;
    v_existing_count INTEGER;
BEGIN
    -- Check if already registered
    SELECT COUNT(*) INTO v_existing_count
    FROM event_registrations
    WHERE event_id = p_event_id AND student_email = p_student_email;

    IF v_existing_count > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'You have already registered for this event'
        );
    END IF;

    -- Get event details
    SELECT * INTO v_event
    FROM events
    WHERE id = p_event_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Event not found'
        );
    END IF;

    -- Calculate spots left
    v_spots_left := v_event.capacity - COALESCE(v_event.spots_taken, 0);

    -- Determine if should be on waitlist
    IF v_spots_left <= 0 THEN
        v_on_waitlist := TRUE;

        -- Calculate waitlist position
        SELECT COUNT(*) + 1 INTO v_waitlist_position
        FROM event_registrations
        WHERE event_id = p_event_id AND on_waitlist = TRUE;
    END IF;

    -- Insert registration
    INSERT INTO event_registrations (
        event_id,
        student_name,
        student_email,
        student_phone,
        year,
        major,
        on_waitlist,
        waitlist_position,
        consent_updates,
        status
    ) VALUES (
        p_event_id,
        p_student_name,
        p_student_email,
        p_student_phone,
        p_student_year,
        p_student_program,
        v_on_waitlist,
        v_waitlist_position,
        p_consent_updates,
        'confirmed'
    ) RETURNING id INTO v_registration_id;

    -- Update spots taken if not on waitlist
    IF NOT v_on_waitlist THEN
        UPDATE events
        SET spots_taken = COALESCE(spots_taken, 0) + 1
        WHERE id = p_event_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_registration_id,
        'on_waitlist', v_on_waitlist,
        'waitlist_position', v_waitlist_position,
        'message', CASE
            WHEN v_on_waitlist THEN 'You have been added to the waitlist (position #' || v_waitlist_position || ')'
            ELSE 'Registration confirmed successfully'
        END
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Registration failed: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to event_registrations table
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies for new columns
DROP POLICY IF EXISTS "Event registrations: Public can insert" ON event_registrations;
CREATE POLICY "Event registrations: Public can insert" ON event_registrations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Event registrations: Admin can view all" ON event_registrations;
CREATE POLICY "Event registrations: Admin can view all" ON event_registrations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Event registrations: Admin can do everything" ON event_registrations;
CREATE POLICY "Event registrations: Admin can do everything" ON event_registrations
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert some test data (optional - comment out if not needed)
-- INSERT INTO events (title, description, event_date, event_time, location, capacity, event_type, event_format, status) VALUES
-- ('Career Development Workshop', 'Learn essential career skills for success in the modern workplace', '2024-12-15', '14:00', 'EMSI Marrakech - Amphitheater A', 50, 'workshop', 'on-campus', 'upcoming'),
-- ('Internship Fair 2024', 'Meet with top companies and discover internship opportunities', '2024-12-20', '10:00', 'EMSI Marrakech - Main Hall', 100, 'fair', 'on-campus', 'upcoming'),
-- ('Tech Talk: AI in Business', 'Exploring the impact of artificial intelligence on modern business', '2024-12-22', '16:00', 'Online', 200, 'seminar', 'online', 'upcoming')
-- ON CONFLICT DO NOTHING;

-- Verify the migration worked
SELECT
    'Migration completed successfully' as message,
    COUNT(*) as total_events,
    (SELECT COUNT(*) FROM event_registrations) as total_registrations
FROM events;