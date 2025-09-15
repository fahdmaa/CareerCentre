'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface ServiceItem {
  id: string
  title: string
  shortDescription: string
  expandedBullets: string[]
  primaryCTA: { text: string; href: string }
  secondaryCTA: { text: string; href: string }
  iconColor: 'blue' | 'green'
}

const services: ServiceItem[] = [
  {
    id: 'career-opportunities',
    title: 'Career opportunities',
    shortDescription: 'Find internships and jobs tailored to EMSI students.',
    expandedBullets: [
      'Curated roles from trusted partners and alumni.',
      'Filters for location, stack, contract type, and experience (0–2 years).',
      'Clear "how to apply" steps and recruiter contacts when available.',
      'Save searches and get alerts when new roles match your profile.',
      'Tips to tailor your CV and portfolio for each application.'
    ],
    primaryCTA: { text: 'Browse jobs', href: '/jobs' },
    secondaryCTA: { text: 'Create job alert', href: '/jobs?alert=new' },
    iconColor: 'blue'
  },
  {
    id: 'events-workshops',
    title: 'Events & workshops',
    shortDescription: 'Join skill-building sessions and career fairs.',
    expandedBullets: [
      'Weekly workshops on CV writing, interviews, and LinkedIn.',
      'Talks from hiring managers and alumni—online and on campus.',
      'Career fairs with partner companies; fast RSVP and calendar invite.',
      'Slides and recordings available after most sessions.',
      'Certificates of attendance for selected workshops.'
    ],
    primaryCTA: { text: 'See upcoming events', href: '/events' },
    secondaryCTA: { text: 'Watch past sessions', href: '/events?past=1' },
    iconColor: 'green'
  },
  {
    id: 'alumni-network',
    title: 'Alumni network',
    shortDescription: 'Connect with successful graduates worldwide.',
    expandedBullets: [
      'Find alumni by city, company, or field of work.',
      'Request mentorship or a quick coffee chat.',
      'Private groups for advice, referrals, and job leads.',
      'Spotlight stories to learn how others landed their first roles.',
      'Give back: volunteer as a mentor or mock-interviewer.'
    ],
    primaryCTA: { text: 'Explore alumni directory', href: '/alumni' },
    secondaryCTA: { text: 'Become a mentor', href: '/alumni/mentor' },
    iconColor: 'blue'
  },
  {
    id: 'career-resources',
    title: 'Career resources',
    shortDescription: 'Get CV templates, interview tips, and guidance.',
    expandedBullets: [
      'ATS-friendly CV and cover-letter templates.',
      'Interview question banks and STAR answer examples.',
      'LinkedIn checklist to strengthen your profile.',
      'Portfolio and GitHub best practices for junior engineers.',
      'Salary negotiation basics and first-job contracts guide.'
    ],
    primaryCTA: { text: 'Browse resources', href: '/resources' },
    secondaryCTA: { text: 'Book 1-to-1 coaching', href: '/coaching' },
    iconColor: 'green'
  }
]

export default function ServicesAccordion() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (selectedService) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus modal
      modalRef.current?.focus()
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      // Restore focus
      previousFocusRef.current?.focus()
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedService])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedService) {
        setSelectedService(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedService])

  const handleCardClick = (service: ServiceItem) => {
    setSelectedService(service)
  }

  const handleClose = () => {
    setSelectedService(null)
  }

  const getIcon = (service: ServiceItem) => {
    switch (service.id) {
      case 'career-opportunities':
        return (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'events-workshops':
        return (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'alumni-network':
        return (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'career-resources':
        return (
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <>
      <section className="services-cards-section">
        <div className="cards-container">
          <div className="cards-header">
            <h2 className="cards-title">Explore our services</h2>
            <p className="cards-subtitle">Comprehensive career support tailored for EMSI students and alumni</p>
          </div>
          
          <div className="cards-grid">
            {services.map((service) => (
              <button
                key={service.id}
                className="service-card-button"
                onClick={() => handleCardClick(service)}
                type="button"
                aria-label={`Learn more about ${service.title}`}
              >
                <div className={`card-icon icon-${service.iconColor}`}>
                  {getIcon(service)}
                </div>
                <h3 className="card-title">{service.title}</h3>
                <p className="card-description">{service.shortDescription}</p>
                <span className="card-cta">
                  Learn more
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Popup */}
      {selectedService && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div 
            className="modal-content"
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${selectedService.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="modal-header">
              <div className={`modal-icon icon-${selectedService.iconColor}`}>
                {getIcon(selectedService)}
              </div>
              <h2 id={`modal-title-${selectedService.id}`} className="modal-title">
                {selectedService.title}
              </h2>
            </div>
            
            <div className="modal-body">
              <ul className="modal-bullets">
                {selectedService.expandedBullets.map((bullet, index) => (
                  <li key={index} className="modal-bullet">
                    <span className="bullet-marker">•</span>
                    <span className="bullet-text">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="modal-footer">
              <Link 
                href={selectedService.primaryCTA.href} 
                className="btn-primary-modal"
                onClick={handleClose}
              >
                {selectedService.primaryCTA.text}
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                href={selectedService.secondaryCTA.href} 
                className="btn-secondary-modal"
                onClick={handleClose}
              >
                {selectedService.secondaryCTA.text}
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        /* Services Cards Section */
        .services-cards-section {
          padding: 4rem 1rem;
          background: #f9fafb;
        }
        
        .cards-container {
          max-width: 1280px;
          margin: 0 auto;
        }
        
        .cards-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .cards-title {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.75rem;
        }
        
        .cards-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 42rem;
          margin: 0 auto;
        }
        
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .service-card-button {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 0.75rem;
          padding: 1.5rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          position: relative;
        }
        
        .service-card-button:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          border-color: #004A99;
        }
        
        .service-card-button:focus {
          outline: 2px solid #004A99;
          outline-offset: 2px;
        }
        
        .card-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .icon-blue {
          background: linear-gradient(135deg, rgba(0, 74, 153, 0.2), rgba(0, 74, 153, 0.1));
          color: #004A99;
        }
        
        .icon-green {
          background: linear-gradient(135deg, rgba(0, 166, 81, 0.2), rgba(0, 166, 81, 0.1));
          color: #00A651;
        }
        
        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }
        
        .card-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }
        
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #004A99;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: auto;
        }
        
        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: ${prefersReducedMotion ? 'none' : 'fadeIn 200ms ease'};
        }
        
        .modal-content {
          background: white;
          border-radius: 1rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: ${prefersReducedMotion ? 'none' : 'slideUp 300ms ease'};
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: #6b7280;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .modal-close:hover {
          background: #f3f4f6;
          color: #111827;
        }
        
        .modal-close:focus {
          outline: 2px solid #004A99;
          outline-offset: 2px;
        }
        
        .modal-header {
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .modal-icon {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .modal-title {
          font-size: 1.75rem;
          font-weight: bold;
          color: #111827;
          margin: 0;
        }
        
        .modal-body {
          padding: 2rem;
        }
        
        .modal-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .modal-bullet {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .modal-bullet:last-child {
          margin-bottom: 0;
        }
        
        .bullet-marker {
          color: #00A651;
          font-weight: bold;
          margin-right: 0.75rem;
          flex-shrink: 0;
          font-size: 1.25rem;
        }
        
        .bullet-text {
          color: #374151;
          font-size: 1rem;
          line-height: 1.6;
        }
        
        .modal-footer {
          padding: 1.5rem 2rem 2rem;
          border-top: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .btn-primary-modal,
        .btn-secondary-modal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .btn-primary-modal {
          background: linear-gradient(135deg, #004A99, #003570);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary-modal:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }
        
        .btn-secondary-modal {
          background: transparent;
          color: #004A99;
          border: 2px solid #E5E7EB;
        }
        
        .btn-secondary-modal:hover {
          border-color: #004A99;
          background: #f9fafb;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
        
        /* Responsive */
        @media (min-width: 640px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .modal-footer {
            flex-direction: row;
          }
        }
        
        @media (min-width: 768px) {
          .cards-title {
            font-size: 2.5rem;
          }
          
          .modal-content {
            max-width: 700px;
          }
        }
        
        @media (min-width: 1024px) {
          .services-cards-section {
            padding: 5rem 2rem;
          }
          
          .cards-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </>
  )
  )
}