-- Add guest speaker fields to the events table
-- Run this in your Supabase SQL editor

-- Add guest_speaker_name column
ALTER TABLE events
ADD COLUMN IF NOT EXISTS guest_speaker_name VARCHAR(255);

-- Add guest_speaker_occupation column
ALTER TABLE events
ADD COLUMN IF NOT EXISTS guest_speaker_occupation VARCHAR(255);

-- Add guest_speaker_bio column for additional information
ALTER TABLE events
ADD COLUMN IF NOT EXISTS guest_speaker_bio TEXT;

-- Add guest_speaker_photo column for speaker image URL
ALTER TABLE events
ADD COLUMN IF NOT EXISTS guest_speaker_photo VARCHAR(500);

-- Add guest_speaker_linkedin column for LinkedIn profile
ALTER TABLE events
ADD COLUMN IF NOT EXISTS guest_speaker_linkedin VARCHAR(500);

-- Optional: Update existing events with sample guest speaker data
-- You can modify or remove this section based on your needs

-- Update Career Fair 2025 with a guest speaker
UPDATE events
SET
    guest_speaker_name = 'John Doe',
    guest_speaker_occupation = 'Senior HR Director at Tech Corp',
    guest_speaker_bio = 'John has over 15 years of experience in talent acquisition and career development. He specializes in helping students transition from academia to professional careers.',
    guest_speaker_linkedin = 'https://linkedin.com/in/johndoe'
WHERE id = 4;

-- Update Interview Skills Workshop with a guest speaker
UPDATE events
SET
    guest_speaker_name = 'Sarah Johnson',
    guest_speaker_occupation = 'Career Coach & Interview Expert',
    guest_speaker_bio = 'Sarah is a certified career coach with expertise in interview preparation and professional development. She has helped hundreds of students land their dream jobs.',
    guest_speaker_linkedin = 'https://linkedin.com/in/sarahjohnson'
WHERE id = 11;

-- Grant necessary permissions (if needed)
-- This ensures your application can read these new fields
GRANT SELECT ON events TO anon;
GRANT SELECT ON events TO authenticated;

-- Create an index on guest_speaker_name for faster searches (optional)
CREATE INDEX IF NOT EXISTS idx_events_guest_speaker_name
ON events(guest_speaker_name);

-- Verify the columns were added successfully
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'events'
AND column_name LIKE 'guest_speaker%'
ORDER BY ordinal_position;