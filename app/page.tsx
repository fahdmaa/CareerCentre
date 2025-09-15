'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import ClientLayout from '../components/ClientLayout'
import { useEffect } from 'react'

// Icon components - using inline SVGs as fallback if lucide-react not installed
const SearchIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const CalendarIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)

const BriefcaseIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
)

const TrendingUpIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
)

const UsersIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const MapPinIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const MailIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

export default function HomePage() {
  useEffect(() => {
    // Initialize partner slider
    const track = document.querySelector('.partners-track') as HTMLElement
    if (track) {
      // Clone items for infinite scroll
      const items = track.innerHTML
      track.innerHTML = items + items
    }
  }, [])

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

      <section className="hero fade-in">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content slide-right">
              <h1 className="hero-title">
                Your Gateway to <br />
                <span className="text-gradient">Career Success</span>
              </h1>
              <p className="hero-description">
                The EMSI Career Center connects talented students and alumni with exciting opportunities in the professional world. Start your journey today.
              </p>
              <div className="hero-buttons">
                <Link href="/jobs" className="btn btn-primary btn-modern">
                  <SearchIcon className="btn-icon" size={20} />
                  <span>Explore Jobs</span>
                </Link>
                <Link href="/events" className="btn btn-secondary btn-modern">
                  <CalendarIcon className="btn-icon" size={20} />
                  <span>View Events</span>
                </Link>
              </div>
            </div>
            <div className="hero-image slide-left">
              <Image 
                src="/images/standing-guy.png" 
                alt="Career Success" 
                width={750}
                height={750}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="kpi-metrics">
        <div className="container">
          <div className="kpi-grid">
            <div className="kpi-card fade-in animate-on-scroll">
              <div className="kpi-icon-wrapper">
                <TrendingUpIcon className="kpi-icon" size={32} />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-value">+80%</h3>
                <p className="kpi-label">Employability Rate</p>
                <p className="kpi-description">Our graduates find employment within 6 months</p>
              </div>
            </div>
            <div className="kpi-card fade-in animate-on-scroll">
              <div className="kpi-icon-wrapper">
                <UsersIcon className="kpi-icon" size={32} />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-value">+2000</h3>
                <p className="kpi-label">Students Mentored</p>
                <p className="kpi-description">Guided through their career journey</p>
              </div>
            </div>
            <div className="kpi-card fade-in animate-on-scroll">
              <div className="kpi-icon-wrapper">
                <MapPinIcon className="kpi-icon" size={32} />
              </div>
              <div className="kpi-content">
                <h3 className="kpi-value">+200</h3>
                <p className="kpi-label">Partners in Morocco</p>
                <p className="kpi-description">Leading companies across all sectors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item fade-in animate-on-scroll">
              <i className="fas fa-briefcase stat-icon"></i>
              <h3 className="stat-number">250+</h3>
              <p className="stat-label">Job Opportunities</p>
            </div>
            <div className="stat-item fade-in animate-on-scroll">
              <i className="fas fa-building stat-icon"></i>
              <h3 className="stat-number">80+</h3>
              <p className="stat-label">Partner Companies</p>
            </div>
            <div className="stat-item fade-in animate-on-scroll">
              <i className="fas fa-graduation-cap stat-icon"></i>
              <h3 className="stat-number">1500+</h3>
              <p className="stat-label">Students Placed</p>
            </div>
            <div className="stat-item fade-in animate-on-scroll">
              <i className="fas fa-calendar-check stat-icon"></i>
              <h3 className="stat-number">30+</h3>
              <p className="stat-label">Events Yearly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How We Help You Succeed</h2>
          <div className="features-grid">
            <div className="feature-card slide-up animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Job Matching</h3>
              <p>Find opportunities that align with your skills and career goals</p>
            </div>
            <div className="feature-card slide-up animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3>Industry Connections</h3>
              <p>Connect with leading companies and professionals in your field</p>
            </div>
            <div className="feature-card slide-up animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Career Development</h3>
              <p>Access workshops, mentorship, and resources to advance your career</p>
            </div>
            <div className="feature-card slide-up animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Networking Events</h3>
              <p>Attend career fairs and meetups to expand your professional network</p>
            </div>
          </div>
        </div>
      </section>

      <section className="partners-section">
        <div className="container">
          <h2 className="section-title">Our Trusted Partners</h2>
          <div className="partners-slider">
            <div className="partners-track">
              <Image src="/images/oracle.svg" alt="Oracle" width={120} height={60} className="partner-logo" />
              <Image src="/images/capgemini.svg" alt="Capgemini" width={120} height={60} className="partner-logo" />
              <Image src="/images/OCP.svg" alt="OCP Group" width={120} height={60} className="partner-logo" />
              <Image src="/images/CIH.svg" alt="CIH Bank" width={120} height={60} className="partner-logo" />
              <Image src="/images/hps.svg" alt="HPS" width={120} height={60} className="partner-logo" />
              <Image src="/images/LEONI.svg" alt="LEONI" width={120} height={60} className="partner-logo" />
              <Image src="/images/Nestle.svg" alt="Nestle" width={120} height={60} className="partner-logo" />
              <Image src="/images/oracle.svg" alt="Oracle" width={120} height={60} className="partner-logo" />
              <Image src="/images/capgemini.svg" alt="Capgemini" width={120} height={60} className="partner-logo" />
              <Image src="/images/OCP.svg" alt="OCP Group" width={120} height={60} className="partner-logo" />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Launch Your Career?</h2>
            <p>Join thousands of EMSI students and alumni who have found their dream jobs</p>
            <div className="cta-buttons">
              <Link href="/jobs" className="btn btn-white btn-modern">
                <BriefcaseIcon className="btn-icon" size={20} />
                <span>Browse Jobs</span>
              </Link>
              <Link href="/about" className="btn btn-outline btn-modern">
                <MailIcon className="btn-icon" size={20} />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Navigation />
    </>
    </ClientLayout>
  )
}