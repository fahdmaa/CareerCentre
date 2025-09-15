'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const closeButtonRef = useRef<HTMLButtonElement>(null)

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
      
      // Hide navigation elements
      document.body.setAttribute('data-modal-open', 'true')
      const nav = document.querySelector('.navigation-wrapper')
      const header = document.querySelector('header')
      if (nav) {
        nav.setAttribute('aria-hidden', 'true')
        nav.setAttribute('inert', '')
        ;(nav as HTMLElement).style.opacity = '0'
        ;(nav as HTMLElement).style.pointerEvents = 'none'
      }
      if (header) {
        header.setAttribute('aria-hidden', 'true')
        header.setAttribute('inert', '')
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Focus close button for better accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    } else {
      // Restore everything
      document.body.removeAttribute('data-modal-open')
      const nav = document.querySelector('.navigation-wrapper')
      const header = document.querySelector('header')
      if (nav) {
        nav.removeAttribute('aria-hidden')
        nav.removeAttribute('inert')
        ;(nav as HTMLElement).style.opacity = ''
        ;(nav as HTMLElement).style.pointerEvents = ''
      }
      if (header) {
        header.removeAttribute('aria-hidden')
        header.removeAttribute('inert')
      }
      
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
      document.body.removeAttribute('data-modal-open')
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

  const handleClose = useCallback(() => {
    setSelectedService(null)
  }, [])

  // Focus trap handler
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }, [])

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

      {/* Futuristic Modal Popup */}
      {selectedService && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div 
            className="modal-container"
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${selectedService.id}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleTabKey}
          >
            {/* Green Header Bar */}
            <div className="modal-header-green">
              <h2 id={`modal-title-${selectedService.id}`} className="modal-title-centered">
                {selectedService.title}
              </h2>
              <button
                ref={closeButtonRef}
                className="modal-close-btn"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="modal-body-futuristic">
              <ul className="modal-bullets-clean">
                {selectedService.expandedBullets.map((bullet, index) => (
                  <li key={index} className="modal-bullet-item">
                    <span className="bullet-icon">▸</span>
                    <span className="bullet-content">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Sticky Footer with Buttons */}
            <div className="modal-footer-sticky">
              <Link 
                href={selectedService.primaryCTA.href} 
                className="btn-modal-primary"
                onClick={handleClose}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {selectedService.primaryCTA.text}
              </Link>
              <Link 
                href={selectedService.secondaryCTA.href} 
                className="btn-modal-secondary"
                onClick={handleClose}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
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
        
        /* Futuristic Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: ${prefersReducedMotion ? 'none' : 'fadeIn 150ms ease'};
        }
        
        .modal-container {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 1.5rem;
          max-width: 640px;
          width: 100%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          animation: ${prefersReducedMotion ? 'none' : 'scaleIn 180ms cubic-bezier(0.4, 0, 0.2, 1)'};
          overflow: hidden;
        }
        
        /* Green Header Bar */
        .modal-header-green {
          background: linear-gradient(135deg, #00A651 0%, #007A3C 100%);
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(0, 166, 81, 0.2);
        }
        
        .modal-title-centered {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin: 0;
          text-align: center;
          letter-spacing: -0.02em;
        }
        
        .modal-close-btn {
          position: absolute;
          top: 50%;
          right: 1.5rem;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: white;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .modal-close-btn:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
          outline-offset: 2px;
        }
        
        /* Scrollable Body */
        .modal-body-futuristic {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          padding-bottom: 1rem;
        }
        
        .modal-bullets-clean {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .modal-bullet-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          opacity: 0;
          animation: ${prefersReducedMotion ? 'none' : 'slideInLeft 300ms ease forwards'};
          animation-delay: calc(var(--index) * 50ms);
        }
        
        .modal-bullet-item:nth-child(1) { --index: 0; }
        .modal-bullet-item:nth-child(2) { --index: 1; }
        .modal-bullet-item:nth-child(3) { --index: 2; }
        .modal-bullet-item:nth-child(4) { --index: 3; }
        .modal-bullet-item:nth-child(5) { --index: 4; }
        
        .bullet-icon {
          color: #00A651;
          margin-right: 0.75rem;
          flex-shrink: 0;
          font-size: 1rem;
          margin-top: 0.125rem;
        }
        
        .bullet-content {
          color: #374151;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        /* Sticky Footer */
        .modal-footer-sticky {
          padding: 1.5rem;
          border-top: 1px solid rgba(0, 166, 81, 0.1);
          background: rgba(249, 250, 251, 0.5);
          backdrop-filter: blur(10px);
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        
        .btn-modal-primary,
        .btn-modal-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .btn-modal-primary {
          background: #00A651;
          color: white !important;
          border: none;
          box-shadow: 0 4px 14px rgba(0, 166, 81, 0.3);
        }
        
        .btn-modal-primary:hover {
          background: #007A3C;
          box-shadow: 0 6px 20px rgba(0, 166, 81, 0.4);
          transform: translateY(-2px);
        }
        
        .btn-modal-primary:focus {
          outline: 2px solid #00A651;
          outline-offset: 2px;
        }
        
        .btn-modal-secondary {
          background: #00A651;
          color: white !important;
          border: 2px solid white;
          box-shadow: 0 4px 14px rgba(0, 166, 81, 0.2);
          opacity: 0.9;
        }
        
        .btn-modal-secondary:hover {
          background: #007A3C;
          opacity: 1;
          box-shadow: 0 6px 20px rgba(0, 166, 81, 0.3);
          transform: translateY(-2px);
        }
        
        .btn-modal-secondary:focus {
          outline: 2px solid #00A651;
          outline-offset: 2px;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.98);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Hide navigation when modal is open */
        body[data-modal-open="true"] .navigation-wrapper {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Responsive */
        @media (min-width: 640px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .modal-footer-sticky {
            flex-direction: row;
            justify-content: center;
          }
          
          .btn-modal-primary,
          .btn-modal-secondary {
            flex: 0 0 auto;
            min-width: 160px;
          }
        }
        
        @media (min-width: 768px) {
          .cards-title {
            font-size: 2.5rem;
          }
          
          .modal-container {
            max-width: 720px;
            margin: 2rem;
          }
          
          .modal-header-green {
            height: 80px;
          }
          
          .modal-title-centered {
            font-size: 1.75rem;
          }
          
          .modal-body-futuristic {
            padding: 2.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .services-cards-section {
            padding: 5rem 2rem;
          }
          
          .cards-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .modal-container {
            max-width: 800px;
          }
        }
        
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop,
          .modal-container,
          .modal-bullet-item {
            animation: none !important;
          }
          
          .modal-bullet-item {
            opacity: 1 !important;
          }
        }
      `}</style>
    </>
  )
}