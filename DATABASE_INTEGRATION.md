# Database Integration Guide for Events System

## Schema Alignment

The events system has been designed to work with your existing Supabase schema. Here's how to integrate it:

### 1. Run the Migration Script

Execute the migration script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of /database/schema-migration.sql
```

This will:
- Add missing columns to the `events` table
- Add missing columns to the `event_registrations` table
- Create indexes for performance
- Add the `handle_event_rsvp` function for atomic operations
- Insert sample events

### 2. Schema Mapping

#### Events Table Extensions
Your existing `events` table gets these additional fields:
```sql
- slug (auto-generated from title)
- event_type ('workshop', 'career-fair', 'alumni-talk', 'info-session')
- event_format ('on-campus', 'online', 'hybrid')
- city, campus, host_org (location details)
- tags (text array for filtering)
- image_url, featured (display options)
- spots_taken (capacity tracking)
- agenda, speakers, what_to_bring (detailed info)
- meeting_link (for online events)
```

#### Event Registrations Extensions
Your existing `event_registrations` table gets these additional fields:
```sql
- on_waitlist (boolean for waitlist support)
- waitlist_position (integer for queue position)
- consent_updates (boolean for email consent)
- student_year, student_program (additional student info)
```

### 3. API Integration Points

#### Events API (`/api/events`)
- `GET` - List events with filtering (type, format, upcoming, featured)
- `POST` - Create new events (admin only)

#### Event Detail API (`/api/events/[id]`)
- `GET` - Get event by ID or slug with related events
- `PUT` - Update event (admin only)
- `DELETE` - Delete event (admin only)

#### RSVP API (`/api/events/[id]/rsvp`)
- `POST` - Register for event with waitlist support
- `GET` - Get registration list (admin only)

### 4. Component Architecture

#### Main Components
- **EventsPage** (`/events`) - Main events listing with filters
- **EventDetailPage** (`/events/[id]`) - Individual event details
- **EventCalendar** - Calendar view component
- **RSVPModal** - Registration modal with capacity tracking

#### Features Implemented
- ✅ List/Calendar view toggle
- ✅ Advanced filtering (date, type, format, location)
- ✅ Search functionality
- ✅ Capacity tracking and waitlist
- ✅ Responsive design
- ✅ Calendar integration
- ✅ Social sharing
- ✅ Related events

### 5. Database Functions

#### `handle_event_rsvp()`
Atomic RSVP function that:
- Checks for duplicate registrations
- Manages capacity and waitlist
- Updates spots_taken counter
- Returns structured response

### 6. Row Level Security (RLS)

The system respects your existing RLS policies:
- Public read access to events
- Public write access to event_registrations
- Admin access required for event management

### 7. Error Handling

The system includes comprehensive error handling:
- Fallback to manual operations if database functions fail
- Graceful degradation with sample data
- User-friendly error messages
- Console logging for debugging

### 8. Performance Optimizations

- Indexes on frequently queried fields
- Efficient select queries with only needed fields
- Pagination support
- Optimistic UI updates

## Testing Checklist

Before going live, test these scenarios:

1. **Event Creation**
   - [ ] Create events via admin interface
   - [ ] Verify slug generation
   - [ ] Check all field mappings

2. **Event Registration**
   - [ ] Register for available events
   - [ ] Test waitlist when capacity reached
   - [ ] Verify duplicate registration prevention
   - [ ] Check email validation

3. **Event Filtering**
   - [ ] Test all filter combinations
   - [ ] Verify search functionality
   - [ ] Check mobile responsiveness

4. **Calendar Integration**
   - [ ] Google Calendar export
   - [ ] Event sharing
   - [ ] Add to calendar functionality

5. **Error Scenarios**
   - [ ] Database connection issues
   - [ ] Invalid event IDs
   - [ ] Malformed requests

## Environment Variables

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key (if needed)
```

## Monitoring

Monitor these key metrics:
- Event registration success rate
- API response times
- Database connection health
- User engagement with filters/search