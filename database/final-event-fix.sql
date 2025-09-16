-- Final fix for events with null event_time
-- Run this in your Supabase SQL editor

-- Fix null event_time for Career Fair 2025
UPDATE public.events
SET event_time = '10:00:00'
WHERE id = 4 AND event_time IS NULL;

-- Make sure both events are in the future
UPDATE public.events
SET event_date = '2025-12-15'
WHERE id = 11 AND event_date <= CURRENT_DATE;

UPDATE public.events
SET event_date = '2025-12-20'
WHERE id = 4 AND event_date <= CURRENT_DATE;

-- Verify the fix
SELECT
    id,
    title,
    event_date,
    event_time,
    status,
    event_type,
    slug
FROM public.events
WHERE id IN (4, 11)
ORDER BY event_date;