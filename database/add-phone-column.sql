-- Migration to add sender_phone column to messages table
-- Run this if you have an existing database without the phone column

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(50);

-- Update the RLS policies if needed
-- The existing policies should still work as they don't reference specific columns