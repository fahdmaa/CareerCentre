-- Admin Profile Management Schema
-- Run this in your Supabase SQL Editor

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Admin User',
    occupation VARCHAR(255) DEFAULT 'Career Center Administrator',
    phone VARCHAR(50) DEFAULT '+212 6 12 34 56 78',
    email VARCHAR(255) NOT NULL,
    profile_picture TEXT, -- Base64 encoded image data or URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recent_activities table for dashboard
CREATE TABLE IF NOT EXISTS recent_activities (
    id SERIAL PRIMARY KEY,
    activity_type VARCHAR(100) NOT NULL, -- 'event_registration', 'ambassador_application', 'message_received', etc.
    description TEXT NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    activity_data JSONB, -- Additional data for the activity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample profile for admin user
INSERT INTO admin_profiles (user_id, name, occupation, phone, email)
SELECT 
    u.id, 
    'Admin User', 
    'Career Center Administrator', 
    '+212 6 12 34 56 78', 
    'admin@emsi.ma'
FROM users u 
WHERE u.username = 'admin' 
AND NOT EXISTS (
    SELECT 1 FROM admin_profiles ap WHERE ap.user_id = u.id
);

-- Add some sample recent activities
INSERT INTO recent_activities (activity_type, description, user_name, user_email, activity_data) VALUES
('event_registration', 'New registration for Career Fair 2024', 'Ahmed Benali', 'ahmed.benali@student.emsi.ma', '{"event_id": 1, "event_name": "Career Fair 2024"}'),
('ambassador_application', 'New ambassador application submitted', 'Fatima Zahra', 'fatima.zahra@student.emsi.ma', '{"major": "Computer Science", "year": "3rd Year"}'),
('message_received', 'Contact form submission received', 'Omar Alami', 'omar.alami@gmail.com', '{"subject": "Partnership Inquiry", "type": "partnership"}'),
('event_registration', 'Workshop registration completed', 'Salma Radi', 'salma.radi@student.emsi.ma', '{"event_id": 2, "event_name": "Resume Writing Workshop"}'),
('ambassador_application', 'Ambassador profile updated', 'Youssef Mansouri', 'youssef.mansouri@student.emsi.ma', '{"status": "active", "role": "Event Coordinator"}');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_profiles
DROP TRIGGER IF EXISTS update_admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (but disable for admin operations)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;

-- Disable RLS for these tables to allow admin access
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activities_created_at ON recent_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_activities_type ON recent_activities(activity_type);