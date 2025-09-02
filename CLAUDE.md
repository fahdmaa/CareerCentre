# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a career center web application for EMSI Marrakech, providing students and alumni with job opportunities, events, and career resources. The project is a static website with Express.js backend for authentication and basic admin functionality.

## Architecture

- **Frontend**: Static HTML pages with CSS styling and vanilla JavaScript
- **Backend**: Express.js server with JWT authentication and Supabase database
- **Database**: Supabase (PostgreSQL-based) with Row Level Security
- **Deployment**: Configured for Vercel with static file serving
- **Node.js**: Requires version 14.0.0 or higher

### Key Files Structure
- `index.html` - Main landing page with hero section and stats
- `jobs.html` - Job listings with search and filter functionality  
- `events.html` - Career events with registration modals
- `about.html` - Information about the career center
- `ambassadors.html` - Program ambassadors page
- `admin-login.html` - Admin authentication page
- `admin-dashboard.html` - Protected admin dashboard
- `server.js` - Express backend with authentication routes and Supabase integration
- `database/supabase.js` - Supabase database configuration and query handler
- `database/supabase-schema.sql` - SQL schema for Supabase database setup
- `public/main.js` - Frontend JavaScript functionality
- `public/style.css` - Complete styling system (104KB)
- `public/style-optimized.css` - Optimized CSS variant (13KB)

## Development Commands

```bash
# Install dependencies
npm install

# Run the application (all equivalent)
npm start
npm run dev
node server.js

# Server runs on port 3000 (or PORT env variable)
```

### API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Admin login (POST)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Admin dashboard (requires JWT token)
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing
No test framework is currently configured. The package.json contains a placeholder test command.

## Key Features

### Frontend Architecture
- **Navigation**: Pill-shaped bottom navigation bar with active states
- **Job Search**: Advanced filtering by keyword, location, and job type with debounced search
- **Event Registration**: Modal-based registration system with form validation
- **Animation System**: Intersection Observer for scroll animations with GPU acceleration
- **Performance**: RequestAnimationFrame, lazy loading, CSS containment
- **State Management**: localStorage for job saving functionality

### Backend Architecture
- **Authentication**: JWT-based login with bcrypt password hashing
- **Security**: 
  - Rate limiting (5 attempts per 15 minutes with lockout)
  - Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
  - Input validation and sanitation
  - CORS configuration for development
- **Routes**: Clean URL routing with automatic .html extension handling
- **Error Handling**: Global error handler with proper logging
- **Monitoring**: Health check endpoint with uptime tracking

### Admin Credentials
- Username: `admin`
- Password: `admin123` (bcrypt hashed in code)

## Styling System

- **Color Scheme**: EMSI brand colors (blue #004A99, green #00A651)
- **Design Pattern**: Glassmorphism effects, gradient backgrounds
- **Responsive Breakpoints**: 576px (mobile), 992px (desktop)
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and focus management
- **Performance**: GPU-accelerated animations, optimized transitions

## JavaScript Architecture (`public/main.js`)

### Core Components
- **Navigation Manager**: Active state handling for pill navbar with collision prevention
- **Search System**: Real-time filtering with performance optimization
- **Modal Controller**: Registration modals with accessibility support
- **Animation Engine**: Scroll-triggered animations with fallback support
- **Form Validator**: Dynamic field validation with visual feedback
- **Notification System**: User feedback for actions

### Event Handling Patterns
- Debounced search input (300ms delay)
- Dynamic major selection based on year of study
- Responsive navbar with scroll hide/show behavior
- Form submission with validation states
- LocalStorage for persistent job saves

## Development Notes

- **Database**: Uses Supabase (PostgreSQL) with Row Level Security policies
- **Environment Variables**: Requires SUPABASE_URL and SUPABASE_ANON_KEY (see .env.example)
- **Image Optimization**: Consider CDN integration for production deployment
- **Dependencies**: All configured in package.json (express, body-parser, bcrypt, jsonwebtoken, @supabase/supabase-js)

## Deployment

Configured for Vercel deployment via `vercel.json`:
- Static file serving for frontend assets
- Serverless function support for Express.js backend
- Automatic HTTPS and domain management
- Clean URL routing configuration