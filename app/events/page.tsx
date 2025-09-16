'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import ClientLayout from '../../components/ClientLayout'
import EventCalendar from '../../components/EventCalendar'
import RSVPModal from '../../components/RSVPModal'
import { supabase } from '../../lib/supabase'

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

  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents()
  }, [showPastEvents])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (!showPastEvents) {
        query = query.gte('event_date', new Date().toISOString().split('T')[0])
      }

      const { data, error } = await query

      if (error) throw error

      setEvents(data || [])
      setFilteredEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      // Fallback to sample data if database not available
      const sampleEvents: Event[] = [
        {
          id: 1,
          title: "Cloud Computing Essentials",
          slug: "cloud-computing-essentials",
          description: "Learn the fundamentals of cloud computing with AWS and Azure.",
          event_date: "2024-10-20",
          event_time: "14:00:00",
          location: "Computer Lab 3",
          event_type: "workshop",
          event_format: "on-campus",
          city: "Marrakech",
          campus: "EMSI Main Campus",
          tags: ["cloud", "aws", "azure"],
          host_org: "EMSI IT Department",
          capacity: 40,
          spots_taken: 12,
          image_url: "/images/career-event-students.jpg"
        },
        {
          id: 2,
          title: "Alumni Success Stories",
          slug: "alumni-success-stories",
          description: "Join successful EMSI alumni who built their own tech startups.",
          event_date: "2024-10-22",
          event_time: "16:00:00",
          location: "Online via Zoom",
          event_type: "alumni-talk",
          event_format: "online",
          tags: ["entrepreneurship", "startup"],
          host_org: "EMSI Alumni Association",
          capacity: 100,
          spots_taken: 45,
          image_url: "/images/career-fair.jpg",
          featured: true
        }
      ]
      setEvents(sampleEvents)
      setFilteredEvents(sampleEvents)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...events]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // When filter
    if (filters.when) {
      const today = new Date()
      const eventDate = (event: Event) => new Date(event.event_date)

      switch (filters.when) {
        case 'today':
          filtered = filtered.filter(event =>
            eventDate(event).toDateString() === today.toDateString()
          )
          break
        case 'this-week':
          const weekEnd = new Date(today)
          weekEnd.setDate(today.getDate() + 7)
          filtered = filtered.filter(event =>
            eventDate(event) >= today && eventDate(event) <= weekEnd
          )
          break
        case 'this-month':
          filtered = filtered.filter(event =>
            eventDate(event).getMonth() === today.getMonth() &&
            eventDate(event).getFullYear() === today.getFullYear()
          )
          break
      }
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
        event.city === filters.location || event.campus === filters.location
      )
    }

    // Available spots filter
    if (filters.availableOnly) {
      filtered = filtered.filter(event =>
        event.capacity - event.spots_taken > 0
      )
    }

    setFilteredEvents(filtered)
  }, [events, filters, searchTerm])

  const handleRSVP = (event: Event) => {
    setSelectedEvent(event)
    setShowRSVPModal(true)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${period}`
  }

  const getSpotsLeftText = (event: Event) => {
    const spotsLeft = event.capacity - event.spots_taken
    if (spotsLeft <= 0) return 'Full · Join waitlist'
    if (spotsLeft === 1) return '1 spot left'
    return `${spotsLeft} spots left`
  }

  const getFormatBadgeClass = (format: string) => {
    switch(format) {
      case 'online': return 'badge-online'
      case 'hybrid': return 'badge-hybrid'
      default: return 'badge-campus'
    }
  }

  return (
    <ClientLayout>
    <>
      <style jsx>{`
        .events-hero {
          padding: 100px 0 60px;
          background: linear-gradient(135deg, #00A651 0%, #00C853 100%);
          color: white;
          text-align: center;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          text-transform: capitalize;
        }

        .hero-subtitle {
          font-size: 20px;
          opacity: 0.95;
          margin-bottom: 32px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
        }

        .btn-hero-primary, .btn-hero-secondary {
          padding: 14px 32px;
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
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
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

        .events-controls {
          background: white;
          padding: 24px 0;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .controls-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .controls-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-box {
          position: relative;
          width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          outline: none;
          transition: all 0.3s;
        }

        .search-input:focus {
          border-color: #00A651;
          box-shadow: 0 0 0 3px rgba(0, 166, 81, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
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

        .toggle-btn {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: white;
          color: #00A651;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filters-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          outline: none;
          transition: all 0.3s;
        }

        .filter-select:focus {
          border-color: #00A651;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }

        .filter-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: #00A651;
          cursor: pointer;
        }

        .events-content {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .event-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .event-card.featured {
          border: 2px solid #00A651;
        }

        .featured-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #00A651;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }

        .event-image {
          position: relative;
          height: 200px;
          background: #f3f4f6;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-content {
          padding: 20px;
        }

        .event-header {
          margin-bottom: 12px;
        }

        .event-date-time {
          font-size: 13px;
          color: #00A651;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .event-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .event-host {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .event-location {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #374151;
        }

        .location-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }

        .badge-online {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-hybrid {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .badge-campus {
          background: #d1fae5;
          color: #065f46;
        }

        .event-capacity {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 16px;
        }

        .spots-left {
          font-size: 14px;
          font-weight: 600;
        }

        .spots-left.available {
          color: #00A651;
        }

        .spots-left.limited {
          color: #f59e0b;
        }

        .spots-left.full {
          color: #ef4444;
        }

        .event-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .event-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .event-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btn-rsvp {
          background: #00A651;
          color: white;
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          text-align: center;
        }

        .btn-rsvp:hover:not(:disabled) {
          background: #008a43;
          transform: translateY(-1px);
        }

        .btn-rsvp:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .rsvp-note {
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          margin-top: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 48px;
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 20px;
          color: #374151;
          margin-bottom: 8px;
        }

        .empty-text {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 24px;
        }

        .btn-clear-filters {
          background: #00A651;
          color: white;
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s;
        }

        .btn-clear-filters:hover {
          background: #008a43;
        }

        .past-events-link {
          color: #00A651;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 12px;
        }

        .past-events-link:hover {
          text-decoration: underline;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top-color: #00A651;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
            padding: 0 20px;
          }

          .btn-hero-primary, .btn-hero-secondary {
            width: 100%;
          }

          .controls-top {
            flex-direction: column;
            gap: 16px;
          }

          .search-box {
            width: 100%;
          }

          .filters-row {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select {
            width: 100%;
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
          <h1 className="hero-title">Upcoming events & workshops</h1>
          <p className="hero-subtitle">Grow your skills with weekly workshops, alumni talks, and career fairs.</p>
          <div className="hero-actions">
            {filteredEvents.length > 0 && filteredEvents[0] && (
              <button
                className="btn-hero-primary"
                onClick={() => handleRSVP(filteredEvents[0])}
              >
                See next event
              </button>
            )}
            <a href="#events-list" className="btn-hero-secondary">
              Browse all events
            </a>
          </div>
        </div>
      </section>

      <div className="events-controls">
        <div className="controls-container">
          <div className="controls-top">
            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search events"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i> List
              </button>
              <button
                className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <i className="fas fa-calendar"></i> Calendar
              </button>
            </div>
          </div>
          <div className="filters-row">
            <select
              className="filter-select"
              value={filters.when}
              onChange={(e) => setFilters({...filters, when: e.target.value})}
            >
              <option value="">When: All</option>
              <option value="today">Today</option>
              <option value="this-week">This week</option>
              <option value="this-month">This month</option>
            </select>
            <select
              className="filter-select"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Type: All</option>
              <option value="workshop">Workshop</option>
              <option value="alumni-talk">Alumni talk</option>
              <option value="career-fair">Career fair</option>
              <option value="info-session">Info session</option>
            </select>
            <select
              className="filter-select"
              value={filters.format}
              onChange={(e) => setFilters({...filters, format: e.target.value})}
            >
              <option value="">Format: All</option>
              <option value="on-campus">On-campus</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              className="filter-select"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">Location: All</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Casablanca">Casablanca</option>
              <option value="EMSI Main Campus">EMSI Main Campus</option>
            </select>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => setFilters({...filters, availableOnly: e.target.checked})}
              />
              Spots available only
            </label>
          </div>
        </div>
      </div>

      <section id="events-list" className="events-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : viewMode === 'list' ? (
          filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => {
                const spotsLeft = event.capacity - event.spots_taken
                const spotsClass = spotsLeft <= 0 ? 'full' : spotsLeft <= 5 ? 'limited' : 'available'

                return (
                  <div
                    key={event.id}
                    className={`event-card ${event.featured ? 'featured' : ''}`}
                  >
                    {event.featured && <span className="featured-badge">Featured</span>}
                    <div className="event-image">
                      <Image
                        src={event.image_url || '/images/career-event-students.jpg'}
                        alt={event.title}
                        width={400}
                        height={200}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="event-content">
                      <div className="event-header">
                        <div className="event-date-time">
                          {formatDate(event.event_date)} · {formatTime(event.event_time)}
                        </div>
                        <h3 className="event-title">{event.title}</h3>
                        {event.host_org && (
                          <div className="event-host">{event.host_org}</div>
                        )}
                      </div>
                      <div className="event-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                        <span className={`location-badge ${getFormatBadgeClass(event.event_format)}`}>
                          {event.event_format === 'on-campus' ? 'On-campus' :
                           event.event_format === 'online' ? 'Online' : 'Hybrid'}
                        </span>
                      </div>
                      <div className="event-capacity">
                        <span className={`spots-left ${spotsClass}`}>
                          {getSpotsLeftText(event)}
                        </span>
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="event-tags">
                          {event.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="event-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="event-footer">
                        <button
                          className="btn-rsvp"
                          onClick={() => handleRSVP(event)}
                          disabled={false}
                        >
                          {spotsLeft <= 0 ? 'Join waitlist' : 'RSVP'}
                        </button>
                      </div>
                      <p className="rsvp-note">You'll get a calendar invite.</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-calendar-times empty-icon"></i>
              <h3 className="empty-title">No events match your filters</h3>
              <p className="empty-text">
                Clear a filter or check past events.
              </p>
              <button
                className="btn-clear-filters"
                onClick={() => {
                  setFilters({
                    when: '',
                    type: '',
                    format: '',
                    location: '',
                    availableOnly: false
                  })
                  setSearchTerm('')
                }}
              >
                Clear all filters
              </button>
              {!showPastEvents && (
                <div>
                  <a
                    href="#"
                    className="past-events-link"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPastEvents(true)
                    }}
                  >
                    See past events <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              )}
            </div>
          )
        ) : (
          <EventCalendar
            events={filteredEvents}
            onEventClick={handleRSVP}
          />
        )}
      </section>

      {showRSVPModal && selectedEvent && (
        <RSVPModal
          event={selectedEvent}
          onClose={() => setShowRSVPModal(false)}
          onSuccess={() => {
            setShowRSVPModal(false)
            fetchEvents() // Refresh events after RSVP
          }}
        />
      )}

      <Navigation />
    </>
    </ClientLayout>
  )
}