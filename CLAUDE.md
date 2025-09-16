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
    /dashboard/page.tsx # Admin dashboard
  /api/                # API routes
    /auth/             # Authentication endpoints
    /messages/         # Message management
    /public/           # Public endpoints
  /globals.css         # Global styles
  /modern-home.css     # Modern homepage styles
  /layout.tsx          # Root layout

/components            # Reusable React components
  /Navigation.tsx      # Main navigation
  /ServicesAccordion.tsx # Services with modal popups
  /InterviewScheduler.tsx # Interview scheduling component
  /LoadingPage.tsx     # Loading states

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
- **Authentication**: JWT-based login system
- **Message Management**: View, mark as read, delete contact messages
- **Event Registrations**: Manage event sign-ups
- **Ambassador Applications**: Review and manage applications
- **Cohort Management**: Create and manage ambassador cohorts

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

### UI Improvements (Latest)
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

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Maintain minimalistic design with green/white color scheme
- Avoid gradient buttons - use solid colors instead
- Keep spacing minimal and clean throughout
- Ensure all API routes handle errors properly
- Test authentication flow before deployment
- Keep Supabase RLS policies updated
- Images should be optimized using Next.js Image component
- Maintain horizontal layouts on desktop, stack on mobile