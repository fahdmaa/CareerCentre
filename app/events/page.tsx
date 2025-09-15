'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ClientLayout from '@/components/ClientLayout'

interface Event {
  id: number
  title: string
  date: string
  time: string
  location: string
  type: string
  description: string
  image: string
  attendees: number
  maxAttendees: number
}

const eventsData: Event[] = [
  {
    id: 1,
    title: "Tech Career Fair 2024",
    date: "March 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "EMSI Main Campus",
    type: "Career Fair",
    description: "Connect with top tech companies and explore exciting career opportunities in software development, data science, and more.",
    image: "/images/career-fair.jpg",
    attendees: 150,
    maxAttendees: 200
  },
  {
    id: 2,
    title: "Resume Writing Workshop",
    date: "March 20, 2024",
    time: "2:00 PM - 4:00 PM",
    location: "Room B-102",
    type: "Workshop",
    description: "Learn how to craft a compelling resume that gets noticed by recruiters and hiring managers.",
    image: "/images/career-event-students.jpg",
    attendees: 25,
    maxAttendees: 30
  },
  {
    id: 3,
    title: "Interview Skills Masterclass",
    date: "March 25, 2024",
    time: "10:00 AM - 12:00 PM",
    location: "Conference Hall",
    type: "Workshop",
    description: "Master the art of interviewing with tips from industry professionals and HR experts.",
    image: "/images/career-event-students.jpg",
    attendees: 40,
    maxAttendees: 50
  }
]

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentMajor: '',
    yearOfStudy: ''
  })

  const handleRegister = (event: Event) => {
    setSelectedEvent(event)
    setShowRegistrationModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEvent?.id,
          ...formData
        })
      })

      if (response.ok) {
        alert('Registration successful!')
        setShowRegistrationModal(false)
        setFormData({
          studentName: '',
          studentEmail: '',
          studentPhone: '',
          studentMajor: '',
          yearOfStudy: ''
        })
      }
    } catch (error) {
      alert('Registration failed. Please try again.')
    }
  }

  return (
    <ClientLayout>
    <>
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
          <h1 className="page-title">Career Events & Workshops</h1>
          <p className="page-subtitle">Build your skills and network with industry professionals</p>
        </div>
      </section>

      <section className="events-section">
        <div className="container">
          <div className="events-grid">
            {eventsData.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    width={400}
                    height={250}
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="event-type-badge">{event.type}</span>
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <i className="fas fa-calendar"></i>
                      <span>{event.date}</span>
                    </div>
                    <div className="event-detail">
                      <i className="fas fa-clock"></i>
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="event-footer">
                    <div className="attendees-info">
                      <div className="attendees-avatars">
                        <span className="attendee-count">
                          <i className="fas fa-users"></i> {event.attendees}/{event.maxAttendees}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleRegister(event)}
                      disabled={event.attendees >= event.maxAttendees}
                    >
                      {event.attendees >= event.maxAttendees ? 'Full' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showRegistrationModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register for {selectedEvent?.title}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowRegistrationModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.studentPhone}
                  onChange={(e) => setFormData({...formData, studentPhone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Major *</label>
                <input
                  type="text"
                  value={formData.studentMajor}
                  onChange={(e) => setFormData({...formData, studentMajor: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year of Study *</label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1st year">1st year</option>
                  <option value="2nd year">2nd year</option>
                  <option value="3rd year">3rd year</option>
                  <option value="4th year">4th year</option>
                  <option value="5th year">5th year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegistrationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navigation />
    </>
    </ClientLayout>
  )
}