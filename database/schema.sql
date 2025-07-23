-- EMSI Career Center Database Schema

-- Create database (run this separately if needed)
-- CREATE DATABASE emsi_career_center;

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'upcoming',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    major VARCHAR(100) NOT NULL,
    year VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    linkedin VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50),
    major VARCHAR(100),
    year VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(event_id, student_email)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_ambassadors_status ON ambassadors(status);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_status ON event_registrations(status);
CREATE INDEX idx_messages_status ON messages(status);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ambassadors_updated_at BEFORE UPDATE ON ambassadors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, email, role) 
VALUES ('admin', '$2b$10$SDJO0pmbtfTabKgB1iV1q.UCN6XndLbG1BwptBDj8hO0PtDr7klWu', 'admin@emsi.ma', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample data for events
INSERT INTO events (title, description, event_date, event_time, location, capacity, status) VALUES
('Annual EMSI Marrakech Career Fair', 'Connect with top employers and explore career opportunities', '2025-07-05', '09:00:00', 'EMSI Campus - Main Hall', 200, 'upcoming'),
('Workshop: Advanced CV & Cover Letter Strategies', 'Learn how to create compelling CVs and cover letters', '2025-06-10', '14:00:00', 'Online (Zoom)', 50, 'upcoming'),
('Company Presentation: Tech Innovators Inc.', 'Learn about opportunities at Tech Innovators', '2025-06-15', '15:00:00', 'Auditorium A', 80, 'upcoming');

-- Insert sample data for ambassadors
INSERT INTO ambassadors (name, role, major, year, email, linkedin, bio, status) VALUES
('Mohamed Alami', 'Lead Ambassador', 'Computer Science', '4th Year', 'm.alami@emsi.ma', 'mohamed-alami', 'Passionate about connecting students with opportunities', 'active'),
('Sophia Berrada', 'Event Coordinator', 'Business Administration', '3rd Year', 's.berrada@emsi.ma', 'sophia-berrada', 'Organizing impactful career events for students', 'active'),
('Youssef Benali', 'Social Media Manager', 'Digital Marketing', '3rd Year', 'y.benali@emsi.ma', 'youssef-benali', 'Building EMSI Career Center online presence', 'active'),
('Amina Tahiri', 'Workshop Facilitator', 'Human Resources', '2nd Year', 'a.tahiri@emsi.ma', 'amina-tahiri', 'Helping students develop professional skills', 'active'),
('Karim Mansouri', 'Campus Tour Guide', 'Architecture', '3rd Year', 'k.mansouri@emsi.ma', 'karim-mansouri', 'Showcasing EMSI campus to prospective students', 'active');