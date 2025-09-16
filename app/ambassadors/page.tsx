'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

interface Ambassador {
  id: number
  name: string
  role?: string
  major: string
  year?: string
  cohort?: string
  image_url?: string
  linkedin?: string
  email?: string
  status?: string
}

interface Cohort {
  id: number
  name: string
  application_deadline: string
  status: string
}

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [activeCohort, setActiveCohort] = useState<Cohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showLeadershipModal, setShowLeadershipModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCohort, setSelectedCohort] = useState('')
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  // Form states
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    major: '',
    year: '',
    linkedin: '',
    motivation: '',
    experience: ''
  })

  const [notificationForm, setNotificationForm] = useState({
    name: '',
    email: '',
    field_of_study: '',
    year: '',
    consent: false
  })

  useEffect(() => {
    fetchAmbassadors()
    fetchActiveCohort()

    // Hero elements should animate immediately
    setTimeout(() => {
      setVisibleSections(prev => new Set([...prev, 'hero']))
    }, 100)

    let observer: IntersectionObserver | null = null

    // Set up intersection observer for scroll animations
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

      // Observe all sections
      const sections = document.querySelectorAll('[data-section-id]')
      sections.forEach(section => observer?.observe(section))
    }

    // Wait for DOM to be fully rendered
    const timeoutId = setTimeout(setupObserver, 500)

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  const fetchAmbassadors = async () => {
    try {
      const response = await fetch('/api/public/ambassadors')
      if (response.ok) {
        const data = await response.json()
        const activeAmbassadors = (data.ambassadors || []).filter(
          (a: Ambassador) => !a.status || a.status === 'active'
        )
        setAmbassadors(activeAmbassadors)
      }
    } catch (error) {
      console.error('Error fetching ambassadors:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!applicationForm.name || !applicationForm.email || !applicationForm.major ||
        !applicationForm.year || !applicationForm.motivation || applicationForm.motivation.length < 100) {
      alert('Please fill all required fields (motivation must be at least 100 characters)')
      return
    }

    try {
      const response = await fetch('/api/public/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...applicationForm,
          cohort_id: activeCohort?.id
        })
      })

      if (response.ok) {
        alert('Application submitted successfully!')
        setShowApplicationModal(false)
        setApplicationForm({
          name: '', email: '', major: '', year: '',
          linkedin: '', motivation: '', experience: ''
        })
      }
    } catch (error) {
      alert('Failed to submit application. Please try again.')
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!notificationForm.name || !notificationForm.email || !notificationForm.consent) {
      alert('Please fill required fields and accept consent')
      return
    }

    try {
      const response = await fetch('/api/public/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationForm)
      })

      if (response.ok) {
        alert('You will be notified when applications open!')
        setShowNotificationModal(false)
        setNotificationForm({
          name: '', email: '', field_of_study: '', year: '', consent: false
        })
      }
    } catch (error) {
      alert('Failed to subscribe. Please try again.')
    }
  }

  const filteredAmbassadors = ambassadors.filter(ambassador => {
    const matchesSearch = !searchTerm ||
      ambassador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambassador.major.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCohort = !selectedCohort || ambassador.cohort === selectedCohort

    return matchesSearch && matchesCohort
  })

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

        .hero-actions {
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
          background: white;
          color: #00A651;
          border: 2px solid white;
          font-weight: 600;
        }

        .btn-primary:hover {
          background: #00A651;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
          font-weight: 600;
        }

        .btn-secondary:hover {
          background: white;
          color: #00A651;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
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

        .about-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .fact-card {
          background: #f9fafb;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
        }

        .fact-title {
          font-size: 18px;
          font-weight: 600;
          color: #00A651;
          margin-bottom: 8px;
        }

        .fact-text {
          color: #4b5563;
          line-height: 1.5;
        }

        .activities-grid, .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .activity-item, .benefit-item {
          display: flex;
          gap: 16px;
        }

        .item-icon {
          width: 48px;
          height: 48px;
          background: #00A651;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-content {
          flex: 1;
        }

        .item-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .item-desc {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
        }

        .ambassadors-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .search-input, .filter-select {
          padding: 10px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
        }

        .ambassadors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .ambassador-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }

        .ambassador-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .ambassador-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #00A651, #00C853);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          font-weight: 600;
        }

        .ambassador-info {
          padding: 20px;
        }

        .ambassador-name {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .ambassador-role {
          color: #00A651;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .ambassador-details {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .ambassador-social {
          display: flex;
          gap: 12px;
        }

        .social-link {
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 6px;
          color: #4b5563;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s;
        }

        .social-link:hover {
          background: #00A651;
          color: white;
        }

        .process-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 40px;
        }

        .step-card {
          text-align: center;
        }

        .step-number {
          width: 48px;
          height: 48px;
          background: #00A651;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 20px;
          font-weight: 600;
        }

        .step-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .step-desc {
          color: #6b7280;
          font-size: 14px;
        }

        .cohort-cta {
          background: #f9fafb;
          padding: 40px;
          border-radius: 16px;
          text-align: center;
        }

        .cohort-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .cohort-deadline {
          color: #00A651;
          font-size: 18px;
          margin-bottom: 24px;
        }

        .faq-list {
          max-width: 800px;
          margin: 0 auto;
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

        .contact-section {
          text-align: center;
          padding: 40px 0;
          background: #f9fafb;
        }

        .contact-info {
          font-size: 16px;
          color: #4b5563;
        }

        .contact-info a {
          color: #00A651;
          text-decoration: none;
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

        .form-checkbox {
          margin-right: 8px;
        }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .loading-skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

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

        @keyframes fadeInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out;
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

        .animate-delay-4 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        /* Initial hidden state */
        .section:not(.visible), .contact-section:not(.visible) {
          opacity: 0;
          transform: translateY(30px);
        }

        .section.visible, .contact-section.visible {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.8s ease-out;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 32px; }
          .about-grid, .activities-grid, .benefits-grid { grid-template-columns: 1fr; }
          .process-steps { grid-template-columns: 1fr; gap: 32px; }
          .ambassadors-grid { grid-template-columns: 1fr; }
          .hero-actions { flex-direction: column; align-items: center; }
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
          <h1 className={`hero-title ${visibleSections.has('hero') ? 'animate-fade-in-up animate-delay-1' : ''}`}>Student Ambassadors Program</h1>
          <p className={`hero-subtitle ${visibleSections.has('hero') ? 'animate-fade-in-up animate-delay-2' : ''}`}>Lead, connect, and represent EMSI.</p>
          <div className={`hero-actions ${visibleSections.has('hero') ? 'animate-fade-in-up animate-delay-3' : ''}`}>
            {isApplicationOpen ? (
              <button className="btn btn-primary" onClick={() => setShowApplicationModal(true)}>
                Apply Now
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowNotificationModal(true)}>
                Get Notified
              </button>
            )}
            <a href="#about" className="btn btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About the Program */}
      <section id="about" className={`section ${visibleSections.has('about') ? 'visible' : ''}`} data-section-id="about">
        <div className="container">
          <h2 className="section-title">About the Program</h2>
          <p style={{ textAlign: 'center', color: '#4b5563', maxWidth: '800px', margin: '0 auto' }}>
            The EMSI Student Ambassadors Program empowers exceptional students to become leaders,
            mentors, and representatives of our vibrant campus community.
          </p>
          <div className="about-grid">
            <div className="fact-card">
              <h3 className="fact-title">Mission</h3>
              <p className="fact-text">Bridge the gap between students and administration while fostering leadership skills</p>
            </div>
            <div className="fact-card">
              <h3 className="fact-title">Who It's For</h3>
              <p className="fact-text">Motivated students from all years and programs with strong communication skills</p>
            </div>
            <div className="fact-card">
              <h3 className="fact-title">Time Commitment</h3>
              <p className="fact-text">5-10 hours per month including events, meetings, and campus activities</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Do */}
      <section className={`section ${visibleSections.has('activities') ? 'visible' : ''}`} style={{ background: '#f9fafb' }} data-section-id="activities">
        <div className="container">
          <h2 className="section-title">What You'll Do</h2>
          <div className="activities-grid">
            <div className="activity-item">
              <div className="item-icon">
                <i className="fas fa-route"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Campus Tours</h3>
                <p className="item-desc">Lead prospective students and visitors through our facilities</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="item-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Event Organization</h3>
                <p className="item-desc">Help plan and execute career fairs, workshops, and social events</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="item-icon">
                <i className="fas fa-user-friends"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Peer Mentoring</h3>
                <p className="item-desc">Support and guide fellow students in their academic journey</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="item-icon">
                <i className="fas fa-share-alt"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Social Media</h3>
                <p className="item-desc">Create content and share student experiences online</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="item-icon">
                <i className="fas fa-hands-helping"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Community Outreach</h3>
                <p className="item-desc">Participate in local partnerships and social initiatives</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="item-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Student Voice</h3>
                <p className="item-desc">Represent student interests in meetings with administration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Perks */}
      <section className={`section ${visibleSections.has('benefits') ? 'visible' : ''}`} data-section-id="benefits">
        <div className="container">
          <h2 className="section-title">Benefits & Perks</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="item-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Leadership Development</h3>
                <p className="item-desc">
                  Exclusive training programs and workshops to build your skills
                  <button
                    onClick={() => setShowLeadershipModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00A651',
                      cursor: 'pointer',
                      padding: '4px 0',
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    Learn more
                  </button>
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="item-icon">
                <i className="fas fa-certificate"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Official Recognition</h3>
                <p className="item-desc">Certificate and LinkedIn endorsement from EMSI</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="item-icon">
                <i className="fas fa-network-wired"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Networking</h3>
                <p className="item-desc">Connect with industry leaders and alumni</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="item-icon">
                <i className="fas fa-tshirt"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Exclusive Merch</h3>
                <p className="item-desc">Ambassador kit with branded items</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="item-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Priority Access</h3>
                <p className="item-desc">First access to career opportunities and events</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="item-icon">
                <i className="fas fa-file-signature"></i>
              </div>
              <div className="item-content">
                <h3 className="item-title">Recommendation Letters</h3>
                <p className="item-desc">Official letters for internships and jobs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Ambassadors */}
      <section className={`section ${visibleSections.has('ambassadors') ? 'visible' : ''}`} style={{ background: '#f9fafb' }} data-section-id="ambassadors">
        <div className="container">
          <h2 className="section-title">Current Ambassadors</h2>

          <div className="ambassadors-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
            >
              <option value="">All Cohorts</option>
              <option value="2024">2024 Cohort</option>
              <option value="2023">2023 Cohort</option>
            </select>
          </div>

          {loading ? (
            <div className="ambassadors-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="ambassador-card">
                  <div className="ambassador-image loading-skeleton" style={{ height: '200px' }}></div>
                  <div className="ambassador-info">
                    <div className="loading-skeleton" style={{ height: '24px', marginBottom: '8px' }}></div>
                    <div className="loading-skeleton" style={{ height: '16px', width: '60%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAmbassadors.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <h3>No ambassadors found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="ambassadors-grid">
              {filteredAmbassadors.map(ambassador => (
                <div key={ambassador.id} className="ambassador-card">
                  <div className="ambassador-image">
                    {ambassador.image_url ? (
                      <Image
                        src={ambassador.image_url}
                        alt={ambassador.name}
                        width={280}
                        height={200}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    ) : (
                      ambassador.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    )}
                  </div>
                  <div className="ambassador-info">
                    <h3 className="ambassador-name">{ambassador.name}</h3>
                    {ambassador.role && <p className="ambassador-role">{ambassador.role}</p>}
                    <p className="ambassador-details">
                      {ambassador.major} {ambassador.year && `• ${ambassador.year}`}
                      {ambassador.cohort && <span style={{ display: 'block', marginTop: '4px' }}>Cohort {ambassador.cohort}</span>}
                    </p>
                    <div className="ambassador-social">
                      {ambassador.linkedin && (
                        <a href={ambassador.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                          <i className="fab fa-linkedin" style={{ marginRight: '4px' }}></i>
                          LinkedIn
                        </a>
                      )}
                      {ambassador.email && (
                        <a href={`mailto:${ambassador.email}`} className="social-link">
                          <i className="fas fa-envelope" style={{ marginRight: '4px' }}></i>
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How to Apply */}
      <section className={`section ${visibleSections.has('apply') ? 'visible' : ''}`} data-section-id="apply">
        <div className="container">
          <h2 className="section-title">How to Apply</h2>
          <div className="process-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Submit Form</h3>
              <p className="step-desc">Complete the online application with your motivation</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Shortlist</h3>
              <p className="step-desc">Selected candidates are notified within 7 days</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Interview</h3>
              <p className="step-desc">Meet with the selection committee for a brief chat</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Onboarding</h3>
              <p className="step-desc">Welcome session and training for new ambassadors</p>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '32px' }}>
            The entire process takes 2-3 weeks. We recruit new ambassadors twice a year.
          </p>
        </div>
      </section>

      {/* Cohort Status CTA */}
      {activeCohort && (
        <section className={`section ${visibleSections.has('cohort-cta') ? 'visible' : ''}`} style={{ background: '#f9fafb' }} data-section-id="cohort-cta">
          <div className="container">
            <div className="cohort-cta">
              {isApplicationOpen ? (
                <>
                  <h3 className="cohort-title">{activeCohort.name} Applications Open</h3>
                  <p className="cohort-deadline">
                    Deadline: {new Date(activeCohort.application_deadline).toLocaleDateString()}
                    ({getDaysLeft(activeCohort.application_deadline)} days left)
                  </p>
                  <div className="hero-actions" style={{ marginTop: '24px' }}>
                    <button className="btn btn-primary" onClick={() => setShowApplicationModal(true)}>
                      Apply Now
                    </button>
                    <a href="#about" className="btn btn-secondary">Learn More</a>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="cohort-title">Applications Currently Closed</h3>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    Be the first to know when we open applications for the next cohort
                  </p>
                  <div className="hero-actions" style={{ marginTop: '24px' }}>
                    <button className="btn btn-primary" onClick={() => setShowNotificationModal(true)}>
                      Get Notified
                    </button>
                    <a href="#about" className="btn btn-secondary">Learn More</a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className={`section ${visibleSections.has('faq') ? 'visible' : ''}`} data-section-id="faq">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">Who is eligible to apply?</h3>
              <p className="faq-answer">
                All EMSI students in good academic standing (GPA 3.0+) from any year and program can apply.
                We look for enthusiasm, communication skills, and commitment more than specific qualifications.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What is the time commitment?</h3>
              <p className="faq-answer">
                Ambassadors commit 5-10 hours per month, including monthly meetings, campus tours,
                and participation in at least 2 major events per semester.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How are ambassadors selected?</h3>
              <p className="faq-answer">
                Selection is based on application quality, motivation, communication skills demonstrated
                in the interview, and availability. We aim for diversity across programs and years.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What are the main benefits?</h3>
              <p className="faq-answer">
                Leadership training, networking opportunities, official recognition, priority access to
                career events, recommendation letters, and valuable experience for your CV.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is there a certificate?</h3>
              <p className="faq-answer">
                Yes, ambassadors who complete their term successfully receive an official certificate
                and LinkedIn endorsement from EMSI Career Centre.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How can I contact the program?</h3>
              <p className="faq-answer">
                Email us at ambassadors@emsi.ma or visit the Career Centre office during working hours
                for more information about the program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className={`contact-section ${visibleSections.has('contact') ? 'visible' : ''}`} data-section-id="contact">
        <div className="container">
          <p className="contact-info">
            Questions? Contact the Career Centre at{' '}
            <a href="mailto:career@emsi.ma">career@emsi.ma</a> or{' '}
            <a href="tel:+212524000000">+212 5 24 00 00 00</a>
          </p>
        </div>
      </section>

      {/* Application Modal */}
      <div className={`modal ${showApplicationModal ? 'show' : ''}`} role="dialog" aria-modal="true" aria-labelledby="application-title">
        <div className="modal-content">
          <div className="modal-header">
            <h2 id="application-title" className="modal-title">Ambassador Application</h2>
            <button className="close-btn" onClick={() => setShowApplicationModal(false)} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleApplicationSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={applicationForm.name}
                  onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">EMSI Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Major *</label>
                <input
                  type="text"
                  className="form-input"
                  value={applicationForm.major}
                  onChange={(e) => setApplicationForm({...applicationForm, major: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <select
                  className="form-select"
                  value={applicationForm.year}
                  onChange={(e) => setApplicationForm({...applicationForm, year: e.target.value})}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1st year">1st year</option>
                  <option value="2nd year">2nd year</option>
                  <option value="3rd year">3rd year</option>
                  <option value="4th year">4th year</option>
                  <option value="5th year">5th year</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <input
                  type="url"
                  className="form-input"
                  value={applicationForm.linkedin}
                  onChange={(e) => setApplicationForm({...applicationForm, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Motivation * (min 100 characters)</label>
                <textarea
                  className="form-textarea"
                  value={applicationForm.motivation}
                  onChange={(e) => setApplicationForm({...applicationForm, motivation: e.target.value})}
                  required
                  minLength={100}
                  placeholder="Why do you want to become an EMSI Ambassador?"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relevant Experience</label>
                <textarea
                  className="form-textarea"
                  value={applicationForm.experience}
                  onChange={(e) => setApplicationForm({...applicationForm, experience: e.target.value})}
                  placeholder="Any leadership, volunteer, or relevant experience"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowApplicationModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Modal */}
      <div className={`modal ${showNotificationModal ? 'show' : ''}`} role="dialog" aria-modal="true" aria-labelledby="notification-title">
        <div className="modal-content">
          <div className="modal-header">
            <h2 id="notification-title" className="modal-title">Get Notified</h2>
            <button className="close-btn" onClick={() => setShowNotificationModal(false)} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleNotificationSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={notificationForm.name}
                  onChange={(e) => setNotificationForm({...notificationForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={notificationForm.email}
                  onChange={(e) => setNotificationForm({...notificationForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Field of Study</label>
                <input
                  type="text"
                  className="form-input"
                  value={notificationForm.field_of_study}
                  onChange={(e) => setNotificationForm({...notificationForm, field_of_study: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select
                  className="form-select"
                  value={notificationForm.year}
                  onChange={(e) => setNotificationForm({...notificationForm, year: e.target.value})}
                >
                  <option value="">Select year</option>
                  <option value="1st year">1st year</option>
                  <option value="2nd year">2nd year</option>
                  <option value="3rd year">3rd year</option>
                  <option value="4th year">4th year</option>
                  <option value="5th year">5th year</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={notificationForm.consent}
                    onChange={(e) => setNotificationForm({...notificationForm, consent: e.target.checked})}
                    required
                  />
                  I consent to receive email notifications about the Ambassador Program
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowNotificationModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Leadership Modal */}
      <div className={`modal ${showLeadershipModal ? 'show' : ''}`} role="dialog" aria-modal="true" aria-labelledby="leadership-title">
        <div className="modal-content">
          <div className="modal-header">
            <h2 id="leadership-title" className="modal-title">Leadership Development Program</h2>
            <button className="close-btn" onClick={() => setShowLeadershipModal(false)} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1f2937' }}>Program Timeline</h3>
            <ul style={{ color: '#4b5563', lineHeight: '1.8' }}>
              <li>Month 1: Orientation & Team Building</li>
              <li>Month 2: Communication & Public Speaking Workshop</li>
              <li>Month 3: Event Management Training</li>
              <li>Month 4: Leadership & Conflict Resolution</li>
              <li>Month 5: Digital Marketing & Social Media</li>
              <li>Month 6: Personal Branding & Networking</li>
            </ul>

            <h3 style={{ fontSize: '18px', margin: '24px 0 16px', color: '#1f2937' }}>Key Skills You'll Develop</h3>
            <ul style={{ color: '#4b5563', lineHeight: '1.8' }}>
              <li>Professional communication and presentation</li>
              <li>Project management and organization</li>
              <li>Team leadership and collaboration</li>
              <li>Problem-solving and critical thinking</li>
              <li>Networking and relationship building</li>
              <li>Personal branding and career planning</li>
            </ul>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => setShowLeadershipModal(false)}>
              Got It
            </button>
          </div>
        </div>
      </div>

      <Navigation />
    </>
  )
}