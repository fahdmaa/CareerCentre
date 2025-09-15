'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function AboutPage() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: formData.name,
          sender_email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      })

      if (response.ok) {
        alert('Message sent successfully!')
        setShowContactModal(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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

      <section className="about-hero">
        <div className="container">
          <h1 className="page-title">About EMSI Career Center</h1>
          <p className="page-subtitle">Empowering students to achieve their career aspirations</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                The EMSI Career Center is dedicated to bridging the gap between academic excellence 
                and professional success. We provide comprehensive career services, resources, and 
                opportunities to help our students and alumni navigate their career paths with confidence.
              </p>
              <h3>What We Offer</h3>
              <ul className="services-list">
                <li><i className="fas fa-check"></i> Career counseling and guidance</li>
                <li><i className="fas fa-check"></i> Job placement assistance</li>
                <li><i className="fas fa-check"></i> Resume and cover letter review</li>
                <li><i className="fas fa-check"></i> Interview preparation workshops</li>
                <li><i className="fas fa-check"></i> Networking events and career fairs</li>
                <li><i className="fas fa-check"></i> Industry partnerships and internships</li>
              </ul>
            </div>
            <div className="about-image">
              <Image 
                src="/images/about-career-center.jpg" 
                alt="Career Center" 
                width={600}
                height={400}
                style={{ borderRadius: '15px' }}
              />
            </div>
          </div>

          <div className="stats-section">
            <h2>Our Impact</h2>
            <div className="impact-stats">
              <div className="impact-stat">
                <h3>95%</h3>
                <p>Employment rate within 6 months</p>
              </div>
              <div className="impact-stat">
                <h3>80+</h3>
                <p>Partner companies</p>
              </div>
              <div className="impact-stat">
                <h3>1500+</h3>
                <p>Students placed</p>
              </div>
              <div className="impact-stat">
                <h3>30+</h3>
                <p>Annual events</p>
              </div>
            </div>
          </div>

          <div className="team-section">
            <h2>Meet Our Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <Image 
                  src="/images/avatar-1.jpg" 
                  alt="Team Member" 
                  width={150}
                  height={150}
                  style={{ borderRadius: '50%' }}
                />
                <h4>Dr. Sarah Johnson</h4>
                <p>Career Center Director</p>
              </div>
              <div className="team-member">
                <Image 
                  src="/images/avatar-2.jpg" 
                  alt="Team Member" 
                  width={150}
                  height={150}
                  style={{ borderRadius: '50%' }}
                />
                <h4>Ahmed Benali</h4>
                <p>Career Counselor</p>
              </div>
              <div className="team-member">
                <Image 
                  src="/images/avatar-3.jpg" 
                  alt="Team Member" 
                  width={150}
                  height={150}
                  style={{ borderRadius: '50%' }}
                />
                <h4>Maria Rodriguez</h4>
                <p>Industry Relations</p>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <h2>Get in Touch</h2>
            <p>Have questions or need career guidance? We&apos;re here to help!</p>
            <button className="btn btn-primary" onClick={() => setShowContactModal(true)}>
              <i className="fas fa-envelope"></i> Contact Us
            </button>
          </div>
        </div>
      </section>

      {showContactModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Contact Us</h2>
              <button 
                className="close-btn"
                onClick={() => setShowContactModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  required
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowContactModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navigation />
    </>
  )
}