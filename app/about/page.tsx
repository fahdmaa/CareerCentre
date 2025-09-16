'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

interface Cohort {
  id: number
  name: string
  application_deadline: string
  status: string
}

interface ContactForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [showContactModal, setShowContactModal] = useState(false)
  const [activeCohort, setActiveCohort] = useState<Cohort | null>(null)
  const [contactForm, setContactForm] = useState<ContactForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchActiveCohort()

    let observer: IntersectionObserver | null = null

    const setupObserver = () => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionId = entry.target.getAttribute('data-section-id')
              if (sectionId) {
                setVisibleSections(prev => new Set([...prev, sectionId]))
              }
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -20% 0px'
        }
      )

      const sections = document.querySelectorAll('[data-section-id]')
      sections.forEach(section => observer?.observe(section))
    }

    // Hero elements should animate immediately
    setTimeout(() => {
      setVisibleSections(prev => new Set([...prev, 'hero']))
    }, 100)

    const timeoutId = setTimeout(setupObserver, 500)

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  const fetchActiveCohort = async () => {
    try {
      const response = await fetch('/api/public/cohorts')
      if (response.ok) {
        const data = await response.json()
        const active = data.cohorts?.find((c: Cohort) => c.status === 'active')
        setActiveCohort(active || null)
      }
    } catch (error) {
      console.error('Error fetching cohort:', error)
    }
  }

  const getDaysLeft = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email || !contactForm.message) {
      alert('Please fill all required fields')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: `${contactForm.firstName} ${contactForm.lastName}`,
          sender_email: contactForm.email,
          subject: contactForm.subject || 'Contact Form Submission',
          message: contactForm.message
        })
      })

      if (response.ok) {
        alert('Message sent successfully!')
        setShowContactModal(false)
        setContactForm({
          firstName: '', lastName: '', email: '', phone: '', subject: '', message: ''
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

  const isApplicationOpen = activeCohort && getDaysLeft(activeCohort.application_deadline) > 0

  return (
    <>
      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #00A651, #00C853);
          color: white;
          padding: 100px 0 80px;
          text-align: center;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          color: white;
        }

        .hero-subtitle {
          font-size: 20px;
          margin-bottom: 32px;
          color: white;
          opacity: 0.95;
        }

        .hero-stats {
          display: flex;
          gap: 32px;
          justify-content: center;
          margin-top: 40px;
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat-number {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .hero-stat-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .section {
          padding: 60px 0;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          text-align: center;
          margin-bottom: 40px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .mission-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 32px;
          margin-top: 32px;
        }

        .mission-content {
          background: #f9fafb;
          padding: 32px;
          border-radius: 12px;
        }

        .mission-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .mission-text {
          color: #4b5563;
          line-height: 1.6;
        }

        .info-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-align: center;
        }

        .info-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #00A651;
          margin-bottom: 12px;
        }

        .info-card p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 40px;
        }

        .service-item {
          text-align: center;
          padding: 24px;
        }

        .service-icon {
          width: 64px;
          height: 64px;
          background: #00A651;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        }

        .service-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .service-desc {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 40px;
        }

        .stat-card {
          background: white;
          padding: 32px 24px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-number {
          font-size: 36px;
          font-weight: 700;
          color: #00A651;
          margin-bottom: 8px;
        }

        .stat-label {
          color: #4b5563;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .stat-caption {
          color: #9ca3af;
          font-size: 12px;
        }

        .locations-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 40px;
        }

        .location-card {
          background: #f9fafb;
          padding: 24px;
          border-radius: 12px;
        }

        .location-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .location-address {
          color: #6b7280;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .hours-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .hours-list li {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          color: #4b5563;
          font-size: 14px;
        }

        .cta-section {
          background: #f9fafb;
          padding: 60px 0;
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .cta-subtitle {
          color: #6b7280;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn {
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: #00A651;
          color: white;
          border: 2px solid #00A651;
        }

        .btn-primary:hover {
          background: #00a651;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 166, 81, 0.3);
        }

        .btn-secondary {
          background: white;
          color: #00A651;
          border: 2px solid #00A651;
        }

        .btn-secondary:hover {
          background: #00A651;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 166, 81, 0.2);
        }

        .faq-list {
          max-width: 800px;
          margin: 40px auto 0;
        }

        .faq-item {
          margin-bottom: 24px;
          padding: 24px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .faq-question {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .faq-answer {
          color: #4b5563;
          line-height: 1.6;
        }

        /* Modal Styles */
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }

        .modal.show {
          display: flex;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f3f4f6;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        /* Animation Styles */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-delay-1 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }

        .animate-delay-2 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animate-delay-3 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        /* Initial hidden state */
        .section:not(.visible) {
          opacity: 0;
          transform: translateY(30px);
        }

        .section.visible {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.8s ease-out;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 32px; }
          .hero-stats { flex-direction: column; gap: 16px; }
          .mission-grid { grid-template-columns: 1fr; }
          .services-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .locations-grid { grid-template-columns: 1fr; }
          .cta-actions { flex-direction: column; align-items: center; }
          .form-row { grid-template-columns: 1fr; }
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

      {/* Hero Section */}
      <section className="hero-section" data-section-id="hero">
        <div className="container">
          <h1 className={`hero-title ${visibleSections.has('hero') ? 'animate-fade-in-up animate-delay-1' : ''}`}>
            About EMSI Career Centre
          </h1>
          <p className={`hero-subtitle ${visibleSections.has('hero') ? 'animate-fade-in-up animate-delay-2' : ''}`}>
            Empowering students to bridge the gap between academic excellence and professional success.
          </p>
          <div className={`hero-stats ${visibleSections.has('hero') ? 'animate-fade-in-up animate-delay-3' : ''}`}>
            <div className="hero-stat">
              <div className="hero-stat-number">95%</div>
              <div className="hero-stat-label">Employability in 6 months</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">2,000+</div>
              <div className="hero-stat-label">Students mentored</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">200+</div>
              <div className="hero-stat-label">Industry partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Partnerships */}
      <section className={`section ${visibleSections.has('mission') ? 'visible' : ''}`} data-section-id="mission">
        <div className="container">
          <h2 className="section-title">Our Foundation</h2>
          <div className="mission-grid">
            <div className="mission-content">
              <h3 className="mission-title">Our Mission</h3>
              <p className="mission-text">
                The EMSI Career Centre is dedicated to bridging the gap between academic excellence and professional success.
                We provide comprehensive career services, guidance, and opportunities to empower our students and alumni
                with the tools and confidence needed to navigate their career paths successfully.
              </p>
            </div>
            <div className="info-card">
              <h3>Our Vision</h3>
              <p>To be the leading career development center that transforms student potential into professional excellence and industry leadership.</p>
            </div>
            <div className="info-card">
              <h3>Industry Partnerships</h3>
              <p>Collaborating with 200+ companies including multinational corporations, startups, and local businesses to create opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do (Services) */}
      <section className={`section ${visibleSections.has('services') ? 'visible' : ''}`} style={{ background: '#f9fafb' }} data-section-id="services">
        <div className="container">
          <h2 className="section-title">What We Do</h2>
          <div className="services-grid">
            <div className="service-item">
              <div className="service-icon">
                <i className="fas fa-compass"></i>
              </div>
              <h3 className="service-title">Career Guidance</h3>
              <p className="service-desc">Personalized counseling sessions to help you explore career paths and make informed decisions.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="service-title">Resume & Portfolio</h3>
              <p className="service-desc">Professional review and optimization of your resume, cover letters, and portfolio materials.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <i className="fas fa-user-tie"></i>
              </div>
              <h3 className="service-title">Interview Preparation</h3>
              <p className="service-desc">Mock interviews, behavioral coaching, and industry-specific preparation sessions.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3 className="service-title">Career Placement</h3>
              <p className="service-desc">Direct connections with partner companies and exclusive job placement opportunities.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="service-title">Skills Development</h3>
              <p className="service-desc">Workshops and training programs to enhance both technical and soft skills.</p>
            </div>
            <div className="service-item">
              <div className="service-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="service-title">Networking Events</h3>
              <p className="service-desc">Career fairs, industry meetups, and networking sessions with professionals and alumni.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact / Stats */}
      <section className={`section ${visibleSections.has('impact') ? 'visible' : ''}`} data-section-id="impact">
        <div className="container">
          <h2 className="section-title">Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <div className="stat-label">Employment Rate</div>
              <div className="stat-caption">Within 6 months of graduation</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2,000+</div>
              <div className="stat-label">Students Mentored</div>
              <div className="stat-caption">Since our inception</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">200+</div>
              <div className="stat-label">Partner Companies</div>
              <div className="stat-caption">Across various industries</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Annual Events</div>
              <div className="stat-caption">Career fairs and workshops</div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations & Hours */}
      <section className={`section ${visibleSections.has('locations') ? 'visible' : ''}`} style={{ background: '#f9fafb' }} data-section-id="locations">
        <div className="container">
          <h2 className="section-title">Locations & Hours</h2>
          <div className="locations-grid">
            <div className="location-card">
              <h3 className="location-title">
                <i className="fas fa-map-marker-alt"></i>
                Gueliz Campus
              </h3>
              <div className="location-address">
                Rue Abou Baker Al Razi<br />
                Gueliz, Marrakech 40000<br />
                Morocco
              </div>
              <ul className="hours-list">
                <li><span>Monday - Thursday</span><span>8:00 AM - 6:00 PM</span></li>
                <li><span>Friday</span><span>8:00 AM - 12:00 PM</span></li>
                <li><span>Saturday - Sunday</span><span>Closed</span></li>
              </ul>
            </div>
            <div className="location-card">
              <h3 className="location-title">
                <i className="fas fa-map-marker-alt"></i>
                Centre Campus
              </h3>
              <div className="location-address">
                Boulevard Zerktouni<br />
                Centre-ville, Marrakech 40000<br />
                Morocco
              </div>
              <ul className="hours-list">
                <li><span>Monday - Thursday</span><span>9:00 AM - 5:00 PM</span></li>
                <li><span>Friday</span><span>9:00 AM - 1:00 PM</span></li>
                <li><span>Saturday - Sunday</span><span>Closed</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={`cta-section ${visibleSections.has('cta') ? 'visible' : ''}`} data-section-id="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Launch Your Career?</h2>
            <p className="cta-subtitle">
              Join thousands of students who have successfully transitioned from academics to professional careers with our guidance and support.
            </p>
            <div className="cta-actions">
              {isApplicationOpen ? (
                <Link href="/ambassadors" className="btn btn-primary">
                  Apply Now
                </Link>
              ) : (
                <Link href="/ambassadors" className="btn btn-primary">
                  Get Notified
                </Link>
              )}
              <button className="btn btn-secondary" onClick={() => setShowContactModal(true)}>
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`section ${visibleSections.has('faq') ? 'visible' : ''}`} data-section-id="faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">Who is eligible for career services?</h3>
              <p className="faq-answer">
                All current EMSI students and alumni have access to our career services. We also offer specialized programs for different academic levels and career stages.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How do I schedule a career counseling session?</h3>
              <p className="faq-answer">
                You can book a session through our online portal, visit our office during operating hours, or contact us via email at career@emsi.ma to schedule an appointment.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you provide job placement guarantees?</h3>
              <p className="faq-answer">
                While we cannot guarantee job placement, our 95% employment rate within 6 months demonstrates our commitment to helping students find suitable career opportunities through our extensive network.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Are there certificates for completing career programs?</h3>
              <p className="faq-answer">
                Yes, we provide certificates of completion for various workshops and training programs, which can enhance your professional profile and demonstrate your commitment to career development.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How can companies partner with EMSI Career Centre?</h3>
              <p className="faq-answer">
                Companies interested in partnerships can contact us at partnerships@emsi.ma. We offer various collaboration opportunities including internship programs, career fairs, and direct recruitment access.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What support is available for international students?</h3>
              <p className="faq-answer">
                We provide specialized support for international students including visa guidance, work permit assistance, cultural integration programs, and connections with global companies operating in Morocco.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal show" role="dialog" aria-modal="true" aria-labelledby="contact-title">
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="contact-title" className="modal-title">Contact Us</h2>
              <button className="close-btn" onClick={() => setShowContactModal(false)} aria-label="Close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleContactSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={contactForm.lastName}
                      onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    placeholder="What can we help you with?"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-textarea"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    placeholder="Please share your questions or how we can assist you..."
                  />
                </div>
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