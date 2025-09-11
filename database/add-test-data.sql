-- Add test cohort applications
-- Run this in your Supabase SQL editor

-- First, update the application deadline to allow new applications
UPDATE cohorts SET application_deadline = '2025-12-31' WHERE id = 1;

-- Add test applications
INSERT INTO cohort_applications 
(cohort_id, student_name, student_email, student_phone, major, year, motivation, cv_url, linkedin, status)
VALUES 
(1, 'Test Student', 'test@example.com', '123-456-7890', 'Computer Science', '3rd year', 'I want to help other students in their career journey and gain experience in leadership and mentoring.', 'https://example.com/cv.pdf', 'https://linkedin.com/in/teststudent', 'pending'),
(1, 'Sarah Johnson', 'sarah.johnson@example.com', '098-765-4321', 'Business Administration', '2nd year', 'I am passionate about helping fellow students navigate their career paths and build professional networks.', 'https://example.com/sarah_cv.pdf', 'https://linkedin.com/in/sarahjohnson', 'interviewed'),
(1, 'Mike Chen', 'mike.chen@example.com', '555-123-4567', 'Engineering', '4th year', 'As a senior student, I want to share my experience and help younger students succeed in their academic and professional goals.', 'https://example.com/mike_cv.pdf', 'https://linkedin.com/in/mikechen', 'pending');

-- Update one application with interview details
UPDATE cohort_applications 
SET interview_score = 85, 
    interview_notes = 'Great communication skills, shows leadership potential',
    admin_notes = 'Strong candidate for ambassador role'
WHERE student_email = 'sarah.johnson@example.com';

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'SUCCESS: Test cohort applications added successfully!';
    RAISE NOTICE 'Added 3 test applications to Fall 2024 Ambassadors cohort';
    RAISE NOTICE 'You can now test the Applications tab in the admin panel.';
END $$;