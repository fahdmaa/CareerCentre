# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EMSI Career Center - A modern Next.js web application for EMSI Marrakech, providing students and alumni with job opportunities, events, and career resources. Features a minimalistic design with green/white color scheme and glassmorphism effects.

## Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL-based) with Row Level Security
- **Authentication**: JWT-based with bcrypt password hashing
- **Styling**: Custom CSS with modern design system (modern-home.css)
- **Image Optimization**: Next.js Image component
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
```

## Environment Variables

Create `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
JWT_SECRET=your-jwt-secret-key
```

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

Main tables:
- `users` - Admin users
- `ambassadors` - Student ambassadors
- `events` - Career events
- `event_registrations` - Event sign-ups
- `messages` - Contact form submissions
- `cohorts` - Ambassador program cohorts
- `cohort_applications` - Ambassador applications

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

### Phase 5: Production Readiness and Polish (Latest)
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
- Avoid gradient buttons - use solid colors instead (#00A651 primary)
- Keep spacing minimal and clean throughout
- Ensure WCAG 2.1 AA compliance for accessibility
- Include proper ARIA labels and semantic HTML structure
- Support keyboard navigation for all interactive elements
- Test with screen readers and high contrast modes

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