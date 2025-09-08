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
- `about.html` - Information about the career center with contact form
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

# Initialize database (if local setup)
npm run init-db

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

# Submit contact message (public endpoint)
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","subject":"Inquiry","message":"Hello"}'

# Manage messages (admin endpoints - require JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/messages
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/messages/1
curl -X PUT -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"read"}' http://localhost:3000/api/messages/1
curl -X DELETE -H "Authorization: Bearer TOKEN" http://localhost:3000/api/messages/1
```

### Testing
No test framework is currently configured. The package.json contains a placeholder test command.

## Key Features

### Frontend Architecture
- **Navigation**: Pill-shaped bottom navigation bar with active states
- **Job Search**: Advanced filtering by keyword, location, and job type with debounced search
- **Event Registration**: Modal-based registration system with form validation
- **Contact System**: Modern contact form with validation and backend integration
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

### Admin Dashboard Features
- **Event Registration Management**: Collapsible filter system with event-based filtering
- **Message Management**: Complete contact message system with unread indicators
- **Data Export**: CSV export functionality for event registrations
- **Event Statistics**: Clickable stats that auto-filter registration data
- **Interactive UI**: Toggle-based filter controls with smooth animations
- **Real-time Updates**: Dynamic content loading and filtering
- **Notification System**: Unread message badges and status indicators

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
- Contact form validation and async submission
- LocalStorage for persistent job saves

## Admin Dashboard Architecture (`admin-dashboard.html`)

### Key JavaScript Functions

#### Registration Management
- **toggleRegistrationFilters()**: Toggles visibility of collapsible filter controls
- **filterRegistrationsByEvent()**: Filters registrations by event ID with auto-expand filters
- **clearRegistrationFilter()**: Resets filter dropdown and shows all registrations
- **exportRegistrationsCSV()**: Exports filtered or all registration data to CSV
- **filterRegistrationTable()**: Core table filtering logic with real-time updates

#### Message Management
- **viewMessage()**: Opens detailed message modal without changing read status
- **markMessageAsRead()**: Updates message status to "read" in database
- **markAllMessagesAsRead()**: Bulk operation to mark all unread messages as read
- **deleteMessage()**: Removes message with confirmation dialog
- **updateUnreadMessagesCount()**: Updates navigation badge with unread count
- **closeMessageModal()**: Closes message detail modal with proper cleanup

### UI Components

#### Registration Section
- **Collapsible Filter Panel**: Hidden by default, shows event dropdown and clear button
- **Section Header Actions**: Contains Filter toggle and Export CSV buttons (always visible)
- **Event Stats Integration**: Clicking event stats auto-filters and shows relevant registrations
- **Smooth Animations**: CSS transitions with slideDown keyframes for filter panel

#### Messages Section
- **Message Table**: Shows sender, subject, date, status with visual unread indicators
- **Message Detail Modal**: Full-screen modal with sender info, subject, and message content
- **Unread Status Indicators**: Visual badges and highlighted rows for unread messages
- **Navigation Badge**: Real-time unread count with pulsing animation
- **Action Buttons**: View, Mark as Read, Delete with proper confirmation dialogs

## Contact Form & Message System

### Frontend Contact Form (`about.html`)
- **Modern Design**: Professional styling with glassmorphism effects and smooth animations
- **Comprehensive Fields**: Name (first/last), email, phone (optional), subject, message
- **Client Validation**: Real-time field validation with visual feedback (error/success states)
- **Form States**: Loading spinner, disabled states, success/error notifications
- **Async Submission**: Fetch API with proper error handling and user feedback
- **Auto-close**: Success message closes modal after 2 seconds

### Backend Message API (`server.js`)
- **Public Endpoint**: `/api/messages` (POST) - No authentication required for submissions
- **Admin Endpoints**: Full CRUD operations with JWT authentication required
- **Data Validation**: Server-side validation for required fields and data integrity
- **Database Integration**: Proper INSERT, SELECT, UPDATE, DELETE operations via Supabase
- **Status Management**: Messages default to "unread", can be marked as "read"

### Admin Message Management
- **Real-time Indicators**: Navigation badge shows unread count with pulsing animation
- **Message List**: Sortable table with sender, subject, date, status columns
- **Visual Status**: Unread messages highlighted with blue background and bold text
- **Detail Modal**: Click "View" opens modal with full message content (doesn't mark as read)
- **Status Control**: Manual "Mark as Read" button gives admin full control over message status
- **Bulk Actions**: "Mark All Read" button for efficient message management
- **Delete Functionality**: Individual message deletion with confirmation dialog

### Database Schema
- **Messages Table**: id, sender_name, sender_email, subject, message, status, created_at, updated_at
- **Row Level Security**: Public can INSERT, Admin can SELECT/UPDATE/DELETE
- **Indexes**: Optimized queries with status and date indexes for performance

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