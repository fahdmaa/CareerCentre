'use client'

import { useState, useEffect } from 'react'
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
  guest_speakers?: Array<{
    name: string
    occupation: string
    bio: string
    photo: string
    linkedin: string
  }>
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
  onSuccess?: () => void
}

export default function EventDetailsModal({ event, onClose, onRSVP, onSuccess }: EventDetailsModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentYear: '',
    studentProgram: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const spotsLeft = event.capacity - event.spots_taken
  const isWaitlist = spotsLeft <= 0

  // Check if event is in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(event.event_date)
  eventDate.setHours(0, 0, 0, 0)
  const isPastEvent = eventDate < today

  // Hide navigation when modal opens
  useEffect(() => {
    const nav = document.querySelector('.pill-navbar')
    if (nav) {
      (nav as HTMLElement).style.display = 'none'
    }
    return () => {
      if (nav) {
        (nav as HTMLElement).style.display = ''
      }
    }
  }, [])

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowRegistrationForm(true)
  }

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          studentName: formData.studentName,
          studentEmail: formData.studentEmail,
          studentPhone: '',
          studentMajor: formData.studentProgram || 'Not specified',
          yearOfStudy: formData.studentYear || 'Not specified'
        })
      })

      const data = await response.json()
      console.log('Registration response:', { status: response.ok, data })

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      const message = data.on_waitlist && data.waitlist_position
        ? `You're on the waitlist! Position #${data.waitlist_position}. We'll notify you if a spot opens.`
        : "You're registered! Check your email for confirmation details."

      console.log('Setting success message:', message)
      setSuccessMessage(message)

      // Call onSuccess to refresh events list
      if (onSuccess) {
        console.log('Calling onSuccess to refresh events')
        onSuccess()
      }

      // Close modal after showing success message
      setTimeout(() => {
        console.log('Auto-closing modal')
        handleClose()
      }, 2500)
    } catch (error: any) {
      console.error('RSVP error:', error)
      setError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsClosing(true)

    // Show navigation again
    const nav = document.querySelector('.pill-navbar')
    if (nav) {
      (nav as HTMLElement).style.display = ''
    }

    setTimeout(() => {
      onClose()
    }, 200)
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
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      transition: 'opacity 0.2s ease-out',
      opacity: isClosing ? 0 : 1
    },
    container: {
      background: 'white',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '85vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative' as const,
      transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
      transform: isClosing ? 'translateY(20px)' : 'translateY(0)',
      opacity: isClosing ? 0 : 1
    },
    header: {
      background: 'linear-gradient(135deg, #00A651 0%, #00C853 100%)',
      padding: '32px 32px 24px',
      color: 'white',
      position: 'relative' as const
    },
    closeBtn: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.3s',
      zIndex: 10,
      fontSize: '16px',
      color: 'white'
    },
    badges: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px'
    },
    badge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      color: 'white',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '8px',
      lineHeight: '1.3'
    },
    subtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    body: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '24px 32px 100px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '24px',
      paddingBottom: '24px',
      borderBottom: '1px solid #f0f0f0'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px'
    },
    infoLabel: {
      fontSize: '11px',
      color: '#999',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      fontWeight: '600'
    },
    infoValue: {
      fontSize: '14px',
      color: '#333',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoIcon: {
      color: '#00A651',
      fontSize: '16px'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#00A651',
      marginBottom: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px'
    },
    description: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#666'
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
      padding: '20px 32px',
      background: 'white',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      gap: '12px'
    },
    btnSecondary: {
      padding: '14px 28px',
      borderRadius: '30px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      border: '2px solid #e5e7eb',
      background: 'white',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    btnPrimary: {
      flex: 1,
      padding: '14px 28px',
      borderRadius: '30px',
      fontSize: '14px',
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
    speakerSection: {
      marginTop: 'auto'
    },
    speakerTitle: {
      fontSize: '11px',
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: '12px',
      fontWeight: '600'
    },
    speakerItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      marginBottom: '8px'
    },
    speakerAvatarSmall: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'white',
      color: '#00A651',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '700',
      flexShrink: 0
    },
    speakerInfo: {
      flex: 1,
      minWidth: 0
    },
    speakerName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '2px'
    },
    speakerRole: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '400'
    },
    tagsContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap' as const
    },
    tag: {
      padding: '8px 16px',
      background: 'rgba(0, 166, 81, 0.1)',
      borderRadius: '20px',
      fontSize: '13px',
      color: '#00A651',
      fontWeight: '500'
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
    <>
      <style>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          50% {
            transform: scale(1.02) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.container} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>

        <div style={styles.header}>
          <div style={styles.badges}>
            <span style={styles.badge}>
              <i className={`fas ${getFormatIcon(event.event_format)}`}></i>
              {event.event_format}
            </span>
            <span style={styles.badge}>
              <i className={`fas ${getTypeIcon(event.event_type)}`}></i>
              {event.event_type}
            </span>
            {isPastEvent && (
              <span style={{
                ...styles.badge,
                background: '#fee2e2',
                color: '#dc2626'
              }}>
                <i className="fas fa-history"></i>
                Past Event
              </span>
            )}
          </div>
          <h2 style={styles.title}>{event.title}</h2>
          {event.host_org && (
            <div style={styles.subtitle}>
              <i className="fas fa-building"></i>
              Hosted by {event.host_org}
            </div>
          )}
        </div>

        {!showRegistrationForm && (
          <div style={styles.body}>
            {/* Event Info Grid */}
            <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>DATE</div>
              <div style={styles.infoValue}>
                <i className="far fa-calendar" style={styles.infoIcon}></i>
                {formatDate(event.event_date)}
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>TIME</div>
              <div style={styles.infoValue}>
                <i className="far fa-clock" style={styles.infoIcon}></i>
                {formatTime(event.event_time)}
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>LOCATION</div>
              <div style={styles.infoValue}>
                <i className="fas fa-map-marker-alt" style={styles.infoIcon}></i>
                {event.location}
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>CAPACITY</div>
              <div style={styles.infoValue}>
                <i className="fas fa-users" style={styles.infoIcon}></i>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full - Waitlist'}
              </div>
            </div>
          </div>

          {/* Guest Speakers */}
          {((event.guest_speakers && event.guest_speakers.length > 0) || event.guest_speaker_name) && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {event.guest_speakers && event.guest_speakers.length > 1 ? 'Guest Speakers' : 'Guest Speaker'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Show new guest_speakers array if available */}
                {event.guest_speakers && event.guest_speakers.length > 0 ? (
                  event.guest_speakers.map((speaker, index) => (
                    <div key={index} style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      {speaker.photo ? (
                        <img
                          src={speaker.photo}
                          alt={speaker.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '2px solid #00A651'
                          }}
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00A651, #00C853)',
                        color: 'white',
                        display: speaker.photo ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        {speaker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                          {speaker.name}
                        </div>
                        {speaker.occupation && (
                          <div style={{ fontSize: '13px', color: '#00A651', fontWeight: '500', marginBottom: '4px' }}>
                            {speaker.occupation}
                          </div>
                        )}
                        {speaker.linkedin && (
                          <a
                            href={speaker.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: '#0077b5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="fab fa-linkedin"></i>
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : event.guest_speaker_name ? (
                  /* Fallback to old single speaker format */
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00A651, #00C853)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {event.guest_speaker_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        {event.guest_speaker_name}
                      </div>
                      {event.guest_speaker_occupation && (
                        <div style={{ fontSize: '13px', color: '#00A651', fontWeight: '500' }}>
                          {event.guest_speaker_occupation}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {event.description && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>About this event</h3>
              <p style={styles.description}>{event.description}</p>
            </div>
          )}

          {event.agenda && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Agenda</h3>
              <div style={styles.description}>{event.agenda}</div>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Tags</h3>
              <div style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <span key={index} style={styles.tag}>#{tag}</span>
                ))}
              </div>
            </div>
          )}
          </div>
        )}

        {!showRegistrationForm ? (
          <div style={styles.footer}>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={handleClose}
            >
              Close
            </button>
            {isPastEvent ? (
              <div style={{
                flex: 1,
                padding: '14px 28px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                background: '#f3f4f6',
                color: '#9ca3af',
                border: '2px solid #e5e7eb'
              }}>
                Event Has Ended
              </div>
            ) : (
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={handleRegisterClick}
              >
                {isWaitlist ? 'Join Waitlist' : 'Register Now'}
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px',
              paddingBottom: '100px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 166, 81, 0.3) transparent'
            } as React.CSSProperties}>
              <h3 style={{fontSize: '20px', fontWeight: '700', color: '#00A651', marginBottom: '8px'}}>
                {isWaitlist ? 'Join Waitlist' : 'Complete Registration'}
              </h3>
              <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '28px'}}>
                Please fill in your details to register for this event
              </p>

              {error && (
                <div style={{background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', color: '#991b1b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              {successMessage && (
                <div style={{
                  background: 'linear-gradient(135deg, #00A651 0%, #00C853 100%)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  marginBottom: '24px',
                  color: 'white',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0, 166, 81, 0.3)',
                  animation: 'bounceIn 0.5s ease-out'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-check"></i>
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: '600', marginBottom: '4px'}}>Success!</div>
                    <div style={{fontSize: '14px', opacity: 0.95}}>{successMessage}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRegistration} style={{opacity: successMessage ? 0.5 : 1, pointerEvents: successMessage ? 'none' : 'auto', transition: 'opacity 0.3s'}}>
                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                    Full Name <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!successMessage}
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', transition: 'all 0.3s', outline: 'none'}}
                    placeholder="Enter your full name"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00A651'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                    EMSI Email <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                    style={{width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', transition: 'all 0.3s', outline: 'none'}}
                    placeholder="your.name@emsi.ma"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00A651'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                      Year of Study
                    </label>
                    <select
                      value={formData.studentYear}
                      onChange={(e) => setFormData({...formData, studentYear: e.target.value})}
                      style={{width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', transition: 'all 0.3s', outline: 'none', background: 'white'}}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#00A651'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <option value="">Select year</option>
                      <option value="1st year">1st year</option>
                      <option value="2nd year">2nd year</option>
                      <option value="3rd year">3rd year</option>
                      <option value="4th year">4th year</option>
                      <option value="5th year">5th year</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>
                      Program/Major
                    </label>
                    <input
                      type="text"
                      value={formData.studentProgram}
                      onChange={(e) => setFormData({...formData, studentProgram: e.target.value})}
                      style={{width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', transition: 'all 0.3s', outline: 'none'}}
                      placeholder="e.g., Computer Science"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#00A651'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div style={{padding: '20px 32px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '12px'}}>
              <button
                type="button"
                onClick={() => setShowRegistrationForm(false)}
                style={{flex: 1, padding: '14px 24px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '30px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s', color: '#6b7280'}}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmitRegistration}
                style={{flex: 1, padding: '14px 24px', background: '#00A651', color: 'white', border: 'none', borderRadius: '30px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.3s'}}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#008a43')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#00A651')}
              >
                {loading ? 'Submitting...' : (isWaitlist ? 'Join Waitlist' : 'Confirm Registration')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}