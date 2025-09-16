'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../../../components/Navigation'
import ClientLayout from '../../../components/ClientLayout'
import RSVPModal from '../../../components/RSVPModal'
import { supabase } from '../../../lib/supabase'

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
  agenda?: string
  speakers?: string
  what_to_bring?: string
  meeting_link?: string
}

export default function EventDetailPage() {
  const params = useParams()
  const slug = params?.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchEventDetail()
    }
  }, [slug])

  const fetchEventDetail = async () => {
    setLoading(true)
    try {
      // Fetch event by slug
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single()

      if (eventError) throw eventError

      if (eventData) {
        setEvent(eventData)

        // Fetch related events (same type or tags)
        const { data: relatedData, error: relatedError } = await supabase
          .from('events')
          .select('*')
          .neq('id', eventData.id)
          .eq('event_type', eventData.event_type)
          .gte('event_date', new Date().toISOString().split('T')[0])
          .limit(3)

        if (!relatedError && relatedData) {
          setRelatedEvents(relatedData)
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      // Fallback to sample data
      const sampleEvent: Event = {
        id: 1,
        title: "Cloud Computing Essentials",
        slug: "cloud-computing-essentials",
        description: "Join us for an immersive workshop on cloud computing fundamentals. This hands-on session will introduce you to the core concepts of cloud computing, including Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS). You'll gain practical experience with AWS and Azure, learning how to deploy applications, manage storage, and optimize costs in the cloud. Perfect for students and professionals looking to enhance their technical skills and prepare for cloud certifications.",
        event_date: "2024-10-20",
        event_time: "14:00:00",
        location: "Computer Lab 3",
        event_type: "workshop",
        event_format: "on-campus",
        city: "Marrakech",
        campus: "EMSI Main Campus",
        tags: ["cloud", "aws", "azure", "technology", "hands-on"],
        host_org: "EMSI IT Department",
        capacity: 40,
        spots_taken: 12,
        image_url: "/images/career-event-students.jpg",
        agenda: "2:00 PM - Introduction to Cloud Computing\n2:30 PM - AWS Fundamentals\n3:15 PM - Break\n3:30 PM - Azure Services Overview\n4:15 PM - Hands-on Lab: Deploy Your First App\n5:00 PM - Q&A and Networking",
        speakers: "Dr. Ahmed Benali - Cloud Solutions Architect at Microsoft\nSarah El Fassi - AWS Certified Developer\nMohamed Tazi - EMSI IT Department Head",
        what_to_bring: "Laptop with internet connection\nNote-taking materials\nGitHub account (create one at github.com)\nOptional: AWS Free Tier account"
      }
      setEvent(sampleEvent)
    } finally {
      setLoading(false)
    }
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

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  const handleAddToCalendar = () => {
    if (!event) return

    const startDate = new Date(`${event.event_date}T${event.event_time}`)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration

    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`

    window.open(calendarUrl, '_blank')
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </ClientLayout>
    )
  }

  if (!event) {
    return (
      <ClientLayout>
        <div className="error-container">
          <h2>Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events" className="btn-back">
            Back to Events
          </Link>
        </div>
      </ClientLayout>
    )
  }

  const spotsLeft = event.capacity - event.spots_taken
  const spotsClass = spotsLeft <= 0 ? 'full' : spotsLeft <= 5 ? 'limited' : 'available'

  return (
    <ClientLayout>
    <>
      <style jsx>{`
        .loading-container, .error-container {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top-color: #00A651;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-back {
          background: #00A651;
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
          display: inline-block;
        }

        .event-detail-hero {
          position: relative;
          height: 400px;
          background: linear-gradient(135deg, #00A651 0%, #00C853 100%);
          overflow: hidden;
        }

        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.2;
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 20px 40px;
          color: white;
        }

        .event-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .event-detail-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .event-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          font-size: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .event-detail-container {
          max-width: 1200px;
          margin: -60px auto 60px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .detail-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
        }

        .detail-main {
          padding: 40px;
        }

        .detail-sidebar {
          background: #f9fafb;
          padding: 40px 24px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
        }

        .section-content {
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 32px;
        }

        .agenda-item, .speaker-item, .bring-item {
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .agenda-item:last-child, .speaker-item:last-child, .bring-item:last-child {
          border-bottom: none;
        }

        .event-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }

        .tag {
          background: #f3f4f6;
          color: #374151;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .capacity-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .capacity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .capacity-label {
          font-size: 14px;
          color: #6b7280;
        }

        .spots-text {
          font-size: 16px;
          font-weight: 700;
        }

        .spots-text.available {
          color: #00A651;
        }

        .spots-text.limited {
          color: #f59e0b;
        }

        .spots-text.full {
          color: #ef4444;
        }

        .capacity-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .capacity-fill {
          height: 100%;
          background: #00A651;
          transition: width 0.3s;
        }

        .capacity-fill.almost-full {
          background: #f59e0b;
        }

        .capacity-fill.full {
          background: #ef4444;
        }

        .btn-rsvp-large {
          width: 100%;
          background: #00A651;
          color: white;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 16px;
        }

        .btn-rsvp-large:hover:not(:disabled) {
          background: #008a43;
          transform: translateY(-2px);
        }

        .btn-rsvp-large:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-action {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          text-decoration: none;
          color: #374151;
        }

        .btn-action:hover {
          background: #f3f4f6;
        }

        .location-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-top: 20px;
        }

        .location-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .location-text {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
        }

        .location-link {
          color: #00A651;
          text-decoration: none;
          font-weight: 500;
        }

        .location-link:hover {
          text-decoration: underline;
        }

        .related-section {
          max-width: 1200px;
          margin: 60px auto;
          padding: 0 20px;
        }

        .related-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 32px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .related-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s;
          cursor: pointer;
        }

        .related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .related-image {
          height: 180px;
          background: #f3f4f6;
          position: relative;
        }

        .related-content {
          padding: 20px;
        }

        .related-date {
          font-size: 13px;
          color: #00A651;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .related-event-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .related-location {
          font-size: 14px;
          color: #6b7280;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #111827;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 992px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .detail-sidebar {
            padding: 24px;
          }
        }

        @media (max-width: 768px) {
          .event-detail-title {
            font-size: 32px;
          }

          .hero-content {
            padding: 80px 20px 40px;
          }

          .event-meta {
            flex-direction: column;
            gap: 12px;
          }

          .detail-main {
            padding: 24px;
          }

          .related-grid {
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

      <section className="event-detail-hero">
        {event.image_url && (
          <div className="hero-image">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="hero-content">
          <span className="event-badge">
            {event.event_type.replace('-', ' ').toUpperCase()}
          </span>
          <h1 className="event-detail-title">{event.title}</h1>
          <div className="event-meta">
            <div className="meta-item">
              <i className="fas fa-calendar"></i>
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-clock"></i>
              <span>{formatTime(event.event_time)}</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{event.location}</span>
            </div>
            {event.host_org && (
              <div className="meta-item">
                <i className="fas fa-building"></i>
                <span>{event.host_org}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="event-detail-container">
        <div className="detail-card">
          <div className="detail-grid">
            <div className="detail-main">
              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  {event.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="section">
                <h2 className="section-title">Description</h2>
                <div className="section-content">
                  {event.description}
                </div>
              </div>

              {event.agenda && (
                <div className="section">
                  <h2 className="section-title">Agenda</h2>
                  <div className="section-content">
                    {event.agenda.split('\n').map((item, idx) => (
                      <div key={idx} className="agenda-item">{item}</div>
                    ))}
                  </div>
                </div>
              )}

              {event.speakers && (
                <div className="section">
                  <h2 className="section-title">Speakers</h2>
                  <div className="section-content">
                    {event.speakers.split('\n').map((speaker, idx) => (
                      <div key={idx} className="speaker-item">{speaker}</div>
                    ))}
                  </div>
                </div>
              )}

              {event.what_to_bring && (
                <div className="section">
                  <h2 className="section-title">What to Bring</h2>
                  <div className="section-content">
                    {event.what_to_bring.split('\n').map((item, idx) => (
                      <div key={idx} className="bring-item">{item}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-sidebar">
              <div className="capacity-card">
                <div className="capacity-header">
                  <span className="capacity-label">Capacity</span>
                  <span className={`spots-text ${spotsClass}`}>
                    {spotsLeft <= 0 ? 'Event Full' : `${spotsLeft} spots left`}
                  </span>
                </div>
                <div className="capacity-bar">
                  <div
                    className={`capacity-fill ${spotsLeft <= 5 ? 'almost-full' : ''} ${spotsLeft <= 0 ? 'full' : ''}`}
                    style={{ width: `${(event.spots_taken / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                className="btn-rsvp-large"
                onClick={() => setShowRSVPModal(true)}
                disabled={false}
              >
                {spotsLeft <= 0 ? 'Join Waitlist' : 'RSVP for Event'}
              </button>

              <div className="action-buttons">
                <button className="btn-action" onClick={handleShare}>
                  <i className="fas fa-share"></i> Share
                </button>
                <button className="btn-action" onClick={handleAddToCalendar}>
                  <i className="fas fa-calendar-plus"></i> Add to Calendar
                </button>
              </div>

              <div className="location-card">
                <div className="location-title">Location</div>
                <div className="location-text">
                  {event.location}
                  {event.campus && <div>{event.campus}</div>}
                  {event.city && <div>{event.city}</div>}
                  {event.event_format === 'online' && event.meeting_link && (
                    <div>
                      <a href={event.meeting_link} className="location-link" target="_blank" rel="noopener noreferrer">
                        Join Online <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  )}
                  {event.event_format === 'on-campus' && (
                    <div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(event.location + ' ' + (event.campus || ''))}`}
                        className="location-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Map <i className="fas fa-external-link-alt"></i>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedEvents.length > 0 && (
        <section className="related-section">
          <h2 className="related-title">Related Events</h2>
          <div className="related-grid">
            {relatedEvents.map(relatedEvent => (
              <Link
                key={relatedEvent.id}
                href={`/events/${relatedEvent.slug}`}
                className="related-card"
              >
                <div className="related-image">
                  <Image
                    src={relatedEvent.image_url || '/images/career-event-students.jpg'}
                    alt={relatedEvent.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="related-content">
                  <div className="related-date">
                    {formatDate(relatedEvent.event_date)}
                  </div>
                  <h3 className="related-event-title">{relatedEvent.title}</h3>
                  <div className="related-location">
                    <i className="fas fa-map-marker-alt"></i> {relatedEvent.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showShareToast && (
        <div className="toast">
          <i className="fas fa-check-circle"></i> Link copied to clipboard!
        </div>
      )}

      {showRSVPModal && event && (
        <RSVPModal
          event={event}
          onClose={() => setShowRSVPModal(false)}
          onSuccess={() => {
            setShowRSVPModal(false)
            fetchEventDetail() // Refresh event data
          }}
        />
      )}

      <Navigation />
    </>
    </ClientLayout>
  )
}