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
}

interface EventDetailsModalProps {
  event: Event
  onClose: () => void
  onRSVP: () => void
}

export default function EventDetailsModal({ event, onClose, onRSVP }: EventDetailsModalProps) {
  const spotsLeft = event.capacity - event.spots_taken
  const isWaitlist = spotsLeft <= 0

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

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          padding: 20px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          position: relative;
          height: 250px;
          background: linear-gradient(135deg, #00A651, #00C853);
          overflow: hidden;
        }

        .modal-header-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.9;
        }

        .modal-header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
        }

        .close-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .event-badges {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .event-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .modal-title {
          font-size: 28px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00A651;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 15px;
          color: #1f2937;
          font-weight: 500;
        }

        .description-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .description-text {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
        }

        .agenda-section {
          margin-bottom: 32px;
        }

        .agenda-list {
          list-style: none;
          padding: 0;
        }

        .agenda-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .agenda-time {
          font-weight: 600;
          color: #00A651;
          min-width: 80px;
        }

        .agenda-content {
          flex: 1;
          color: #4b5563;
        }

        .speakers-section {
          margin-bottom: 32px;
        }

        .speakers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .speaker-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .speaker-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #00A651;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .speaker-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .tags-section {
          margin-bottom: 32px;
        }

        .tags-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 6px 12px;
          background: #f3f4f6;
          border-radius: 16px;
          font-size: 13px;
          color: #4b5563;
        }

        .capacity-section {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .capacity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .capacity-title {
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
        }

        .capacity-numbers {
          font-size: 14px;
          color: #6b7280;
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
          transition: width 0.3s ease;
        }

        .capacity-fill.warning {
          background: #f59e0b;
        }

        .capacity-fill.danger {
          background: #ef4444;
        }

        .waitlist-notice {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 12px;
          color: #991b1b;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-footer {
          padding: 24px 32px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 16px;
          background: white;
        }

        .btn {
          flex: 1;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        .btn-primary {
          background: #00A651;
          color: white;
        }

        .btn-primary:hover {
          background: #008a43;
          transform: translateY(-1px);
        }

        .btn-primary.waitlist {
          background: #f59e0b;
        }

        .btn-primary.waitlist:hover {
          background: #d97706;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .modal-container {
            max-width: 95%;
            margin: 10px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .modal-title {
            font-size: 24px;
          }

          .modal-body {
            padding: 24px;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            {event.image_url && (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="modal-header-image"
                style={{ objectFit: 'cover' }}
              />
            )}
            <div className="modal-header-overlay">
              <button className="close-btn" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
              <div className="event-badges">
                <span
                  className="event-badge"
                  style={{ backgroundColor: getFormatColor(event.event_format) }}
                >
                  <i className={`fas ${getFormatIcon(event.event_format)}`}></i>
                  {event.event_format}
                </span>
                <span
                  className="event-badge"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <i className={`fas ${getTypeIcon(event.event_type)}`}></i>
                  {event.event_type}
                </span>
              </div>
              <h2 className="modal-title">{event.title}</h2>
              {event.host_org && (
                <div className="modal-subtitle">
                  <i className="fas fa-building"></i>
                  Hosted by {event.host_org}
                </div>
              )}
            </div>
          </div>

          <div className="modal-body">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <i className="far fa-calendar"></i>
                </div>
                <div className="info-content">
                  <div className="info-label">Date</div>
                  <div className="info-value">{formatDate(event.event_date)}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <i className="far fa-clock"></i>
                </div>
                <div className="info-content">
                  <div className="info-label">Time</div>
                  <div className="info-value">{formatTime(event.event_time)}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-content">
                  <div className="info-label">Location</div>
                  <div className="info-value">
                    {event.location}
                    {event.campus && `, ${event.campus}`}
                    {event.city && `, ${event.city}`}
                  </div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="info-content">
                  <div className="info-label">Capacity</div>
                  <div className="info-value">
                    {event.spots_taken} / {event.capacity} registered
                  </div>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="description-section">
                <h3 className="section-title">
                  <i className="fas fa-info-circle"></i>
                  About this event
                </h3>
                <p className="description-text">{event.description}</p>
              </div>
            )}

            {event.agenda && (
              <div className="agenda-section">
                <h3 className="section-title">
                  <i className="fas fa-list-ul"></i>
                  Agenda
                </h3>
                <div className="description-text">{event.agenda}</div>
              </div>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <div className="speakers-section">
                <h3 className="section-title">
                  <i className="fas fa-microphone"></i>
                  Speakers
                </h3>
                <div className="speakers-grid">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="speaker-card">
                      <div className="speaker-avatar">
                        {speaker.charAt(0).toUpperCase()}
                      </div>
                      <div className="speaker-name">{speaker}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.what_to_bring && (
              <div className="description-section">
                <h3 className="section-title">
                  <i className="fas fa-backpack"></i>
                  What to bring
                </h3>
                <p className="description-text">{event.what_to_bring}</p>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="tags-section">
                <h3 className="section-title">
                  <i className="fas fa-tags"></i>
                  Tags
                </h3>
                <div className="tags-container">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="capacity-section">
              <div className="capacity-header">
                <span className="capacity-title">Registration Status</span>
                <span className="capacity-numbers">
                  {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Event full'}
                </span>
              </div>
              <div className="capacity-bar">
                <div
                  className={`capacity-fill ${
                    spotsLeft <= 0 ? 'danger' :
                    spotsLeft <= 5 ? 'warning' : ''
                  }`}
                  style={{ width: `${(event.spots_taken / event.capacity) * 100}%` }}
                ></div>
              </div>
              {isWaitlist && (
                <div className="waitlist-notice">
                  <i className="fas fa-exclamation-circle"></i>
                  This event is full. You can join the waitlist.
                </div>
              )}
            </div>

            {event.meeting_link && event.event_format.toLowerCase() !== 'on-campus' && (
              <div className="description-section">
                <h3 className="section-title">
                  <i className="fas fa-link"></i>
                  Meeting Link
                </h3>
                <p className="description-text">
                  A meeting link will be provided to registered participants before the event.
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className={`btn btn-primary ${isWaitlist ? 'waitlist' : ''}`}
              onClick={onRSVP}
            >
              <i className={`fas ${isWaitlist ? 'fa-clock' : 'fa-check'}`}></i>
              {isWaitlist ? 'Join Waitlist' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}