# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EMSI Career Center - A modern Next.js web application for EMSI Marrakech, providing students and alumni with job opportunities, events, and career resources. Features a minimalistic design with green/white color scheme and glassmorphism effects.

## Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with path aliases (`@/*`, `@/components/*`, `@/lib/*`, `@/app/*`)
- **Database**: Supabase (PostgreSQL-based) with Row Level Security
- **Authentication**: JWT-based with bcrypt password hashing
- **Styling**: Custom CSS with modern design system (modern-home.css)
- **Image Optimization**: Next.js Image component
- **Testing**: Jest with React Testing Library
- **Deployment**: Vercel

### Key Directory Structure
```
/app                    # Next.js App Router pages
  /page.tsx            # Home page with hero, services, partners
  /jobs/page.tsx       # Job listings
  /events/page.tsx     # Career events
  /ambassadors/page.tsx # Ambassador program
  /about/page.tsx      # About & contact
  /admin/              # Admin pages
    /login/page.tsx    # Admin login
    /dashboard/page.tsx # Admin dashboard with enhanced features
    /responsive.css    # Responsive styles for admin dashboard
  /api/                # API routes
    /auth/             # Authentication endpoints
    /admin/            # Admin-specific endpoints (events, registrations)
    /messages/         # Message management
    /public/           # Public endpoints
  /globals.css         # Global styles
  /modern-home.css     # Modern homepage styles
  /accessibility.css   # Accessibility improvements and WCAG compliance
  /layout.tsx          # Root layout with error boundaries

/components            # Reusable React components
  /Navigation.tsx      # Main navigation
  /ServicesAccordion.tsx # Services with modal popups
  /EventDetailsModal.tsx # Event details modal with inline registration form
  /InterviewScheduler.tsx # Interview scheduling component
  /LoadingPage.tsx     # Loading states
  /ErrorBoundary.tsx   # Error boundary for app-wide error handling
  /LoadingSpinner.tsx  # Reusable loading spinner component
  /AccessibleButton.tsx # WCAG-compliant button component
  /AccessibleForm.tsx  # Accessible form components with ARIA labels

/lib                   # Utilities and configurations
  /auth.ts            # Authentication utilities
  /supabase.ts        # Supabase client
  /design-system.ts   # Design tokens and theme

/public               # Static assets
  /images/            # Images and logos
    partner-logo-*.png # 15 partner company logos
    standing-guy.png   # Hero section character
  /videos/            # Video content

/database             # Database files
  /supabase-schema.sql # Database schema
  /migration-event-registrations.sql # Database migration for enhanced features
  /add-test-data.sql   # Test data
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Note**: Requires Node.js >=18.0.0

## Environment Variables

Create `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=https://vhdkhtrczpctcubudqwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZGtodHJjenBjdGN1YnVkcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjQyMDQsImV4cCI6MjA3MjQwMDIwNH0.m2emGqkkjhdMhc9lbRmmlndtT5XtDWBy3U51fAuoZFs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZGtodHJjenBjdGN1YnVkcXdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgyNDIwNCwiZXhwIjoyMDcyNDAwMjA0fQ.P1BTElAIu_lusbweajnhxOsKlzSdI6L0RvPvttyinc8
JWT_SECRET=your-jwt-secret-key
```

**Supabase Configuration:**
- Project URL: `https://vhdkhtrczpctcubudqwh.supabase.co`
- Project Reference: `vhdkhtrczpctcubudqwh`
- Storage Bucket: `speaker-photos` (for guest speaker profile images)

## API Routes

### Public Endpoints
- `GET /api/public/ambassadors` - List ambassadors
- `GET /api/public/events` - List events
- `GET /api/public/cohorts` - List cohorts
- `POST /api/public/register` - Register for event
- `POST /api/public/cohorts` - Apply for ambassador program
- `POST /api/messages` - Send contact message

### Admin Endpoints (require JWT)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/messages` - List all messages
- `GET /api/messages/[id]` - Get message details
- `PUT /api/messages/[id]` - Update message status
- `DELETE /api/messages/[id]` - Delete message
- `GET /api/admin/events` - List all events with filtering and pagination
- `POST /api/admin/events` - Create new event
- `PUT /api/admin/events` - Update existing event
- `DELETE /api/admin/events` - Delete event
- `GET /api/admin/registrations` - List event registrations with analytics
- `PUT /api/admin/registrations` - Update registration status
- `DELETE /api/admin/registrations` - Delete registration
- `GET /api/admin/applications` - List ambassador applications
- `GET /api/admin/applications/[id]` - Get application details
- `PUT /api/admin/applications/[id]` - Update application status
- `GET /api/admin/activities` - List admin activities/audit log
- `GET /api/admin/interviews` - List scheduled interviews
- `POST /api/admin/interviews` - Schedule new interview
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `POST /api/admin/verify-password` - Verify admin password

## Key Features

### Public Pages
- **Home**: 
  - Hero section with horizontal two-column layout (text + image)
  - Stats counter section with animated numbers
  - Services section with modal popup details
  - Partner logos grid (15 companies)
  - CTA section with minimized spacing and centered content
- **Jobs**: Job listings with search, filters, and save functionality
- **Events**: Career events with registration modals
- **Ambassadors**: Program information and application form
- **About**: Career center information and contact form

### Admin Dashboard
- **Authentication**: JWT-based login system with secure token management
- **Message Management**: View, mark as read, delete contact messages with pagination
- **Event Management**: Complete CRUD operations for events with advanced features:
  - Create/edit events with full form validation
  - Event analytics and statistics
  - Status management (upcoming, completed, cancelled)
  - Featured events and categorization
  - Guest speaker information and meeting links
- **Event Registrations**: Comprehensive registration management:
  - View all registrations with advanced filtering
  - Export registrations to CSV format
  - Registration analytics and metrics
  - Waitlist management and positioning
  - Bulk actions for registration updates
- **Ambassador Applications**: Review and manage applications
- **Cohort Management**: Create and manage ambassador cohorts
- **Responsive Design**: Mobile-optimized admin interface
- **Error Handling**: Comprehensive error boundaries and loading states
- **Accessibility**: WCAG-compliant interface with keyboard navigation

### UI/UX Design System
- **Color Palette**: 
  - Primary Green: #00A651
  - Secondary Blue: #004A99
  - Clean white backgrounds with subtle gradients
- **Button Styles**: Solid green background with white text (no gradients)
- **Modal Design**: Futuristic green theme with glassmorphism effects
- **Layout Patterns**:
  - Responsive grid layouts
  - Minimal padding and spacing for clean look
  - Sticky elements (e.g., CTA image attached to page bottom)
  - Horizontal centering for hero content

### Security Features
- JWT authentication with 1-hour expiration
- Bcrypt password hashing
- HTTP-only secure cookies
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Input validation and sanitization
- Row Level Security in Supabase

## Database Schema

### Core Tables
- `users` - Admin users with authentication (username, password_hash, role)
- `admin_profiles` - Admin user profile information (linked to users table)
- `user_profiles` - Public user profiles (links to auth.users for Supabase Auth)

### Career Center Tables
- `ambassadors` - Student ambassadors with profile information
- `cohorts` - Ambassador program cohorts with application deadlines
- `cohort_applications` - Ambassador applications linked to cohorts
- `interviews` - Scheduled interviews for ambassador applications
- `events` - Career events with comprehensive details (guest speakers, capacity, tags, format)
- `event_registrations` - Event sign-ups with waitlist management
- `messages` - Contact form submissions with status tracking
- `recent_activities` - Activity/audit log for admin actions

### Financial Management Tables (Additional Feature)
- `transactions` - User financial transactions (income/expense/savings)
- `budgets` - Monthly budget limits and tracking per category
- `categories` - User-defined transaction categories with icons/colors
- `insights` - AI-generated financial insights and notifications

**Note**: The schema includes both Career Center functionality and a personal finance management system. Tables using `auth.users` (budgets, categories, transactions, insights, user_profiles) are part of a separate feature set from the main Career Center tables which use the `public.users` table for admin authentication.

## Styling System

- **Colors**: EMSI brand (blue #004A99, green #00A651)
- **Design**: Glassmorphism effects, gradient backgrounds
- **Responsive**: Mobile-first approach with breakpoints at 576px and 992px
- **Animations**: GPU-accelerated transitions and scroll animations

## Admin Credentials

Default admin login:
- Username: `admin`
- Password: `admin123`

## Deployment

The project is configured for Vercel deployment:
1. Push to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

## Recent Updates

### Phase 8: Event Registration Flow Enhancement (Latest)
- **Inline Registration Form**: Integrated registration directly into EventDetailsModal
  - Removed separate RSVPModal for cleaner UX
  - Conditional rendering: event details OR registration form (not both)
  - Smooth transition when clicking "Register Now" button
  - Form includes: Full Name*, EMSI Email*, Year of Study, Program/Major
- **Success Message with Animation**: Modern styled success feedback
  - Green gradient background matching app theme
  - Bounce-in animation (@keyframes bounceIn)
  - Checkmark icon in circular background
  - Auto-closes modal after 2.5 seconds
  - Form fades to 50% opacity during success state
- **Auto-Refresh Events List**: Callback system for live updates
  - Added `onSuccess` prop to EventDetailsModal
  - Calls `fetchEvents()` after successful registration
  - Events list updates immediately without page reload
  - Maintains filter state during refresh
- **Waitlist Support**: Differentiated messaging for full events
  - Shows waitlist position when event is full
  - Dynamic button text: "Register Now" vs "Join Waitlist"
  - Position tracking in success message
- **Improved Form UX**: Enhanced spacing and scrollability
  - 32px padding with modern scrollbar styling
  - 24px spacing between form fields
  - Green focus states on inputs
  - Fixed footer with Back and Submit buttons
  - Disabled fields during submission and success
- **Debug Logging**: Comprehensive console logs for troubleshooting
  - Registration response tracking
  - Success message state verification
  - Events refresh callback confirmation
  - Filter state debugging

### Phase 7: Guest Speaker Image Upload
- **Supabase Storage Integration**: Implemented image upload for guest speaker photos
  - Created `speaker-photos` storage bucket with public access
  - File size limit: 2MB per image
  - Allowed formats: JPEG, PNG, WebP
  - Automatic unique filename generation
- **Upload API**: Created `/api/upload/speaker-photo` endpoint
  - File validation (type and size)
  - Error handling and rollback on failure
  - Returns public URL for uploaded images
- **Admin Dashboard Enhancement**: File upload component for speaker photos
  - Upload button with file picker
  - Live preview of uploaded images (60px circular thumbnail)
  - Change/Remove photo buttons
  - Loading state during upload ("⏳ Uploading...")
  - Error alerts for failed uploads
- **Frontend Display**: Updated EventDetailsModal to show speaker photos
  - Displays uploaded photos (48px circular with green border)
  - Automatic fallback to initials if photo unavailable
  - Error handling for broken image links
- **Multiple Guest Speakers**: Support for up to 4 guest speakers per event
  - Dynamic form with "Add Speaker" button
  - Individual photo upload for each speaker
  - JSONB storage in Supabase for speaker array
  - Proper display on both admin and public pages

### Phase 6: UI/UX Consistency & Form Standardization
- **Unified Form Theme**: Created reusable form styling system (`form-theme.css`)
  - Curved inputs with 30px border-radius matching website buttons
  - Consistent green (#00A651) theme across all forms
  - Smooth transitions, focus states, and hover effects
  - Responsive design with mobile optimization
- **Contact Form Enhancement**: Modern modal with animations
  - Rectangular modal with curved form elements
  - Success message with bounce-in animation
  - Smooth fade-out closing animation
  - Integrated scrollbar styling within form body
  - Green header with curved corners
- **Admin Forms Updated**: Applied unified theme to admin login
  - Curved inputs and buttons (30px border-radius)
  - Green-themed submit buttons with hover effects
  - Consistent error message styling
- **Button Consistency**: All CTA buttons now use 30px curves
  - Hero section buttons (Explore Jobs, View Events)
  - CTA section buttons (Browse Jobs, Contact Us)
  - Service modal buttons (Browse jobs, Create job alert, etc.)
  - StarBorder component with configurable border-radius

### Phase 5: Production Readiness and Polish
- **Build Optimization**: Refactored complex TypeScript patterns for better production builds
  - Extracted IIFE (Immediately Invoked Function Expressions) from JSX
  - Added helper functions for complex calculations
  - Improved component performance and build compatibility
- **Error Handling**: Comprehensive error boundaries and loading states
  - App-wide error boundary with fallback UI and recovery options
  - Reusable loading spinner components with customization
  - Graceful error handling across all admin features
- **Responsive Design**: Mobile-first approach with complete responsive coverage
  - Admin dashboard optimized for all screen sizes
  - Responsive breakpoints: 768px (mobile), 992px (tablet), 1400px (desktop)
  - Print styles and touch-friendly interface elements
- **Accessibility**: WCAG 2.1 AA compliance
  - Comprehensive ARIA labels and semantic HTML
  - Keyboard navigation support for all interactive elements
  - Skip links, focus management, and screen reader optimization
  - High contrast mode and reduced motion support
  - Accessible form components with proper validation feedback

### Phase 4: Advanced Registration Management (Previous)
- **Event Management**: Complete CRUD operations with advanced filtering
- **Registration System**: Waitlist management, CSV export, bulk actions
- **Analytics Dashboard**: Real-time statistics and registration insights
- **Form Validation**: Comprehensive client and server-side validation

### UI Improvements (Earlier)
- Modal CTAs changed from gradient to solid green (#00A651) with white text
- Removed spacing between CTA section image and page bottom (image now sticks to bottom)
- Reduced top padding in green CTA zone and centered all content
- Updated partner section with 15 new company logos
- Hero section layout changed to horizontal two-column on desktop (text left, image right)
- Implemented responsive stacking for mobile devices

### Component Updates
- ServicesAccordion: Changed from dropdown to modal popup on click
- Modal buttons: Fixed to show as sleek green buttons with proper white text
- CTA section: Minimalistic design with reduced padding and centered alignment

## Development Notes

### Code Quality & Performance
- Use TypeScript for type safety and better development experience
- Follow Next.js App Router conventions for optimal performance
- Extract complex computations from JSX for better build compatibility
- Avoid complex IIFE patterns in JSX components
- Use helper functions for calculations and data transformations
- Implement proper error boundaries for graceful error handling

### Design & Accessibility
- Maintain minimalistic design with green/white color scheme
- Use solid green buttons (#00A651) with 30px border-radius for consistency
- All form inputs should use 30px curves to match button styling
- Keep spacing minimal and clean throughout
- Ensure WCAG 2.1 AA compliance for accessibility
- Include proper ARIA labels and semantic HTML structure
- Support keyboard navigation for all interactive elements
- Test with screen readers and high contrast modes
- Use `form-theme.css` for all new forms to maintain consistency

### Architecture & Security
- Ensure all API routes handle errors properly with try-catch blocks
- Test authentication flow before deployment
- Keep Supabase RLS policies updated and secure
- Validate all user inputs on both client and server side
- Use HTTP-only cookies for sensitive authentication data

### Responsive & Mobile
- Images should be optimized using Next.js Image component
- Maintain horizontal layouts on desktop, stack on mobile
- Test across all breakpoints: 768px (mobile), 992px (tablet), 1400px (desktop)
- Ensure touch targets meet minimum 44px accessibility requirements
- Optimize admin interface for mobile workflow efficiency

### Component Development
- Use reusable accessible components (AccessibleButton, AccessibleForm)
- Implement loading states with LoadingSpinner component
- Include error boundaries around complex features
- Follow consistent naming conventions and file organization
- Use StarBorder component for all buttons requiring animated borders
- Apply `.themed` class to all form inputs for consistent styling
- Use `.btn-submit-themed` and `.btn-secondary-themed` for form buttons

### Form Development Guidelines
- Import `form-theme.css` for all forms requiring consistent styling
- Use class names: `.themed`, `.form-group-themed`, `.form-label-themed`
- All inputs should have 30px border-radius
- Submit buttons should be green (#00A651) with white text
- Secondary/cancel buttons should have white background with grey border
- Error messages use `.error-message-themed` class
- Success messages use `.success-message-themed` class
- Forms should have smooth animations for open/close states
- Scrollbars within modals should be subtle and integrated (6px width, semi-transparent)