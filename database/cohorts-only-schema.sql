-- Cohorts-Only Schema for Supabase
-- Run this SQL in your Supabase SQL editor to add only the new cohorts tables
-- This avoids conflicts with existing tables and policies

-- 6. Cohorts table (for Ambassador program cohorts)
CREATE TABLE IF NOT EXISTS cohorts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    application_deadline DATE NOT NULL,
    max_participants INTEGER DEFAULT 20,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cohort applications table
CREATE TABLE IF NOT EXISTS cohort_applications (
    id SERIAL PRIMARY KEY,
    cohort_id INTEGER REFERENCES cohorts(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) NOT NULL,
    student_phone VARCHAR(20),
    major VARCHAR(100),
    year VARCHAR(10),
    motivation TEXT,
    cv_url VARCHAR(255),
    linkedin VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    interview_score INTEGER,
    interview_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_cohorts_status ON cohorts(status);
CREATE INDEX IF NOT EXISTS idx_cohorts_application_deadline ON cohorts(application_deadline);
CREATE INDEX IF NOT EXISTS idx_cohort_applications_cohort_id ON cohort_applications(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_applications_status ON cohort_applications(status);
CREATE INDEX IF NOT EXISTS idx_cohort_applications_email ON cohort_applications(student_email);

-- Enable RLS on new tables
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DO $$ 
BEGIN
    -- Drop cohorts policies if they exist
    DROP POLICY IF EXISTS "Cohorts: Public can view active" ON cohorts;
    DROP POLICY IF EXISTS "Cohorts: Admin can do everything" ON cohorts;
    
    -- Drop cohort applications policies if they exist
    DROP POLICY IF EXISTS "Cohort applications: Public can insert" ON cohort_applications;
    DROP POLICY IF EXISTS "Cohort applications: Admin can view all" ON cohort_applications;
    DROP POLICY IF EXISTS "Cohort applications: Admin can do everything" ON cohort_applications;
END $$;

-- Create policies for cohorts
CREATE POLICY "Cohorts: Public can view active" ON cohorts
    FOR SELECT USING (status = 'active');

CREATE POLICY "Cohorts: Admin can do everything" ON cohorts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for cohort applications
CREATE POLICY "Cohort applications: Public can insert" ON cohort_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Cohort applications: Admin can view all" ON cohort_applications
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Cohort applications: Admin can do everything" ON cohort_applications
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create triggers to automatically update updated_at (only if the function exists)
DO $$ 
BEGIN
    -- Check if the function exists, if not, create it
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
    
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_cohorts_updated_at ON cohorts;
    DROP TRIGGER IF EXISTS update_cohort_applications_updated_at ON cohort_applications;
END $$;

-- Create triggers
CREATE TRIGGER update_cohorts_updated_at BEFORE UPDATE ON cohorts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohort_applications_updated_at BEFORE UPDATE ON cohort_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample cohorts data (with conflict handling)
INSERT INTO cohorts (name, description, start_date, end_date, application_deadline, max_participants, status) VALUES
('Fall 2024 Ambassadors', 'Fall semester ambassador cohort focusing on career development and student outreach', '2024-09-15', '2024-12-15', '2024-09-10', 25, 'active'),
('Spring 2025 Ambassadors', 'Spring semester cohort with emphasis on industry partnerships and networking events', '2025-02-01', '2025-06-01', '2025-01-15', 30, 'draft')
ON CONFLICT DO NOTHING;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'SUCCESS: Cohorts tables created successfully!';
    RAISE NOTICE 'Tables added: cohorts, cohort_applications';
    RAISE NOTICE 'Sample data inserted: 2 cohorts';
    RAISE NOTICE 'You can now use the Cohorts section in the admin panel.';
END $$;