import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function HomePage() {
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

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Gateway to <br />
            <span className="text-gradient">Career Success</span>
          </h1>
          <p className="hero-description">
            The EMSI Career Center connects talented students and alumni with exciting opportunities in the professional world. Start your journey today.
          </p>
          <div className="hero-buttons">
            <Link href="/jobs" className="btn btn-primary">
              <i className="fas fa-search"></i> Explore Jobs
            </Link>
            <Link href="/events" className="btn btn-secondary">
              <i className="fas fa-calendar"></i> View Events
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <Image 
            src="/images/standing-guy.png" 
            alt="Career Success" 
            width={600}
            height={600}
            priority
          />
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <i className="fas fa-briefcase stat-icon"></i>
              <h3 className="stat-number">250+</h3>
              <p className="stat-label">Job Opportunities</p>
            </div>
            <div className="stat-item">
              <i className="fas fa-building stat-icon"></i>
              <h3 className="stat-number">80+</h3>
              <p className="stat-label">Partner Companies</p>
            </div>
            <div className="stat-item">
              <i className="fas fa-graduation-cap stat-icon"></i>
              <h3 className="stat-number">1500+</h3>
              <p className="stat-label">Students Placed</p>
            </div>
            <div className="stat-item">
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
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Job Matching</h3>
              <p>Find opportunities that align with your skills and career goals</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h3>Industry Connections</h3>
              <p>Connect with leading companies and professionals in your field</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Career Development</h3>
              <p>Access workshops, mentorship, and resources to advance your career</p>
            </div>
            <div className="feature-card">
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
              <Link href="/jobs" className="btn btn-white">
                <i className="fas fa-briefcase"></i> Browse Jobs
              </Link>
              <Link href="/about" className="btn btn-outline">
                <i className="fas fa-envelope"></i> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Navigation />
    </>
  )
}