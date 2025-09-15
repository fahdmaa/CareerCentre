'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import ClientLayout from '../components/ClientLayout'
import KPICard from '../components/KPICard'
import { useEffect } from 'react'
import './modern-home.css'

export default function HomePage() {
  useEffect(() => {
    // Initialize partner carousel
    const initCarousel = () => {
      const track = document.querySelector('.carousel-track') as HTMLElement
      if (track) {
        const items = track.innerHTML
        track.innerHTML = items + items + items
      }
    }
    initCarousel()
  }, [])

  return (
    <ClientLayout>
    <div className="min-h-screen">
      {/* Header */}
      <header className="modern-header">
        <div className="header-container">
          <div className="header-content">
            <Link href="/" className="logo-link">
              <Image 
                src="/images/emsi-logo.png" 
                alt="EMSI Logo" 
                width={180} 
                height={45} 
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              Your gateway to 
              <span className="title-gradient">
                career success
              </span>
            </h1>
            <p className="hero-description">
              The EMSI Career Center connects talented students and alumni with exciting opportunities in the professional world. Start your journey today.
            </p>
            <div className="hero-buttons">
              <Link href="/jobs" className="btn-primary-hero">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Explore Jobs</span>
              </Link>
              <Link href="/events" className="btn-secondary-hero">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>View Events</span>
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-bg-accent"></div>
            <Image 
              src="/images/standing-guy.png" 
              alt="Career Success" 
              width={500}
              height={500}
              className="hero-image"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section with Animated KPIs */}
      <section className="kpi-section">
        <div className="kpi-container">
          <div className="kpi-grid">
            <KPICard
              value={80}
              title="Employability rate"
              description="Within 6 months of graduation"
              suffix="%"
            />
            <KPICard
              value={2000}
              title="Students mentored"
              description="Career guidance provided"
            />
            <KPICard
              value={200}
              title="Partners in Morocco"
              description="Leading companies"
            />
          </div>
        </div>
        
        <style jsx>{`
          .kpi-section {
            padding: 5rem 1rem;
            background: #f9fafb;
            position: relative;
          }
          
          .kpi-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }
          
          @media (max-width: 768px) {
            .kpi-section {
              padding: 3rem 1rem;
            }
            
            .kpi-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
          }
        `}</style>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2 className="section-title">Explore our services</h2>
          <p className="section-subtitle">Comprehensive career support tailored for EMSI students and alumni</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon icon-blue-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="service-title">Career opportunities</h3>
            <p className="service-description">Find internships and jobs tailored to EMSI students.</p>
          </div>

          <div className="service-card">
            <div className="service-icon icon-green-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <h3 className="service-title">Events & workshops</h3>
            <p className="service-description">Join skill-building sessions and career fairs.</p>
          </div>

          <div className="service-card">
            <div className="service-icon icon-blue-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="service-title">Alumni network</h3>
            <p className="service-description">Connect with successful graduates worldwide.</p>
          </div>

          <div className="service-card">
            <div className="service-icon icon-green-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="service-title">Career resources</h3>
            <p className="service-description">Get CV templates, interview tips, and guidance.</p>
          </div>
        </div>
      </section>

      {/* How We Help You Succeed */}
      <section className="help-section">
        <div className="section-header">
          <h2 className="section-title">How we help you succeed</h2>
          <p className="section-subtitle">Our comprehensive approach to career development</p>
        </div>
        
        <div className="help-grid">
          <div className="help-card">
            <div className="help-icon icon-blue-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="help-title">Personalized job matching</h3>
            <p className="help-description">AI-powered recommendations based on your skills and interests, ensuring you find the perfect opportunity.</p>
          </div>

          <div className="help-card">
            <div className="help-icon icon-green-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="help-title">Career coaching & guidance</h3>
            <p className="help-description">One-on-one mentoring from industry professionals who guide you through every step of your career journey.</p>
          </div>

          <div className="help-card">
            <div className="help-icon icon-blue-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="help-title">Networking opportunities</h3>
            <p className="help-description">Connect with recruiters and alumni at exclusive events designed to expand your professional network.</p>
          </div>

          <div className="help-card">
            <div className="help-icon icon-green-gradient">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="help-title">Skill development resources</h3>
            <p className="help-description">Access to online courses and certification programs to keep your skills sharp and relevant.</p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="section-header">
          <h2 className="section-title">Our trusted partners</h2>
          <p className="section-subtitle">Leading companies that hire EMSI graduates</p>
        </div>
        
        <div className="partners-carousel">
          <div className="carousel-track">
            <Image src="/images/oracle.svg" alt="Oracle" width={140} height={70} className="partner-logo" />
            <Image src="/images/capgemini.svg" alt="Capgemini" width={140} height={70} className="partner-logo" />
            <Image src="/images/OCP.svg" alt="OCP Group" width={140} height={70} className="partner-logo" />
            <Image src="/images/CIH.svg" alt="CIH Bank" width={140} height={70} className="partner-logo" />
            <Image src="/images/hps.svg" alt="HPS" width={140} height={70} className="partner-logo" />
            <Image src="/images/LEONI.svg" alt="LEONI" width={140} height={70} className="partner-logo" />
            <Image src="/images/Nestle.svg" alt="Nestle" width={140} height={70} className="partner-logo" />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="testimonial-container">
          <div className="testimonial-card">
            <svg className="quote-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <div className="testimonial-content">
              <p className="testimonial-text">
                &ldquo;Thanks to EMSI Career Center, I landed my first job at Capgemini within 3 months of graduating. The personalized guidance and networking opportunities were invaluable in shaping my career path.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">FZ</div>
                <div className="author-info">
                  <p className="author-name">Fatima Z.</p>
                  <p className="author-role">Alumni 2024, Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-overlay"></div>
        <div className="cta-container">
          <div className="cta-grid">
            <div className="cta-content">
              <h2 className="cta-title">Ready to launch your career?</h2>
              <p className="cta-text">
                Join thousands of EMSI students and alumni who have found their dream jobs through our career services.
              </p>
              <div className="cta-buttons">
                <Link href="/jobs" className="btn-cta-white">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Browse Jobs</span>
                </Link>
                <Link href="/about" className="btn-cta-outline">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
            <div className="cta-illustration">
              <div className="illustration-wrapper">
                <div className="illustration-bg"></div>
                <svg className="illustration-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Navigation />
    </div>
    </ClientLayout>
  )
}