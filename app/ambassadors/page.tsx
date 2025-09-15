'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ClientLayout from '@/components/ClientLayout'
import { supabase } from '@/lib/supabase'

interface Ambassador {
  id: number
  name: string
  major: string
  linkedin: string
  photo: string
  achievements: string
  cohort_id: number
}

interface Cohort {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  is_active: boolean
}

export default function AmbassadorsPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [activeCohort, setActiveCohort] = useState<Cohort | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    major: '',
    yearOfStudy: '',
    gpa: '',
    motivation: '',
    experience: '',
    linkedin: '',
    cv: null as File | null
  })

  useEffect(() => {
    fetchAmbassadors()
    fetchCohorts()
  }, [])

  const fetchAmbassadors = async () => {
    const { data, error } = await supabase
      .from('ambassadors')
      .select('*')
      .order('name')

    if (data) {
      setAmbassadors(data)
    }
  }

  const fetchCohorts = async () => {
    const { data, error } = await supabase
      .from('cohorts')
      .select('*')
      .order('start_date', { ascending: false })

    if (data) {
      setCohorts(data)
      const active = data.find(c => c.is_active)
      setActiveCohort(active || null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activeCohort) {
      alert('No active cohort available for applications')
      return
    }

    try {
      const { error } = await supabase
        .from('cohort_applications')
        .insert({
          cohort_id: activeCohort.id,
          ...formData,
          cv_url: formData.cv ? 'uploaded' : null,
          status: 'pending'
        })

      if (!error) {
        alert('Application submitted successfully!')
        setShowApplicationModal(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          major: '',
          yearOfStudy: '',
          gpa: '',
          motivation: '',
          experience: '',
          linkedin: '',
          cv: null
        })
      }
    } catch (error) {
      alert('Failed to submit application. Please try again.')
    }
  }

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

      <section className="ambassadors-hero">
        <div className="container">
          <h1 className="page-title">Career Ambassadors Program</h1>
          <p className="page-subtitle">Meet our student leaders shaping the future of careers at EMSI</p>
          {activeCohort && (
            <button className="btn btn-primary" onClick={() => setShowApplicationModal(true)}>
              Apply for {activeCohort.name}
            </button>
          )}
        </div>
      </section>

      <section className="ambassadors-section">
        <div className="container">
          <div className="ambassadors-grid">
            {ambassadors.map(ambassador => (
              <div key={ambassador.id} className="ambassador-card">
                <div className="ambassador-image">
                  <Image 
                    src={ambassador.photo || '/images/avatar-1.jpg'} 
                    alt={ambassador.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="ambassador-info">
                  <h3 className="ambassador-name">{ambassador.name}</h3>
                  <p className="ambassador-major">{ambassador.major}</p>
                  <p className="ambassador-achievements">{ambassador.achievements}</p>
                  {ambassador.linkedin && (
                    <a 
                      href={ambassador.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="linkedin-link"
                    >
                      <i className="fab fa-linkedin"></i> Connect
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {ambassadors.length === 0 && (
            <div className="no-results">
              <i className="fas fa-users"></i>
              <h3>No ambassadors yet</h3>
              <p>Be the first to join our program!</p>
            </div>
          )}
        </div>
      </section>

      {showApplicationModal && (
        <div className="modal show">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Apply for {activeCohort?.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowApplicationModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Major *</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Year of Study *</label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})}
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
                  <label>GPA</label>
                  <input
                    type="text"
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                    placeholder="e.g., 3.5/4.0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="form-group">
                <label>Why do you want to be an ambassador? *</label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label>Relevant experience</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Upload CV (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({...formData, cv: e.target.files?.[0] || null})}
                />
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
      )}

      <Navigation />
    </>
    </ClientLayout>
  )
}