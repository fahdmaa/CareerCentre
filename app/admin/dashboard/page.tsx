'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [messages, setMessages] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [applications, setApplications] = useState([])
  const [cohorts, setCohorts] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const messagesRes = await fetch('/api/messages')
      if (messagesRes.ok) {
        const data = await messagesRes.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const markMessageAsRead = async (id: number) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      })
      fetchData()
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE' })
        fetchData()
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const unreadCount = messages.filter((m: any) => m.status === 'unread').length

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <Image 
            src="/images/logo-admin.svg" 
            alt="Admin Logo" 
            width={150}
            height={50}
          />
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <i className="fas fa-dashboard"></i> Overview
          </button>
          <button
            className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveSection('messages')}
          >
            <i className="fas fa-envelope"></i> Messages
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            className={`nav-item ${activeSection === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveSection('registrations')}
          >
            <i className="fas fa-calendar-check"></i> Event Registrations
          </button>
          <button
            className={`nav-item ${activeSection === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveSection('applications')}
          >
            <i className="fas fa-users"></i> Ambassador Applications
          </button>
          <button
            className={`nav-item ${activeSection === 'cohorts' ? 'active' : ''}`}
            onClick={() => setActiveSection('cohorts')}
          >
            <i className="fas fa-graduation-cap"></i> Cohorts
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <div className="admin-content">
        <div className="content-header">
          <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
          <div className="header-actions">
            <span className="admin-user">
              <i className="fas fa-user-circle"></i> Admin
            </span>
          </div>
        </div>

        <div className="content-body">
          {activeSection === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <i className="fas fa-envelope stat-icon"></i>
                  <h3>{messages.length}</h3>
                  <p>Total Messages</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-envelope-open stat-icon"></i>
                  <h3>{unreadCount}</h3>
                  <p>Unread Messages</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-calendar-check stat-icon"></i>
                  <h3>{registrations.length}</h3>
                  <p>Event Registrations</p>
                </div>
                <div className="stat-card">
                  <i className="fas fa-users stat-icon"></i>
                  <h3>{applications.length}</h3>
                  <p>Applications</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'messages' && (
            <div className="messages-section">
              <div className="section-header">
                <h2>Contact Messages</h2>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message: any) => (
                      <tr key={message.id} className={message.status === 'unread' ? 'unread' : ''}>
                        <td>
                          <div>
                            <strong>{message.sender_name}</strong>
                            <br />
                            <small>{message.sender_email}</small>
                          </div>
                        </td>
                        <td>{message.subject}</td>
                        <td>{new Date(message.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${message.status}`}>
                            {message.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {message.status === 'unread' && (
                              <button
                                className="btn-icon"
                                onClick={() => markMessageAsRead(message.id)}
                                title="Mark as read"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                            <button
                              className="btn-icon danger"
                              onClick={() => deleteMessage(message.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'registrations' && (
            <div className="registrations-section">
              <h2>Event Registrations</h2>
              <p>Event registration management coming soon...</p>
            </div>
          )}

          {activeSection === 'applications' && (
            <div className="applications-section">
              <h2>Ambassador Applications</h2>
              <p>Application management coming soon...</p>
            </div>
          )}

          {activeSection === 'cohorts' && (
            <div className="cohorts-section">
              <h2>Cohort Management</h2>
              <p>Cohort management coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}