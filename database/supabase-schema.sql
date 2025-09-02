-- Supabase SQL Schema for EMSI Career Center
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable RLS (Row Level Security) - recommended for Supabase
-- We'll configure policies after creating tables

-- 1. Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    major VARCHAR(100),
    year VARCHAR(10),
    email VARCHAR(100),
    linkedin VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(200),
    capacity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) NOT NULL,
    student_phone VARCHAR(20),
    major VARCHAR(100),
    year VARCHAR(10),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'confirmed'
);

-- 5. Messages table (for contact forms and applications)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_name VARCHAR(100),
    sender_email VARCHAR(100),
    subject VARCHAR(200),
    message TEXT,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(student_email);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert default admin user
-- Password is 'admin123' hashed with bcrypt (you should change this in production)
INSERT INTO users (username, password_hash, role) 
VALUES (
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample ambassadors data
INSERT INTO ambassadors (name, role, major, year, email, linkedin, bio, status) VALUES
('Sarah Alami', 'Lead Ambassador', 'Computer Science', '2024', 'sarah.alami@emsi.ma', 'linkedin.com/in/sarah-alami', 'Passionate about connecting students with career opportunities in tech.', 'active'),
('Mohamed Tazi', 'Events Coordinator', 'Business Administration', '2025', 'mohamed.tazi@emsi.ma', 'linkedin.com/in/mohamed-tazi', 'Experienced in organizing professional networking events.', 'active'),
('Fatima Benali', 'Industry Liaison', 'Marketing', '2024', 'fatima.benali@emsi.ma', 'linkedin.com/in/fatima-benali', 'Building bridges between academia and industry.', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample events data
INSERT INTO events (title, description, event_date, event_time, location, capacity, status) VALUES
('Career Fair 2024', 'Annual career fair connecting students with top employers in Morocco', '2024-10-15', '09:00:00', 'EMSI Campus - Main Hall', 200, 'upcoming'),
('Tech Talk: AI in Industry', 'Expert discussion on artificial intelligence applications in various industries', '2024-09-25', '14:00:00', 'Conference Room A', 50, 'upcoming'),
('Resume Workshop', 'Interactive workshop on creating effective resumes and cover letters', '2024-09-18', '10:00:00', 'Training Room B', 30, 'upcoming')
ON CONFLICT DO NOTHING;

-- Configure Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users table policies (admin only)
CREATE POLICY "Users: Admin can do everything" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Ambassadors policies
CREATE POLICY "Ambassadors: Public can view active" ON ambassadors
    FOR SELECT USING (status = 'active');

CREATE POLICY "Ambassadors: Admin can do everything" ON ambassadors
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Events policies  
CREATE POLICY "Events: Public can view upcoming" ON events
    FOR SELECT USING (status = 'upcoming');

CREATE POLICY "Events: Admin can do everything" ON events
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Event registrations policies
CREATE POLICY "Event registrations: Public can insert" ON event_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Event registrations: Admin can view all" ON event_registrations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Event registrations: Admin can do everything" ON event_registrations
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Messages policies
CREATE POLICY "Messages: Public can insert" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Messages: Admin can view all" ON messages
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Messages: Admin can do everything" ON messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassadors_updated_at BEFORE UPDATE ON ambassadors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle JWT token validation for server-side access
-- Note: For server-side access, you'll typically use the service role key
-- which bypasses RLS, so these policies mainly apply to direct client access

COMMIT;