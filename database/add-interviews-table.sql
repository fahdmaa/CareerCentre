-- Add interviews table for interview scheduling functionality
-- Run this SQL in your Supabase SQL editor

-- 8. Interviews table (for scheduled interviews)
CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES cohort_applications(id) ON DELETE CASCADE,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'in-person', -- 'in-person', 'video', 'phone'
    location VARCHAR(200),
    meeting_link VARCHAR(500), -- For video interviews
    interviewer_name VARCHAR(100),
    interviewer_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no-show'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for the interviews table
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Row Level Security for interviews table
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admin to do everything with interviews
CREATE POLICY "Interviews: Admin can do everything" ON interviews
FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to read all interviews
CREATE POLICY "Interviews: Read access for authenticated users" ON interviews
FOR SELECT USING (auth.role() = 'authenticated');