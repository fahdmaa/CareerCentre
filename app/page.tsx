'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import ClientLayout from '../components/ClientLayout'
import { useEffect } from 'react'
import './page-new.css'
import { 
  Search, 
  Calendar, 
  Briefcase, 
  TrendingUp, 
  Users, 
  MapPin,
  Mail,
  GraduationCap,
  Handshake,
  BookOpen,
  Target,
  HeartHandshake,
  Sparkles,
  Rocket
} from '../components/Icons'

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
      {/* Header */}
      <header className="header-sticky">
        <div className="container">
          <Link href="/" className="logo-link">
            <Image 
              src="/images/emsi-logo.png" 
              alt="EMSI Logo" 
              width={180} 
              height={45} 
              className="logo-img"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">
                Your Gateway to <br />
                <span className="text-gradient">
                  Career Success
                </span>
              </h1>
              <p className="hero-description">
                The EMSI Career Center connects talented students and alumni with exciting opportunities in the professional world. Start your journey today.
              </p>
              <div className="hero-buttons">
                <Link href="/jobs" className="btn-hero-primary">
                  <Search size={20} />
                  <span>Explore Jobs</span>
                </Link>
                <Link href="/events" className="btn-hero-secondary">
                  <Calendar size={20} />
                  <span>View Events</span>
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <Image 
                src="/images/standing-guy.png" 
                alt="Career Success" 
                width={600}
                height={600}
                className="hero-img"
                priority
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* KPI Metrics Section */}
      <section className="kpi-section">
        <div className="container">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="kpi-icon-wrapper">
                  <TrendingUp className="kpi-icon" size={32} />
                </div>
                <div>
                  <h3 className="kpi-value">+80%</h3>
                  <p className="kpi-label">Employability Rate</p>
                  <p className="kpi-description">Within 6 months of graduation</p>
                </div>
              </div>
            </div>
            
            <div className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(to bottom right, rgba(0, 74, 153, 0.2), rgba(0, 74, 153, 0.1))' }}>
                  <Users className="kpi-icon text-emsi-blue" size={32} />
                </div>
                <div>
                  <h3 className="kpi-value">+2000</h3>
                  <p className="kpi-label">Students Mentored</p>
                  <p className="kpi-description">Career guidance provided</p>
                </div>
              </div>
            </div>
            
            <div className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="kpi-icon-wrapper">
                  <MapPin className="kpi-icon" size={32} />
                </div>
                <div>
                  <h3 className="kpi-value">+200</h3>
                  <p className="kpi-label">Partners in Morocco</p>
                  <p className="kpi-description">Leading companies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            Explore Our Services
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Briefcase className="text-emsi-blue" size={28} />
              </div>
              <h3 className="feature-title">Career Opportunities</h3>
              <p className="feature-description">Find internships and jobs tailored to EMSI students.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <GraduationCap className="text-emsi-green" size={28} />
              </div>
              <h3 className="feature-title">Events & Workshops</h3>
              <p className="feature-description">Join skill-building sessions and career fairs.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Handshake className="text-emsi-blue" size={28} />
              </div>
              <h3 className="feature-title">Alumni Network</h3>
              <p className="feature-description">Connect with successful graduates worldwide.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen className="text-emsi-green" size={28} />
              </div>
              <h3 className="feature-title">Career Resources</h3>
              <p className="feature-description">Get CV templates, interview tips, and guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help You Succeed Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">
            How We Help You Succeed
          </h2>
          <div className="services-grid">
            <div className="service-item">
              <div className="service-icon-wrapper">
                <Target className="text-emsi-blue" size={36} />
              </div>
              <h3 className="service-title">Personalized Job Matching</h3>
              <p className="service-description">AI-powered recommendations based on your skills and interests</p>
            </div>

            <div className="service-item">
              <div className="service-icon-wrapper">
                <HeartHandshake className="text-emsi-green" size={36} />
              </div>
              <h3 className="service-title">Career Coaching & Guidance</h3>
              <p className="service-description">One-on-one mentoring from industry professionals</p>
            </div>

            <div className="service-item">
              <div className="service-icon-wrapper">
                <Sparkles className="text-emsi-blue" size={36} />
              </div>
              <h3 className="service-title">Networking Opportunities</h3>
              <p className="service-description">Connect with recruiters and alumni at exclusive events</p>
            </div>

            <div className="service-item">
              <div className="service-icon-wrapper">
                <Rocket className="text-emsi-green" size={36} />
              </div>
              <h3 className="service-title">Skill Development Resources</h3>
              <p className="service-description">Access to online courses and certification programs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <h2 className="section-title">Our Trusted Partners</h2>
          <div className="partners-slider">
            <div className="partners-track animate-scroll">
              <Image src="/images/oracle.svg" alt="Oracle" width={120} height={60} className="partner-logo" />
              <Image src="/images/capgemini.svg" alt="Capgemini" width={120} height={60} className="partner-logo" />
              <Image src="/images/OCP.svg" alt="OCP Group" width={120} height={60} className="partner-logo" />
              <Image src="/images/CIH.svg" alt="CIH Bank" width={120} height={60} className="partner-logo" />
              <Image src="/images/hps.svg" alt="HPS" width={120} height={60} className="partner-logo" />
              <Image src="/images/LEONI.svg" alt="LEONI" width={120} height={60} className="partner-logo" />
              <Image src="/images/Nestle.svg" alt="Nestle" width={120} height={60} className="partner-logo" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          {/* Testimonial */}
          <div className="testimonial-box">
            <p className="testimonial-text">
              &ldquo;Thanks to EMSI Career Center, I landed my first job at Capgemini within 3 months of graduating. The personalized guidance and networking opportunities were invaluable.&rdquo;
            </p>
            <p className="testimonial-author">— Fatima Z., Alumni 2024</p>
          </div>
          
          {/* CTA Content */}
          <div className="cta-content">
            <h2 className="cta-title">Ready to Launch Your Career?</h2>
            <p className="cta-subtitle">
              Join thousands of EMSI students and alumni who have found their dream jobs through our career services.
            </p>
            <div className="cta-buttons">
              <Link href="/jobs" className="btn-cta-white">
                <Briefcase size={20} />
                <span>Browse Jobs</span>
              </Link>
              <Link href="/about" className="btn-cta-outline">
                <Mail size={20} />
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