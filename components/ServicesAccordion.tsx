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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const panelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
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
    <section className="services-accordion-section">
      <div className="accordion-container">
        <div className="accordion-header">
          <h2 className="accordion-title">Explore our services</h2>
          <p className="accordion-subtitle">Comprehensive career support tailored for EMSI students and alumni</p>
        </div>
        
        <ul className="accordion-list" role="list">
          {services.map((service) => {
            const isExpanded = expandedId === service.id
            const buttonId = `accordion-button-${service.id}`
            const panelId = `accordion-panel-${service.id}`
            
            return (
              <li key={service.id} className="accordion-item">
                <button
                  id={buttonId}
                  className={`accordion-trigger ${isExpanded ? 'expanded' : ''}`}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => handleToggle(service.id)}
                  type="button"
                >
                  <div className="trigger-content">
                    <div className={`trigger-icon icon-${service.iconColor}`}>
                      {getIcon(service)}
                    </div>
                    <div className="trigger-text">
                      <h3 className="trigger-title">{service.title}</h3>
                      <p className="trigger-description">{service.shortDescription}</p>
                    </div>
                  </div>
                  <div className="trigger-indicator">
                    <svg 
                      width="20" 
                      height="20" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      className={`chevron ${isExpanded ? 'rotate' : ''}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <div
                  id={panelId}
                  ref={(el) => { panelRefs.current[service.id] = el }}
                  className={`accordion-panel ${isExpanded ? 'expanded' : ''}`}
                  role="region"
                  aria-labelledby={buttonId}
                  tabIndex={isExpanded ? 0 : -1}
                >
                  <div className="panel-content">
                    <ul className="panel-bullets">
                      {service.expandedBullets.map((bullet, index) => (
                        <li key={index} className="panel-bullet">
                          <span className="bullet-marker">•</span>
                          <span className="bullet-text">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="panel-actions">
                      <Link href={service.primaryCTA.href} className="btn-primary-accordion">
                        {service.primaryCTA.text}
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link href={service.secondaryCTA.href} className="btn-secondary-accordion">
                        {service.secondaryCTA.text}
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      
      <style jsx>{`
        .services-accordion-section {
          padding: 4rem 1rem;
          background: #f9fafb;
        }
        
        .accordion-container {
          max-width: 1280px;
          margin: 0 auto;
        }
        
        .accordion-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .accordion-title {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 0.75rem;
        }
        
        .accordion-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 42rem;
          margin: 0 auto;
        }
        
        .accordion-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .accordion-item {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: box-shadow 0.2s ease;
        }
        
        .accordion-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .accordion-trigger {
          width: 100%;
          padding: 1.25rem;
          background: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          transition: background-color 0.2s ease;
        }
        
        .accordion-trigger:hover {
          background-color: #f9fafb;
        }
        
        .accordion-trigger:focus {
          outline: 2px solid #004A99;
          outline-offset: -2px;
        }
        
        .accordion-trigger.expanded {
          background-color: #f9fafb;
        }
        
        .trigger-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }
        
        .trigger-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .icon-blue {
          background: linear-gradient(135deg, rgba(0, 74, 153, 0.2), rgba(0, 74, 153, 0.1));
          color: #004A99;
        }
        
        .icon-green {
          background: linear-gradient(135deg, rgba(0, 166, 81, 0.2), rgba(0, 166, 81, 0.1));
          color: #00A651;
        }
        
        .trigger-text {
          flex: 1;
        }
        
        .trigger-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }
        
        .trigger-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        
        .trigger-indicator {
          flex-shrink: 0;
          margin-left: 1rem;
        }
        
        .chevron {
          transition: transform ${prefersReducedMotion ? '0ms' : '200ms'} ease;
          color: #6b7280;
        }
        
        .chevron.rotate {
          transform: rotate(180deg);
        }
        
        .accordion-panel {
          max-height: 0;
          overflow: hidden;
          transition: ${prefersReducedMotion ? 'none' : 'max-height 300ms ease'};
        }
        
        .accordion-panel.expanded {
          max-height: 800px;
        }
        
        .panel-content {
          padding: 0 1.25rem 1.25rem 3.75rem;
        }
        
        .panel-bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
        }
        
        .panel-bullet {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .bullet-marker {
          color: #00A651;
          font-weight: bold;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        
        .bullet-text {
          color: #4b5563;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .panel-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .btn-primary-accordion,
        .btn-secondary-accordion {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 9999px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .btn-primary-accordion {
          background: linear-gradient(135deg, #004A99, #003570);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary-accordion:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }
        
        .btn-secondary-accordion {
          background: transparent;
          color: #004A99;
          border: 2px solid #E5E7EB;
        }
        
        .btn-secondary-accordion:hover {
          border-color: #004A99;
          background: #f9fafb;
        }
        
        /* Tablet and above */
        @media (min-width: 640px) {
          .panel-actions {
            flex-direction: row;
          }
        }
        
        @media (min-width: 768px) {
          .accordion-title {
            font-size: 2.5rem;
          }
          
          .accordion-list {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .trigger-title {
            font-size: 1.25rem;
          }
          
          .trigger-description {
            font-size: 1rem;
          }
        }
        
        @media (min-width: 1024px) {
          .services-accordion-section {
            padding: 5rem 2rem;
          }
        }
      `}</style>
    </section>
  )
}