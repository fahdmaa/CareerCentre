'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import ClientLayout from '../components/ClientLayout'
import KPICard from '../components/KPICard'
import ServicesAccordion from '../components/ServicesAccordion'
import StarBorder from '../components/StarBorder'
import { useEffect, useState } from 'react'
import './modern-home.css'
import ContactForm from './about/contact-form'

export default function HomePage() {
  const [showContactForm, setShowContactForm] = useState(false)

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
              <StarBorder
                as={Link}
                href="/jobs"
                className="btn-primary-hero"
                color="#00A651"
                speed="4s"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Explore Jobs</span>
              </StarBorder>
              <StarBorder
                as={Link}
                href="/events"
                className="secondary"
                color="#00A651"
                speed="4s"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>View Events</span>
              </StarBorder>
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

      {/* Interactive Services Accordion */}
      <ServicesAccordion />

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

        <div className="partners-container">
          <div className="logo-carousel">
            <div className="logo-track">
              {/* First set of logos */}
              <div className="logo-slide">
                <Image src="/images/partner-logo-1.png" alt="Partner 1" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-2.png" alt="Partner 2" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-3.png" alt="Partner 3" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-4.png" alt="Partner 4" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-5.png" alt="Partner 5" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-6.png" alt="Partner 6" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-7.png" alt="Partner 7" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-8.png" alt="Partner 8" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-9.png" alt="Partner 9" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-10.png" alt="Partner 10" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-11.png" alt="Partner 11" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-12.png" alt="Partner 12" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-13.png" alt="Partner 13" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-14.png" alt="Partner 14" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-15.png" alt="Partner 15" width={140} height={70} className="partner-logo" />
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="logo-slide">
                <Image src="/images/partner-logo-1.png" alt="Partner 1" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-2.png" alt="Partner 2" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-3.png" alt="Partner 3" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-4.png" alt="Partner 4" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-5.png" alt="Partner 5" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-6.png" alt="Partner 6" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-7.png" alt="Partner 7" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-8.png" alt="Partner 8" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-9.png" alt="Partner 9" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-10.png" alt="Partner 10" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-11.png" alt="Partner 11" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-12.png" alt="Partner 12" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-13.png" alt="Partner 13" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-14.png" alt="Partner 14" width={140} height={70} className="partner-logo" />
              </div>
              <div className="logo-slide">
                <Image src="/images/partner-logo-15.png" alt="Partner 15" width={140} height={70} className="partner-logo" />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .partners-section {
            padding: 4rem 1rem;
            background: #f8fafc;
            overflow: hidden;
          }

          .section-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .section-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 1rem;
            line-height: 1.2;
          }

          .section-subtitle {
            font-size: 1.125rem;
            color: #6b7280;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }

          .partners-container {
            max-width: 100%;
            overflow: hidden;
            position: relative;
          }

          .logo-carousel {
            width: 100%;
            overflow: hidden;
            position: relative;
            mask: linear-gradient(
              to right,
              transparent,
              white 10%,
              white 90%,
              transparent
            );
            -webkit-mask: linear-gradient(
              to right,
              transparent,
              white 10%,
              white 90%,
              transparent
            );
          }

          .logo-track {
            display: flex;
            gap: 3rem;
            animation: scroll 40s linear infinite;
            width: fit-content;
          }

          .logo-track:hover {
            animation-play-state: paused;
          }

          .logo-slide {
            flex: none;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 180px;
            height: 100px;
            padding: 1rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
          }

          .logo-slide:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }

          .partner-logo {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            filter: grayscale(1) opacity(0.7);
            transition: all 0.3s ease;
          }

          .logo-slide:hover .partner-logo {
            filter: grayscale(0) opacity(1);
            transform: scale(1.05);
          }

          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-50% - 1.5rem));
            }
          }

          @media (max-width: 768px) {
            .partners-section {
              padding: 3rem 1rem;
            }

            .section-title {
              font-size: 2rem;
            }

            .section-subtitle {
              font-size: 1rem;
            }

            .logo-track {
              gap: 2rem;
              animation-duration: 30s;
            }

            .logo-slide {
              min-width: 140px;
              height: 80px;
              padding: 0.75rem;
            }

            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-50% - 1rem));
              }
            }
          }
        `}</style>
      </section>

      {/* Final CTA Section - Clean and Aligned */}
      <section className="cta-section-final">
        <div className="cta-container-final">
          <div className="cta-grid-final">
            {/* Text Content */}
            <div className="cta-content-final">
              <h2 className="cta-title-final">Ready to launch your career?</h2>
              <p className="cta-text-final">
                Join thousands of EMSI students and alumni who have found their dream jobs through our career services.
              </p>
              <div className="cta-buttons-final">
                <StarBorder
                  as={Link}
                  href="/jobs"
                  className="cta-white"
                  color="#00A651"
                  speed="4s"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Browse jobs</span>
                </StarBorder>
                <StarBorder
                  as="button"
                  onClick={() => setShowContactForm(true)}
                  className="transparent"
                  color="white"
                  speed="4s"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact us</span>
                </StarBorder>
              </div>
            </div>
            
            {/* Person Image - Bigger and Top Aligned */}
            <div className="cta-image-final">
              <Image 
                src="/images/person main page.png" 
                alt="EMSI student in a high-visibility vest looking upward"
                width={520}
                height={700}
                sizes="(max-width: 767px) 280px, (max-width: 1023px) 360px, (max-width: 1279px) 420px, (max-width: 1535px) 480px, 520px"
                className="person-image-final"
                quality={85}
                priority={false}
              />
            </div>
          </div>
        </div>
        
        <style jsx>{`
          /* Final CTA Section - Clean and Aligned */
          .cta-section-final {
            background: linear-gradient(135deg, #00A651, #007A3C);
            padding: 2rem 1rem 0;
            position: relative;
            overflow: hidden;
          }
          
          .cta-container-final {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          .cta-grid-final {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            align-items: flex-start;
          }
          
          .cta-content-final {
            text-align: center;
            padding-top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          .cta-title-final {
            font-size: 2.5rem;
            font-weight: bold;
            color: white;
            margin-bottom: 1rem;
            line-height: 1.1;
          }
          
          .cta-text-final {
            font-size: 1.125rem;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
            margin-bottom: 2rem;
            max-width: 55ch;
            margin-left: auto;
            margin-right: auto;
          }
          
          .cta-buttons-final {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }
          
          .cta-buttons-final .btn-secondary-hero:hover {
            background: rgba(255, 255, 255, 0.1) !important;
          }
          
          /* Mobile: Show smaller image below content */
          .cta-image-final {
            display: block;
            text-align: center;
            margin-top: 2rem;
            margin-bottom: -5px;
          }
          
          .cta-image-final :global(.person-image-final) {
            width: auto;
            height: auto;
            max-width: 280px;
            object-fit: contain;
            filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
            display: block;
          }
          
          @media (min-width: 640px) {
            .cta-section-final {
              padding: 2.5rem 1.5rem 0;
            }
            
            .cta-buttons-final {
              flex-direction: row;
              justify-content: center;
            }
            
            .cta-title-final {
              font-size: 3rem;
            }
          }
          
          /* Tablet and above: Two-column layout with top alignment */
          @media (min-width: 768px) {
            .cta-section-final {
              padding: 3rem 2rem 0;
            }
            
            .cta-grid-final {
              grid-template-columns: 1.2fr 1fr;
              gap: 3rem;
              align-items: center;
            }
            
            .cta-content-final {
              text-align: center;
              padding-top: 0;
              align-items: center;
            }
            
            .cta-title-final {
              font-size: 3rem;
              margin-bottom: 1.25rem;
            }
            
            .cta-text-final {
              font-size: 1.2rem;
              margin-left: auto;
              margin-right: auto;
              margin-bottom: 2.5rem;
              text-align: center;
            }
            
            .cta-buttons-final {
              justify-content: center;
            }
            
            .cta-image-final {
              margin-top: 0;
              text-align: right;
              align-self: flex-end;
              margin-bottom: -5px;
            }
            
            .cta-image-final :global(.person-image-final) {
              max-width: 360px;
              display: block;
              margin-left: auto;
            }
          }
          
          @media (min-width: 1024px) {
            .cta-section-final {
              padding: 3rem 2rem 0;
            }
            
            .cta-title-final {
              font-size: 3.5rem;
            }
            
            .cta-text-final {
              font-size: 1.25rem;
            }
            
            .cta-image-final :global(.person-image-final) {
              max-width: 420px;
            }
          }
          
          @media (min-width: 1280px) {
            .cta-section-final {
              padding: 3.5rem 2rem 0;
            }
            
            .cta-title-final {
              font-size: 4rem;
              margin-bottom: 1.5rem;
            }
            
            .cta-text-final {
              font-size: 1.375rem;
              margin-bottom: 3rem;
            }
            
            .cta-image-final :global(.person-image-final) {
              max-width: 480px;
            }
          }
          
          @media (min-width: 1536px) {
            .cta-image-final :global(.person-image-final) {
              max-width: 520px;
            }
          }
        `}</style>
      </section>

      <Navigation />

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm onClose={() => setShowContactForm(false)} />
      )}
    </div>
    </ClientLayout>
  )
}