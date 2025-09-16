'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import EventCalendar from '../../components/EventCalendar'
import RSVPModal from '../../components/RSVPModal'
import EventDetailsModal from '../../components/EventDetailsModal'

interface Event {
  id: number
  title: string
  slug: string
  description: string
  event_date: string
  event_time: string
  location: string
  event_type: string
  event_format: string
  city?: string
  campus?: string
  tags?: string[]
  host_org?: string
  capacity: number
  spots_taken: number
  image_url?: string
  featured?: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filters
  const [filters, setFilters] = useState({
    when: '',
    type: '',
    format: '',
    location: '',
    availableOnly: false
  })

  const [showPastEvents, setShowPastEvents] = useState(false)

  useEffect(() => {
    console.log('useEffect triggered')
    fetchEvents()
  }, [showPastEvents])

  // Test if client-side JS is working
  useEffect(() => {
    console.log('Client-side mounted!')
    // Force fetch events after mount
    const timer = setTimeout(() => {
      console.log('Timer triggered, fetching events...')
      fetchEvents()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log('Events changed:', events.length, 'events')
    console.log('Events data:', events)
    filterEvents()
  }, [events, searchTerm, filters])

  const fetchEvents = async () => {
    console.log('fetchEvents called, showPastEvents:', showPastEvents)
    setLoading(true)

    try {
      const url = showPastEvents ? '/api/events' : '/api/events?upcoming=true'
      console.log('Fetching from:', url)

      const response = await fetch(url)
      console.log('Response status:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('API error:', data.error)
        throw new Error(data.error || 'Failed to fetch events')
      }

      console.log('Setting events:', data.events)
      setEvents(data.events || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
      setLoading(false)
    }
  }

  const filterEvents = () => {
    console.log('filterEvents called')
    let filtered = [...events]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(event => event.event_type === filters.type)
    }

    // Format filter
    if (filters.format) {
      filtered = filtered.filter(event => event.event_format === filters.format)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
        event.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        event.campus?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Available spots filter
    if (filters.availableOnly) {
      filtered = filtered.filter(event => {
        const spotsLeft = event.capacity - event.spots_taken
        return spotsLeft > 0
      })
    }

    // When filter
    if (filters.when) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date)

        switch(filters.when) {
          case 'today':
            return eventDate.toDateString() === today.toDateString()
          case 'tomorrow':
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            return eventDate.toDateString() === tomorrow.toDateString()
          case 'this_week':
            const endOfWeek = new Date(today)
            endOfWeek.setDate(endOfWeek.getDate() + 7)
            return eventDate >= today && eventDate <= endOfWeek
          case 'this_month':
            return eventDate.getMonth() === today.getMonth() &&
                   eventDate.getFullYear() === today.getFullYear()
          default:
            return true
        }
      })
    }

    console.log('Filtered events:', filtered.length)
    setFilteredEvents(filtered)
  }

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event)
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  const handleRSVP = () => {
    console.log('RSVP clicked')
    setShowDetailsModal(false)
    setShowRSVPModal(true)
  }

  const handleRSVPSuccess = () => {
    console.log('RSVP success')
    setShowRSVPModal(false)
    setSelectedEvent(null)
    fetchEvents() // Refresh events to update spots
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Workshop': return 'fa-chalkboard-teacher'
      case 'Seminar': return 'fa-microphone-alt'
      case 'Networking': return 'fa-users'
      case 'Career Fair': return 'fa-building'
      case 'Info Session': return 'fa-info-circle'
      default: return 'fa-calendar'
    }
  }

  const formatTimeRange = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${period}`
  }

  const getSpotsLeftText = (event: Event) => {
    const spotsLeft = event.capacity - event.spots_taken
    if (spotsLeft <= 0) return 'Waitlist'
    if (spotsLeft <= 5) return `${spotsLeft} spots left`
    return `${spotsLeft} spots available`
  }

  const getSpotsLeftClass = (event: Event) => {
    const spotsLeft = event.capacity - event.spots_taken
    if (spotsLeft <= 0) return 'spots-none'
    if (spotsLeft <= 5) return 'spots-low'
    return 'spots-available'
  }

  const getFormatBadgeClass = (format: string) => {
    switch(format) {
      case 'online': return 'badge-online'
      case 'hybrid': return 'badge-hybrid'
      default: return 'badge-campus'
    }
  }

  console.log('Render: loading:', loading, 'events:', events.length, 'filtered:', filteredEvents.length)

  return (
    <>
      <style jsx>{`
        .events-hero {
          padding: 100px 0 60px;
          background: #00A651;
          color: white;
          text-align: center;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          text-transform: capitalize;
          color: white;
        }

        .hero-subtitle {
          font-size: 20px;
          margin-bottom: 32px;
          color: white;
          opacity: 0.95;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
        }

        .btn-hero-primary, .btn-hero-secondary {
          padding: 14px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        .btn-hero-primary {
          background: white;
          color: #00A651;
        }

        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .btn-hero-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-hero-secondary:hover {
          background: white;
          color: #00A651;
        }

        .events-toolbar {
          padding: 32px 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .toolbar-left {
          display: flex;
          gap: 16px;
          align-items: center;
          flex: 1;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #00A651;
          box-shadow: 0 0 0 3px rgba(0, 166, 81, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .view-toggle {
          display: flex;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 4px;
        }

        .view-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .view-btn.active {
          background: white;
          color: #00A651;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .toolbar-right {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .past-events-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4b5563;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .toggle-switch.active {
          background: #00A651;
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-switch.active .toggle-slider {
          transform: translateX(20px);
        }

        .filter-chips {
          padding: 24px 0 0;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          font-size: 14px;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.3s;
        }

        .filter-chip:hover {
          border-color: #00A651;
          color: #00A651;
        }

        .filter-chip.active {
          background: #00A651;
          border-color: #00A651;
          color: white;
        }

        .events-section {
          padding: 48px 0;
          min-height: 400px;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #f3f4f6;
          border-top-color: #00A651;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s;
          cursor: pointer;
        }

        .event-card:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          transform: translateY(-4px);
        }

        .event-image {
          position: relative;
          height: 180px;
          background: linear-gradient(135deg, #00A651, #00C853);
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          gap: 8px;
        }

        .event-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        .badge-online {
          background: rgba(59, 130, 246, 0.9);
          color: white;
        }

        .badge-hybrid {
          background: rgba(168, 85, 247, 0.9);
          color: white;
        }

        .badge-campus {
          background: rgba(34, 197, 94, 0.9);
          color: white;
        }

        .event-date-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: white;
          border-radius: 8px;
          padding: 8px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .date-month {
          font-size: 11px;
          font-weight: 600;
          color: #00A651;
          text-transform: uppercase;
        }

        .date-day {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .event-content {
          padding: 20px;
        }

        .event-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .event-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4b5563;
        }

        .detail-row i {
          width: 16px;
          color: #9ca3af;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .spots-indicator {
          font-size: 14px;
          font-weight: 500;
        }

        .spots-available {
          color: #10b981;
        }

        .spots-low {
          color: #f59e0b;
        }

        .spots-none {
          color: #ef4444;
        }

        .btn-rsvp {
          padding: 8px 20px;
          background: #00A651;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-rsvp:hover {
          background: #008a43;
        }

        .btn-rsvp:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
        }

        .no-results-icon {
          font-size: 48px;
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .no-results-title {
          font-size: 20px;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 8px;
        }

        .no-results-text {
          color: #6b7280;
        }

        @media (max-width: 992px) {
          .events-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }

          .toolbar-row {
            flex-direction: column;
            align-items: stretch;
          }

          .toolbar-left {
            width: 100%;
          }

          .search-box {
            max-width: none;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="main-header">
        <div className="container">
          <Link href="/" className="logo-link">
            <Image
              src="/images/emsi-logo.png"
              alt="EMSI Logo"
              width={220}
              height={55}
              className="logo-img"
              priority
            />
          </Link>
        </div>
      </header>

      <section className="events-hero">
        <div className="container">
          <h1 className="hero-title">Career Events</h1>
          <p className="hero-subtitle">Workshops, seminars, and networking opportunities</p>
          <div className="hero-actions">
            <Link href="#events" className="btn-hero-primary">
              Browse Events
            </Link>
            <button className="btn-hero-secondary" onClick={() => setViewMode('calendar')}>
              <i className="fas fa-calendar-alt" style={{ marginRight: '8px' }}></i>
              Calendar View
            </button>
          </div>
        </div>
      </section>

      <section className="events-toolbar">
        <div className="container">
          <div className="toolbar-row">
            <div className="toolbar-left">
              <div className="search-box">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search events by title, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-th-large" style={{ marginRight: '6px' }}></i>
                  Grid
                </button>
                <button
                  className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                  onClick={() => setViewMode('calendar')}
                >
                  <i className="fas fa-calendar" style={{ marginRight: '6px' }}></i>
                  Calendar
                </button>
              </div>
            </div>
            <div className="toolbar-right">
              <div className="past-events-toggle">
                <span>Show past events</span>
                <div
                  className={`toggle-switch ${showPastEvents ? 'active' : ''}`}
                  onClick={() => setShowPastEvents(!showPastEvents)}
                >
                  <div className="toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="filter-chips">
            <div
              className={`filter-chip ${filters.when === 'today' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, when: filters.when === 'today' ? '' : 'today'})}
            >
              Today
            </div>
            <div
              className={`filter-chip ${filters.when === 'this_week' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, when: filters.when === 'this_week' ? '' : 'this_week'})}
            >
              This Week
            </div>
            <div
              className={`filter-chip ${filters.type === 'Workshop' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, type: filters.type === 'Workshop' ? '' : 'Workshop'})}
            >
              Workshops
            </div>
            <div
              className={`filter-chip ${filters.type === 'Career Fair' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, type: filters.type === 'Career Fair' ? '' : 'Career Fair'})}
            >
              Career Fairs
            </div>
            <div
              className={`filter-chip ${filters.format === 'online' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, format: filters.format === 'online' ? '' : 'online'})}
            >
              Online
            </div>
            <div
              className={`filter-chip ${filters.availableOnly ? 'active' : ''}`}
              onClick={() => setFilters({...filters, availableOnly: !filters.availableOnly})}
            >
              Available Only
            </div>
          </div>
        </div>
      </section>

      <section className="events-section" id="events">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : viewMode === 'calendar' ? (
            <EventCalendar events={filteredEvents} onEventClick={handleEventClick} />
          ) : filteredEvents.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-calendar-times no-results-icon"></i>
              <h3 className="no-results-title">No events found</h3>
              <p className="no-results-text">
                {searchTerm || Object.values(filters).some(f => f)
                  ? 'Try adjusting your filters or search terms'
                  : 'Check back soon for upcoming events'}
              </p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
                  <div className="event-image">
                    {event.image_url && (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div className="event-badges">
                      <span className={`event-badge ${getFormatBadgeClass(event.event_format)}`}>
                        {event.event_format}
                      </span>
                    </div>
                    <div className="event-date-badge">
                      <div className="date-month">
                        {new Date(event.event_date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                      <div className="date-day">
                        {new Date(event.event_date).getDate()}
                      </div>
                    </div>
                  </div>
                  <div className="event-content">
                    <div className="event-type">
                      <i className={`fas ${getTypeIcon(event.event_type)}`}></i>
                      <span>{event.event_type}</span>
                    </div>
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-details">
                      <div className="detail-row">
                        <i className="far fa-clock"></i>
                        <span>{formatTimeRange(event.event_time)}</span>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="event-footer">
                      <span className={`spots-indicator ${getSpotsLeftClass(event)}`}>
                        {getSpotsLeftText(event)}
                      </span>
                      <button
                        className="btn-rsvp"
                        disabled={event.capacity - event.spots_taken <= 0 && false}
                      >
                        {event.capacity - event.spots_taken <= 0 ? 'Join Waitlist' : 'RSVP'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedEvent(null)
          }}
          onRSVP={handleRSVP}
        />
      )}

      {showRSVPModal && selectedEvent && (
        <RSVPModal
          event={selectedEvent}
          onClose={() => {
            setShowRSVPModal(false)
            setSelectedEvent(null)
          }}
          onSuccess={handleRSVPSuccess}
        />
      )}

      <Navigation />
    </>
  )
}