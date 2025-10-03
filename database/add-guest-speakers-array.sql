-- Migration: Add guest_speakers JSON column to events table
-- This column stores an array of guest speakers (up to 4) with their details

-- Add guest_speakers column to store multiple speakers as JSON
ALTER TABLE events
ADD COLUMN IF NOT EXISTS guest_speakers JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN events.guest_speakers IS 'Array of guest speaker objects with fields: name, occupation, bio, photo, linkedin. Maximum 4 speakers per event.';

-- Update existing events to convert single speaker to array format
UPDATE events
SET guest_speakers = CASE
  WHEN guest_speaker_name IS NOT NULL AND guest_speaker_name != '' THEN
    jsonb_build_array(
      jsonb_build_object(
        'name', COALESCE(guest_speaker_name, ''),
        'occupation', COALESCE(guest_speaker_occupation, ''),
        'bio', COALESCE(guest_speaker_bio, ''),
        'photo', COALESCE(guest_speaker_photo, ''),
        'linkedin', COALESCE(guest_speaker_linkedin, '')
      )
    )
  ELSE '[]'::jsonb
END
WHERE guest_speakers = '[]'::jsonb OR guest_speakers IS NULL;

-- Create an index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_events_guest_speakers ON events USING GIN (guest_speakers);

-- Sample query to test the new column
-- SELECT id, title, guest_speakers FROM events WHERE guest_speakers != '[]'::jsonb;
