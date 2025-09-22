'use client'

import { useState } from 'react'
import Image from 'next/image'

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
  speakers?: string[]
  what_to_bring?: string
  meeting_link?: string
  guest_speaker_name?: string
  guest_speaker_occupation?: string
  guest_speaker_bio?: string
  guest_speaker_photo?: string
  guest_speaker_linkedin?: string
}

interface EventDetailsModalProps {
  event: Event
  onClose: () => void
  onRSVP: () => void
}

export default function EventDetailsModal({ event, onClose, onRSVP }: EventDetailsModalProps) {
  const spotsLeft = event.capacity - event.spots_taken
  const isWaitlist = spotsLeft <= 0

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('Register Now button clicked in EventDetailsModal')
    alert('Register button clicked! Check console for details.')
    console.log('Event details:', event)
    console.log('onRSVP function:', onRSVP)
    console.log('Type of onRSVP:', typeof onRSVP)

    if (typeof onRSVP === 'function') {
      console.log('Calling onRSVP function...')
      onRSVP()
    } else {
      console.error('onRSVP is not a function!', onRSVP)
      alert('Error: onRSVP is not properly defined')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${period}`
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

  const getFormatIcon = (format: string) => {
    switch(format.toLowerCase()) {
      case 'online': return 'fa-video'
      case 'hybrid': return 'fa-laptop-house'
      default: return 'fa-map-marker-alt'
    }
  }

  const getFormatColor = (format: string) => {
    switch(format.toLowerCase()) {
      case 'online': return '#3b82f6'
      case 'hybrid': return '#a855f7'
      default: return '#22c55e'
    }
  }

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    },
    container: {
      background: 'white',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    header: {
      position: 'relative' as const,
      height: '250px',
      background: 'linear-gradient(135deg, #00A651, #00C853)',
      overflow: 'hidden'
    },
    headerOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'flex-end',
      padding: '24px'
    },
    closeBtn: {
      position: 'absolute' as const,
      top: '20px',
      right: '20px',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.3s',
      zIndex: 10
    },
    badges: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px'
    },
    badge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white',
      backdropFilter: 'blur(8px)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    body: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '32px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px',
      marginBottom: '32px'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    infoIcon: {
      width: '40px',
      height: '40px',
      background: '#f3f4f6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#00A651',
      flexShrink: 0
    },
    infoContent: {
      flex: 1
    },
    infoLabel: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: '4px'
    },
    infoValue: {
      fontSize: '15px',
      color: '#1f2937',
      fontWeight: '500'
    },
    section: {
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    description: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#4b5563'
    },
    capacitySection: {
      background: '#f9fafb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '32px'
    },
    capacityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    capacityTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#4b5563'
    },
    capacityNumbers: {
      fontSize: '14px',
      color: '#6b7280'
    },
    capacityBar: {
      height: '8px',
      background: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    capacityFill: {
      height: '100%',
      background: spotsLeft <= 0 ? '#ef4444' : spotsLeft <= 5 ? '#f59e0b' : '#00A651',
      transition: 'width 0.3s ease',
      width: `${(event.spots_taken / event.capacity) * 100}%`
    },
    waitlistNotice: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '12px 16px',
      marginTop: '12px',
      color: '#991b1b',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    footer: {
      padding: '24px 32px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      gap: '16px',
      background: 'white'
    },
    btnSecondary: {
      flex: 1,
      padding: '14px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: '1px solid #d1d5db',
      background: 'white',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    btnPrimary: {
      flex: 1,
      padding: '14px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: 'none',
      background: isWaitlist ? '#f59e0b' : '#00A651',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    tagsContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap' as const
    },
    tag: {
      padding: '6px 12px',
      background: '#f3f4f6',
      borderRadius: '16px',
      fontSize: '13px',
      color: '#4b5563'
    },
    speakersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px'
    },
    speakerCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '8px'
    },
    speakerAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#00A651',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600'
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          {event.image_url && (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              style={{ objectFit: 'cover', opacity: 0.9 }}
            />
          )}
          <div style={styles.headerOverlay}>
            <button style={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
            <div style={styles.badges}>
              <span style={{ ...styles.badge, backgroundColor: getFormatColor(event.event_format) }}>
                <i className={`fas ${getFormatIcon(event.event_format)}`}></i>
                {event.event_format}
              </span>
              <span style={{ ...styles.badge, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <i className={`fas ${getTypeIcon(event.event_type)}`}></i>
                {event.event_type}
              </span>
            </div>
            <h2 style={styles.title}>{event.title}</h2>
            {event.host_org && (
              <div style={styles.subtitle}>
                <i className="fas fa-building"></i>
                Hosted by {event.host_org}
              </div>
            )}
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <i className="far fa-calendar"></i>
              </div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Date</div>
                <div style={styles.infoValue}>{formatDate(event.event_date)}</div>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <i className="far fa-clock"></i>
              </div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Time</div>
                <div style={styles.infoValue}>{formatTime(event.event_time)}</div>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Location</div>
                <div style={styles.infoValue}>
                  {event.location}
                  {event.campus && `, ${event.campus}`}
                  {event.city && `, ${event.city}`}
                </div>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Capacity</div>
                <div style={styles.infoValue}>
                  {event.spots_taken} / {event.capacity} registered
                </div>
              </div>
            </div>
          </div>

          {event.description && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-info-circle"></i>
                About this event
              </h3>
              <p style={styles.description}>{event.description}</p>
            </div>
          )}

          {event.guest_speaker_name && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-user-tie"></i>
                Guest Speaker
              </h3>
              <div style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                background: '#f9fafb',
                padding: '20px',
                borderRadius: '12px'
              }}>
                {event.guest_speaker_photo && (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#e5e7eb'
                  }}>
                    <Image
                      src={event.guest_speaker_photo}
                      alt={event.guest_speaker_name}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                {!event.guest_speaker_photo && (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00A651, #00C853)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {event.guest_speaker_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '4px'
                  }}>
                    {event.guest_speaker_name}
                  </h4>
                  <p style={{
                    fontSize: '16px',
                    color: '#00A651',
                    fontWeight: '500',
                    marginBottom: '12px'
                  }}>
                    {event.guest_speaker_occupation}
                  </p>
                  {event.guest_speaker_bio && (
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      lineHeight: '1.5',
                      marginBottom: '12px'
                    }}>
                      {event.guest_speaker_bio}
                    </p>
                  )}
                  {event.guest_speaker_linkedin && (
                    <a
                      href={event.guest_speaker_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        background: '#0077b5',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#005885'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#0077b5'}
                    >
                      <i className="fab fa-linkedin"></i>
                      Connect on LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {event.agenda && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-list-ul"></i>
                Agenda
              </h3>
              <div style={styles.description}>{event.agenda}</div>
            </div>
          )}

          {event.speakers && event.speakers.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-microphone"></i>
                Speakers
              </h3>
              <div style={styles.speakersGrid}>
                {event.speakers.map((speaker, index) => (
                  <div key={index} style={styles.speakerCard}>
                    <div style={styles.speakerAvatar}>
                      {speaker.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {speaker}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.what_to_bring && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-backpack"></i>
                What to bring
              </h3>
              <p style={styles.description}>{event.what_to_bring}</p>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-tags"></i>
                Tags
              </h3>
              <div style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <span key={index} style={styles.tag}>#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div style={styles.capacitySection}>
            <div style={styles.capacityHeader}>
              <span style={styles.capacityTitle}>Registration Status</span>
              <span style={styles.capacityNumbers}>
                {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Event full'}
              </span>
            </div>
            <div style={styles.capacityBar}>
              <div style={styles.capacityFill}></div>
            </div>
            {isWaitlist && (
              <div style={styles.waitlistNotice}>
                <i className="fas fa-exclamation-circle"></i>
                This event is full. You can join the waitlist.
              </div>
            )}
          </div>

          {event.meeting_link && event.event_format.toLowerCase() !== 'on-campus' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <i className="fas fa-link"></i>
                Meeting Link
              </h3>
              <p style={styles.description}>
                A meeting link will be provided to registered participants before the event.
              </p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            style={styles.btnSecondary}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            style={styles.btnPrimary}
            onClick={handleRegisterClick}
            onMouseDown={(e) => {
              console.log('Button mousedown event triggered')
              e.stopPropagation()
            }}
          >
            <i className={`fas ${isWaitlist ? 'fa-clock' : 'fa-check'}`}></i>
            {isWaitlist ? 'Join Waitlist' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  )
}