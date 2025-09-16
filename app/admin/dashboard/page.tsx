'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Message {
  id: number
  sender_name: string
  sender_email: string
  subject: string
  message: string
  status: string
  created_at: string
}

interface EventRegistration {
  id: number
  event_id: number
  student_name: string
  student_email: string
  student_phone?: string
  major?: string
  year?: string
  registration_date: string
  status: string
  event?: {
    title: string
    event_date: string
  }
}

interface CohortApplication {
  id: number
  cohort_id: number
  student_name: string
  student_email: string
  major: string
  year: string
  motivation: string
  status: string
  created_at: string
  cohort?: {
    name: string
  }
}

interface Interview {
  id: number
  application_id: number
  interview_date: string
  interview_time: string
  interview_type: string
  location?: string
  meeting_link?: string
  interviewer_name?: string
  status: string
  application?: {
    student_name: string
  }
}

interface RecentActivity {
  id: number
  activity_type: string
  description: string
  user_name?: string
  created_at: string
}

interface Stats {
  totalMessages: number
  unreadMessages: number
  totalRegistrations: number
  upcomingEvents: number
  totalApplications: number
  pendingApplications: number
  scheduledInterviews: number
  totalAmbassadors: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [messages, setMessages] = useState<Message[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [applications, setApplications] = useState<CohortApplication[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    scheduledInterviews: 0,
    totalAmbassadors: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<CohortApplication | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('admin-token')
    console.log('Dashboard loaded. Token exists:', !!token)

    if (!token) {
      console.warn('No admin token found, redirecting to login')
      router.push('/about')
      return
    }

    checkAuth()
    fetchAllData()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      if (response.status === 401) {
        localStorage.removeItem('admin-token')
        router.push('/about')
        return false
      }
      return true
    } catch (error) {
      router.push('/about')
      return false
    }
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) return

    try {
      const token = localStorage.getItem('admin-token')
      const authHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }

      // Fetch all data in parallel
      const [messagesRes, registrationsRes, applicationsRes, interviewsRes, activitiesRes] = await Promise.all([
        fetch('/api/messages', { credentials: 'include', headers: authHeaders }),
        fetch('/api/admin/registrations', { credentials: 'include', headers: authHeaders }).catch(() => null),
        fetch('/api/admin/applications', { credentials: 'include', headers: authHeaders }).catch(() => null),
        fetch('/api/admin/interviews', { credentials: 'include', headers: authHeaders }).catch(() => null),
        fetch('/api/admin/activities', { credentials: 'include', headers: authHeaders }).catch(() => null)
      ])

      if (messagesRes?.ok) {
        const messagesData = await messagesRes.json()
        setMessages(messagesData)
        setStats(prev => ({
          ...prev,
          totalMessages: messagesData.length,
          unreadMessages: messagesData.filter((m: Message) => m.status === 'unread').length
        }))
      }

      if (registrationsRes?.ok) {
        const regData = await registrationsRes.json()
        setRegistrations(regData)
        setStats(prev => ({
          ...prev,
          totalRegistrations: regData.length
        }))
      }

      if (applicationsRes?.ok) {
        const appData = await applicationsRes.json()
        setApplications(appData)
        setStats(prev => ({
          ...prev,
          totalApplications: appData.length,
          pendingApplications: appData.filter((a: CohortApplication) => a.status === 'pending').length
        }))
      }

      if (interviewsRes?.ok) {
        const intData = await interviewsRes.json()
        setInterviews(intData)
        setStats(prev => ({
          ...prev,
          scheduledInterviews: intData.filter((i: Interview) => i.status === 'scheduled').length
        }))
      }

      if (activitiesRes?.ok) {
        const actData = await activitiesRes.json()
        setRecentActivities(actData.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    localStorage.removeItem('admin-token')
    router.push('/about')
  }

  const markMessageAsRead = async (id: number) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'read' })
      })
      fetchAllData()
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE', credentials: 'include' })
        setSelectedMessage(null)
        fetchAllData()
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const updateApplicationStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      fetchAllData()
    } catch (error) {
      console.error('Failed to update application:', error)
    }
  }

  const filteredData = () => {
    if (!searchQuery) return { messages, registrations, applications }

    const query = searchQuery.toLowerCase()
    return {
      messages: messages.filter(m =>
        m.sender_name?.toLowerCase().includes(query) ||
        m.sender_email?.toLowerCase().includes(query) ||
        m.subject?.toLowerCase().includes(query)
      ),
      registrations: registrations.filter(r =>
        r.student_name?.toLowerCase().includes(query) ||
        r.student_email?.toLowerCase().includes(query)
      ),
      applications: applications.filter(a =>
        a.student_name?.toLowerCase().includes(query) ||
        a.student_email?.toLowerCase().includes(query)
      )
    }
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2f1 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #00A651',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const { messages: filteredMessages, registrations: filteredRegistrations, applications: filteredApplications } = filteredData()

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        <div style={{
          padding: '30px 20px',
          borderBottom: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#00A651',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            boxShadow: '0 4px 12px rgba(0, 166, 81, 0.2)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>Admin Dashboard</h2>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>EMSI Career Center</p>
        </div>

        <nav style={{ flex: 1, padding: '20px 15px', overflowY: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊', badge: null },
            { id: 'messages', label: 'Messages', icon: '✉️', badge: stats.unreadMessages },
            { id: 'registrations', label: 'Event Registrations', icon: '📅', badge: null },
            { id: 'applications', label: 'Applications', icon: '👥', badge: stats.pendingApplications },
            { id: 'interviews', label: 'Interviews', icon: '🎓', badge: stats.scheduledInterviews },
            { id: 'activities', label: 'Recent Activities', icon: '📋', badge: null }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '12px 15px',
                background: activeSection === item.id ? '#00A651' : 'transparent',
                color: activeSection === item.id ? 'white' : '#4b5563',
                border: 'none',
                borderRadius: '10px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = '#f3f4f6'
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{item.icon}</span>
                {item.label}
              </span>
              {item.badge ? (
                <span style={{
                  background: activeSection === item.id ? 'white' : '#ef4444',
                  color: activeSection === item.id ? '#00A651' : 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            margin: '15px',
            padding: '12px',
            background: '#fff',
            color: '#ef4444',
            border: '2px solid #ef4444',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#ef4444'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '20px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '5px'
            }}>
              {activeSection === 'overview' && 'Dashboard Overview'}
              {activeSection === 'messages' && 'Contact Messages'}
              {activeSection === 'registrations' && 'Event Registrations'}
              {activeSection === 'applications' && 'Ambassador Applications'}
              {activeSection === 'interviews' && 'Interview Schedule'}
              {activeSection === 'activities' && 'Recent Activities'}
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '250px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#00A651'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
              }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 15px',
              background: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '35px',
                height: '35px',
                background: '#00A651',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}>
                A
              </div>
              <span style={{ fontSize: '14px', color: '#4b5563' }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '30px' }}>
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {[
                  { label: 'Total Messages', value: stats.totalMessages, icon: '✉️', color: '#3b82f6' },
                  { label: 'Unread Messages', value: stats.unreadMessages, icon: '📬', color: '#ef4444' },
                  { label: 'Event Registrations', value: stats.totalRegistrations, icon: '📅', color: '#8b5cf6' },
                  { label: 'Pending Applications', value: stats.pendingApplications, icon: '⏳', color: '#f59e0b' },
                  { label: 'Scheduled Interviews', value: stats.scheduledInterviews, icon: '🎯', color: '#10b981' },
                  { label: 'Total Applications', value: stats.totalApplications, icon: '📝', color: '#ec4899' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '25px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>{stat.value}</h3>
                      </div>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: `${stat.color}20`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activities */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1a1a1a' }}>
                  Recent Activities
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        background: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: '#00A65120',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {activity.activity_type === 'message' && '✉️'}
                          {activity.activity_type === 'registration' && '📅'}
                          {activity.activity_type === 'application' && '📝'}
                          {!['message', 'registration', 'application'].includes(activity.activity_type) && '📌'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{activity.description}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            {activity.user_name && `${activity.user_name} • `}
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: '#9ca3af' }}>No recent activities</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Sender</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Subject</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Date</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Status</th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((message) => (
                        <tr key={message.id}
                            style={{
                              borderBottom: '1px solid #e5e7eb',
                              background: message.status === 'unread' ? '#f0fdf4' : 'white',
                              cursor: 'pointer'
                            }}
                            onClick={() => setSelectedMessage(message)}>
                          <td style={{ padding: '15px' }}>
                            <div>
                              <p style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>{message.sender_name}</p>
                              <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>{message.sender_email}</p>
                            </div>
                          </td>
                          <td style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>{message.subject}</td>
                          <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>
                            {new Date(message.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              background: message.status === 'unread' ? '#00A65120' : '#e5e7eb',
                              color: message.status === 'unread' ? '#00A651' : '#6b7280'
                            }}>
                              {message.status}
                            </span>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {message.status === 'unread' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markMessageAsRead(message.id)
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    background: '#00A651',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✓ Read
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteMessage(message.id)
                                }}
                                style={{
                                  padding: '6px 10px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Message Detail Panel */}
              {selectedMessage && (
                <div style={{
                  width: '400px',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1a1a1a' }}>
                    Message Details
                  </h3>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>From</p>
                    <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>{selectedMessage.sender_name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{selectedMessage.sender_email}</p>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Subject</p>
                    <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{selectedMessage.subject}</p>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Message</p>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{selectedMessage.message}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedMessage.status === 'unread' && (
                      <button
                        onClick={() => markMessageAsRead(selectedMessage.id)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#00A651',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event Registrations Section */}
          {activeSection === 'registrations' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>Event Registrations</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Student</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Event</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Major/Year</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Registration Date</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '15px' }}>
                          <div>
                            <p style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>{reg.student_name}</p>
                            <p style={{ color: '#6b7280', fontSize: '12px' }}>{reg.student_email}</p>
                          </div>
                        </td>
                        <td style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>
                          {reg.event?.title || 'N/A'}
                        </td>
                        <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>
                          {reg.major || 'N/A'} / {reg.year || 'N/A'}
                        </td>
                        <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>
                          {new Date(reg.registration_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: reg.status === 'confirmed' ? '#10b98120' : '#f59e0b20',
                            color: reg.status === 'confirmed' ? '#10b981' : '#f59e0b'
                          }}>
                            {reg.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Applications Section */}
          {activeSection === 'applications' && (
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>Ambassador Applications</h2>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Applicant</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Major/Year</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Cohort</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Applied</th>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Status</th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                          <tr key={app.id}
                              style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                              onClick={() => setSelectedApplication(app)}>
                            <td style={{ padding: '15px' }}>
                              <div>
                                <p style={{ fontWeight: 500, color: '#1a1a1a', fontSize: '14px' }}>{app.student_name}</p>
                                <p style={{ color: '#6b7280', fontSize: '12px' }}>{app.student_email}</p>
                              </div>
                            </td>
                            <td style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>
                              {app.major} / {app.year}
                            </td>
                            <td style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>
                              {app.cohort?.name || 'N/A'}
                            </td>
                            <td style={{ padding: '15px', color: '#6b7280', fontSize: '14px' }}>
                              {new Date(app.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '15px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 500,
                                background:
                                  app.status === 'pending' ? '#f59e0b20' :
                                  app.status === 'accepted' ? '#10b98120' :
                                  app.status === 'rejected' ? '#ef444420' :
                                  '#9ca3af20',
                                color:
                                  app.status === 'pending' ? '#f59e0b' :
                                  app.status === 'accepted' ? '#10b981' :
                                  app.status === 'rejected' ? '#ef4444' :
                                  '#9ca3af'
                              }}>
                                {app.status}
                              </span>
                            </td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateApplicationStatus(app.id, 'accepted')
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateApplicationStatus(app.id, 'rejected')
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✗
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                            No applications found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Application Detail Panel */}
              {selectedApplication && (
                <div style={{
                  width: '400px',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1a1a1a' }}>
                    Application Details
                  </h3>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Applicant</p>
                    <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>{selectedApplication.student_name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{selectedApplication.student_email}</p>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Academic Info</p>
                    <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{selectedApplication.major} - {selectedApplication.year}</p>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Motivation</p>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{selectedApplication.motivation}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interviews Section */}
          {activeSection === 'interviews' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '25px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1a1a1a' }}>
                Interview Schedule
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <div key={interview.id} style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      transition: 'box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                          {interview.application?.student_name || 'Unknown'}
                        </p>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: interview.status === 'scheduled' ? '#00A65120' : '#e5e7eb',
                          color: interview.status === 'scheduled' ? '#00A651' : '#6b7280'
                        }}>
                          {interview.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📅 {new Date(interview.interview_date).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🕐 {interview.interview_time}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📍 {interview.interview_type} - {interview.location || interview.meeting_link || 'TBD'}
                        </div>
                        {interview.interviewer_name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            👤 {interview.interviewer_name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#9ca3af', textAlign: 'center', gridColumn: '1 / -1' }}>
                    No interviews scheduled
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Activities Section */}
          {activeSection === 'activities' && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '25px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1a1a1a' }}>
                Recent Activities
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {recentActivities.map((activity) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '20px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      background: '#00A65120',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {activity.activity_type === 'message' && '✉️'}
                      {activity.activity_type === 'registration' && '📅'}
                      {activity.activity_type === 'application' && '📝'}
                      {activity.activity_type === 'interview' && '🎯'}
                      {!['message', 'registration', 'application', 'interview'].includes(activity.activity_type) && '📌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>{activity.description}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        {activity.user_name && `${activity.user_name} • `}
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}