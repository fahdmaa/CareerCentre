'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string[]
  logo: string
  posted: string
  saved?: boolean
}

const jobsData: Job[] = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Oracle",
    location: "Casablanca",
    type: "Full-time",
    description: "Join our team to develop cutting-edge cloud solutions.",
    requirements: ["3+ years experience", "Java/Python", "Cloud technologies"],
    logo: "/images/oracle.svg",
    posted: "2 days ago"
  },
  {
    id: 2,
    title: "Data Analyst",
    company: "OCP Group",
    location: "Marrakech",
    type: "Full-time",
    description: "Analyze business data to drive strategic decisions.",
    requirements: ["SQL expertise", "Python/R", "Business intelligence tools"],
    logo: "/images/OCP.svg",
    posted: "3 days ago"
  },
  {
    id: 3,
    title: "Marketing Specialist",
    company: "CIH Bank",
    location: "Rabat",
    type: "Full-time",
    description: "Lead digital marketing campaigns for our banking products.",
    requirements: ["Digital marketing experience", "Content creation", "Analytics"],
    logo: "/images/CIH.svg",
    posted: "1 week ago"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Capgemini",
    location: "Casablanca",
    type: "Contract",
    description: "Implement and maintain CI/CD pipelines for enterprise clients.",
    requirements: ["Kubernetes", "Docker", "AWS/Azure", "Jenkins"],
    logo: "/images/capgemini.svg",
    posted: "4 days ago"
  },
  {
    id: 5,
    title: "Business Analyst Intern",
    company: "Nestlé",
    location: "Casablanca",
    type: "Internship",
    description: "Support business operations and process improvement initiatives.",
    requirements: ["Business/Engineering student", "Excel proficiency", "English fluency"],
    logo: "/images/Nestle.svg",
    posted: "1 day ago"
  },
  {
    id: 6,
    title: "Quality Engineer",
    company: "LEONI",
    location: "Tanger",
    type: "Full-time",
    description: "Ensure product quality in automotive cable manufacturing.",
    requirements: ["Quality management", "ISO standards", "Problem-solving skills"],
    logo: "/images/LEONI.svg",
    posted: "5 days ago"
  }
]

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [filteredJobs, setFilteredJobs] = useState(jobsData)
  const [savedJobs, setSavedJobs] = useState<number[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('savedJobs')
    if (saved) {
      setSavedJobs(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const filtered = jobsData.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLocation = !locationFilter || job.location === locationFilter
      const matchesType = !typeFilter || job.type === typeFilter
      
      return matchesSearch && matchesLocation && matchesType
    })
    setFilteredJobs(filtered)
  }, [searchTerm, locationFilter, typeFilter])

  const toggleSaveJob = (jobId: number) => {
    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId]
    
    setSavedJobs(newSavedJobs)
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs))
  }

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

      <section className="jobs-hero">
        <div className="container">
          <h1 className="page-title">Find Your Dream Job</h1>
          <p className="page-subtitle">Discover opportunities from leading companies</p>
        </div>
      </section>

      <section className="jobs-section">
        <div className="container">
          <div className="search-filters">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by job title, company, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select
                className="filter-select"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="Casablanca">Casablanca</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Rabat">Rabat</option>
                <option value="Tanger">Tanger</option>
              </select>
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <Image 
                    src={job.logo} 
                    alt={job.company} 
                    width={60} 
                    height={60} 
                    className="company-logo"
                  />
                  <button 
                    className={`save-btn ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                    onClick={() => toggleSaveJob(job.id)}
                  >
                    <i className={`${savedJobs.includes(job.id) ? 'fas' : 'far'} fa-bookmark`}></i>
                  </button>
                </div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
                <p className="job-description">{job.description}</p>
                <div className="job-tags">
                  <span className="job-tag">
                    <i className="fas fa-map-marker-alt"></i> {job.location}
                  </span>
                  <span className="job-tag">
                    <i className="fas fa-briefcase"></i> {job.type}
                  </span>
                </div>
                <div className="job-requirements">
                  {job.requirements.slice(0, 2).map((req, index) => (
                    <span key={index} className="requirement-tag">{req}</span>
                  ))}
                </div>
                <div className="job-footer">
                  <span className="job-posted">{job.posted}</span>
                  <button className="btn btn-primary btn-sm">Apply Now</button>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      <Navigation />
    </>
  )
}