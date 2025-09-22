'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Message {
  id: number
  sender_name: string
  sender_email: string
  sender_phone?: string
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
  on_waitlist?: boolean
  waitlist_position?: number
  consent_updates?: boolean
  notes?: string
  updated_at?: string
  event?: {
    title: string
    event_date: string
  }
  events?: {
    id: number
    title: string
    event_date: string
    event_time?: string
    location?: string
    capacity?: number
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

interface Event {
  id: number
  title: string
  description?: string
  event_date: string
  event_time: string
  location: string
  capacity: number
  spots_taken: number
  event_type: string
  event_format: string
  status: string
  created_at: string
  updated_at?: string
  featured?: boolean
  city?: string
  campus?: string
  host_org?: string
  image_url?: string
  guest_speaker_name?: string
  guest_speaker_occupation?: string
  guest_speaker_bio?: string
  guest_speaker_photo?: string
  guest_speaker_linkedin?: string
  agenda?: string
  speakers?: string
  what_to_bring?: string
  meeting_link?: string
  tags?: string[]
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

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1500 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    // Only animate once when component mounts or value changes
    if (!hasAnimated && value > 0) {
      const startTime = Date.now()
      const endValue = value

      const updateCounter = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(easeOutQuart * endValue)

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(updateCounter)
        } else {
          setDisplayValue(endValue)
          setHasAnimated(true)
        }
      }

      requestAnimationFrame(updateCounter)
    } else {
      // If already animated, just show the value
      setDisplayValue(value)
    }
  }, [value, duration, hasAnimated])

  return <span>{displayValue}</span>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [applications, setApplications] = useState<CohortApplication[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [events, setEvents] = useState<Event[]>([])
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

  // Profile management states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [adminData, setAdminData] = useState({
    fullName: 'Admin User',
    email: 'admin@emsi.ma',
    occupation: 'System Administrator',
    role: 'admin', // admin, super_admin, member
    username: 'admin'
  })
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    occupation: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)

  // Events management states
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    capacity: '',
    event_type: 'workshop',
    event_format: 'on-campus',
    featured: false,
    city: '',
    campus: '',
    host_org: '',
    image_url: '',
    guest_speaker_name: '',
    guest_speaker_occupation: '',
    guest_speaker_bio: '',
    guest_speaker_photo: '',
    guest_speaker_linkedin: '',
    agenda: '',
    speakers: '',
    what_to_bring: '',
    meeting_link: ''
  })

  // Load profile picture and admin data on mount
  useEffect(() => {
    const savedPicture = localStorage.getItem('adminProfilePicture')
    if (savedPicture) {
      setProfilePicture(savedPicture)
    }

    // Fetch admin profile data
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/profile', {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include'
        })

        if (response.ok) {
          const profileData = await response.json()
          setAdminData(profileData)
          setEditFormData({
            fullName: profileData.fullName,
            email: profileData.email,
            occupation: profileData.occupation,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error)
      }
    }

    fetchAdminProfile()
  }, [])

  // Handle password change validation
  const handlePasswordChange = async () => {
    setPasswordError('')

    if (editFormData.newPassword || editFormData.confirmPassword || editFormData.currentPassword) {
      if (!editFormData.currentPassword) {
        setPasswordError('Please enter your current password')
        return false
      }

      if (editFormData.newPassword !== editFormData.confirmPassword) {
        setPasswordError('New passwords do not match')
        return false
      }

      if (editFormData.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters')
        return false
      }

      // Verify current password
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/admin/verify-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ password: editFormData.currentPassword })
        })

        if (!response.ok) {
          setPasswordError('Current password is incorrect')
          return false
        }
      } catch (error) {
        setPasswordError('Failed to verify password')
        return false
      }
    }

    return true
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (await handlePasswordChange()) {
      // Update admin data
      setAdminData({
        ...adminData,
        fullName: editFormData.fullName,
        email: editFormData.email,
        occupation: editFormData.occupation
      })

      // Save to backend (we'll create the endpoint later)
      try {
        const token = localStorage.getItem('adminToken')
        const updateData: any = {
          fullName: editFormData.fullName,
          email: editFormData.email,
          occupation: editFormData.occupation
        }

        if (editFormData.newPassword) {
          updateData.newPassword = editFormData.newPassword
        }

        await fetch('/api/admin/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(updateData)
        })
      } catch (error) {
        console.error('Failed to update profile:', error)
      }

      setProfileUpdateSuccess(true)
      setTimeout(() => {
        setShowEditProfile(false)
        setProfileUpdateSuccess(false)
        setEditFormData({
          ...editFormData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }, 2000)
    }
  }

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

  // Update stats whenever messages change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => m.status === 'unread').length
    }))
  }, [messages])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      console.log('Checking auth with token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      console.log('Auth verify response status:', response.status)

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Auth failed:', errorData)
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
      const [messagesRes, registrationsRes, applicationsRes, interviewsRes, eventsRes, activitiesRes] = await Promise.all([
        fetch('/api/messages', { credentials: 'include', headers: authHeaders }),
        fetch('/api/admin/registrations', { credentials: 'include', headers: authHeaders }).catch(() => null),
        fetch('/api/admin/applications', { credentials: 'include', headers: authHeaders }).catch(() => null),
        fetch('/api/admin/interviews', { credentials: 'include', headers: authHeaders }).catch(() => null),
        fetch('/api/admin/events', { credentials: 'include', headers: authHeaders }).catch(() => null),
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
        // Handle new API response structure
        const registrationsList = regData.registrations || regData || []
        const analytics = regData.analytics || {}

        setRegistrations(registrationsList)
        setStats(prev => ({
          ...prev,
          totalRegistrations: analytics.totalRegistrations || registrationsList.length
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

      if (eventsRes?.ok) {
        const eventsData = await eventsRes.json()
        // Handle new API response structure
        const eventsList = eventsData.events || eventsData || []
        const analytics = eventsData.analytics || {}

        setEvents(eventsList)
        setStats(prev => ({
          ...prev,
          upcomingEvents: analytics.upcomingEvents || eventsList.filter((e: Event) => e.status === 'upcoming').length
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
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'read' })
      })

      if (response.ok) {
        // Update local state instead of refetching everything
        setMessages(messages.map(msg =>
          msg.id === id ? { ...msg, status: 'read' } : msg
        ))
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: 'read' })
        }
      }
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        const token = localStorage.getItem('adminToken')
        const response = await fetch(`/api/messages/${id}`, {
          method: 'DELETE',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          credentials: 'include'
        })

        if (response.ok) {
          // Update local state instead of refetching
          setMessages(messages.filter(msg => msg.id !== id))
          if (selectedMessage?.id === id) {
            setSelectedMessage(null)
          }
        }
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

  // Event management functions
  const openEventModal = (event?: Event) => {
    if (event) {
      setSelectedEvent(event)
      setEventFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date,
        event_time: event.event_time,
        location: event.location,
        capacity: event.capacity.toString(),
        event_type: event.event_type,
        event_format: event.event_format,
        featured: event.featured || false,
        city: event.city || '',
        campus: event.campus || '',
        host_org: event.host_org || '',
        image_url: event.image_url || '',
        guest_speaker_name: event.guest_speaker_name || '',
        guest_speaker_occupation: event.guest_speaker_occupation || '',
        guest_speaker_bio: event.guest_speaker_bio || '',
        guest_speaker_photo: event.guest_speaker_photo || '',
        guest_speaker_linkedin: event.guest_speaker_linkedin || '',
        agenda: event.agenda || '',
        speakers: event.speakers || '',
        what_to_bring: event.what_to_bring || '',
        meeting_link: event.meeting_link || ''
      })
    } else {
      setSelectedEvent(null)
      setEventFormData({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        capacity: '',
        event_type: 'workshop',
        event_format: 'on-campus',
        featured: false,
        city: '',
        campus: '',
        host_org: '',
        image_url: '',
        guest_speaker_name: '',
        guest_speaker_occupation: '',
        guest_speaker_bio: '',
        guest_speaker_photo: '',
        guest_speaker_linkedin: '',
        agenda: '',
        speakers: '',
        what_to_bring: '',
        meeting_link: ''
      })
    }
    setShowEventModal(true)
  }

  const closeEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('admin-token')
      const isEditing = selectedEvent !== null

      const eventData = {
        ...eventFormData,
        capacity: parseInt(eventFormData.capacity)
      }

      const requestBody: any = isEditing
        ? { ...eventData, eventId: selectedEvent.id }
        : eventData

      const response = await fetch('/api/admin/events', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        await fetchAllData()
        closeEventModal()
      } else {
        const errorData = await response.json()
        console.error('Failed to save event:', errorData)
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      })

      if (response.ok) {
        await fetchAllData()
      } else {
        const errorData = await response.json()
        console.error('Failed to delete event:', errorData)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
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
        width: isSidebarCollapsed ? '80px' : '280px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            position: 'absolute',
            right: '-15px',
            top: '30px',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'white',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 101,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <path d="M15 18L9 12L15 6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={{
          padding: isSidebarCollapsed ? '30px 10px' : '30px 20px',
          borderBottom: '1px solid #e5e7eb',
          textAlign: 'center',
          transition: 'padding 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '140px'
        }}>
          {/* Dynamic Logo based on sidebar state */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px',
            height: '60px',
            transition: 'all 0.3s ease'
          }}>
            <Image
              src={isSidebarCollapsed ? '/images/logo-minimized-sidebar.png' : '/images/logo-full-sidebar.png'}
              alt="EMSI Logo"
              width={isSidebarCollapsed ? 50 : 180}
              height={50}
              style={{
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
              priority
            />
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            opacity: isSidebarCollapsed ? 0 : 1,
            height: isSidebarCollapsed ? 0 : 'auto',
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, height 0.3s ease',
            marginBottom: '5px'
          }}>Admin Dashboard</h2>
          <p style={{
            fontSize: '12px',
            color: '#666',
            opacity: isSidebarCollapsed ? 0 : 1,
            height: isSidebarCollapsed ? 0 : 'auto',
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, height 0.3s ease'
          }}>Career Center Management</p>
        </div>

        <nav style={{
          flex: 1,
          padding: isSidebarCollapsed ? '20px 8px' : '20px 15px',
          overflowY: 'auto',
          transition: 'padding 0.3s ease'
        }}>
          {[
            {
              id: 'overview',
              label: 'Overview',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              ),
              badge: null
            },
            {
              id: 'messages',
              label: 'Messages',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              ),
              badge: stats.unreadMessages
            },
            {
              id: 'registrations',
              label: 'Event Registrations',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              ),
              badge: null
            },
            {
              id: 'applications',
              label: 'Applications',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              badge: stats.pendingApplications
            },
            {
              id: 'interviews',
              label: 'Interviews',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              ),
              badge: stats.scheduledInterviews
            },
            {
              id: 'events',
              label: 'Events',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="8" cy="14" r="1" />
                  <circle cx="12" cy="14" r="1" />
                  <circle cx="16" cy="14" r="1" />
                </svg>
              ),
              badge: null
            },
            {
              id: 'activities',
              label: 'Recent Activities',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ),
              badge: null
            }
          ].map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveSection(item.id)}
                title={isSidebarCollapsed ? item.label : ''}
                style={{
                  width: '100%',
                  padding: isSidebarCollapsed ? '12px' : '12px 15px',
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
                  justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                  transition: 'all 0.3s',
                  position: 'relative'
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
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isSidebarCollapsed ? '0' : '10px',
                  justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isSidebarCollapsed ? '24px' : '20px',
                    height: isSidebarCollapsed ? '24px' : '20px'
                  }}>
                    {React.cloneElement(item.icon as React.ReactElement, {
                      width: isSidebarCollapsed ? 24 : 20,
                      height: isSidebarCollapsed ? 24 : 20
                    })}
                  </span>
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </span>
                {!isSidebarCollapsed && item.badge ? (
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
              {/* Badge for collapsed state */}
              {isSidebarCollapsed && item.badge ? (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#ef4444',
                  color: 'white',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          title={isSidebarCollapsed ? 'Logout' : ''}
          style={{
            margin: isSidebarCollapsed ? '15px 8px' : '15px',
            padding: isSidebarCollapsed ? '12px' : '12px',
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
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isSidebarCollapsed ? '80px' : '280px',
        minHeight: '100vh',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
              {activeSection === 'events' && 'Event Management'}
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
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 15px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
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
                    {adminData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '14px', color: '#4b5563' }}>{adminData.fullName}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="2"
                  style={{ transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  minWidth: '250px',
                  zIndex: 100,
                  overflow: 'hidden',
                  transform: 'translateY(0)',
                  opacity: 1,
                  transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '45px',
                          height: '45px',
                          background: '#00A651',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 600
                        }}>
                          {adminData.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{adminData.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{adminData.email}</div>
                        <div style={{
                          fontSize: '11px',
                          color: '#00A651',
                          background: '#00A65120',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '4px',
                          textTransform: 'capitalize'
                        }}>
                          {adminData.role.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={() => {
                        document.getElementById('profilePictureInput')?.click()
                        setShowProfileDropdown(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#4b5563',
                        fontSize: '14px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      {profilePicture ? 'Change Profile Picture' : 'Add Profile Picture'}
                    </button>

                    {profilePicture && (
                      <button
                        onClick={() => {
                          setProfilePicture(null)
                          localStorage.removeItem('adminProfilePicture')
                          setShowProfileDropdown(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          fontSize: '14px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'background 0.2s',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete Profile Picture
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false)
                        setShowEditProfile(true)
                        setEditFormData({
                          fullName: adminData.fullName,
                          email: adminData.email,
                          occupation: adminData.occupation,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#4b5563',
                        fontSize: '14px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit Your Admin Data
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden file input for profile picture */}
              <input
                id="profilePictureInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      const result = reader.result as string
                      setProfilePicture(result)
                      localStorage.setItem('adminProfilePicture', result)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
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
                  {
                    label: 'Total Messages',
                    value: stats.totalMessages,
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    ),
                    color: '#3b82f6'
                  },
                  {
                    label: 'Unread Messages',
                    value: stats.unreadMessages,
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                        <circle cx="18" cy="8" r="3" fill="currentColor" />
                      </svg>
                    ),
                    color: '#ef4444'
                  },
                  {
                    label: 'Event Registrations',
                    value: stats.totalRegistrations,
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                    color: '#8b5cf6'
                  },
                  {
                    label: 'Pending Applications',
                    value: stats.pendingApplications,
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                    color: '#f59e0b'
                  },
                  {
                    label: 'Scheduled Interviews',
                    value: stats.scheduledInterviews,
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                        <path d="M12 14v7" />
                      </svg>
                    ),
                    color: '#10b981'
                  },
                  {
                    label: 'Total Applications',
                    value: stats.totalApplications,
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    ),
                    color: '#ec4899'
                  }
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
                        <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>
                          <AnimatedCounter value={stat.value} duration={1200} />
                        </h3>
                      </div>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: `${stat.color}20`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color
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
                          {activity.activity_type === 'message' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00A651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          )}
                          {activity.activity_type === 'registration' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00A651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          )}
                          {activity.activity_type === 'application' && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00A651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          )}
                          {!['message', 'registration', 'application'].includes(activity.activity_type) && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00A651" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
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
                              background: selectedMessage?.id === message.id
                                ? '#e0f2fe'
                                : message.status === 'unread'
                                  ? '#f0fdf4'
                                  : 'white',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onClick={() => setSelectedMessage(message)}
                            onMouseEnter={(e) => {
                              if (selectedMessage?.id !== message.id) {
                                e.currentTarget.style.background = '#f9fafb'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedMessage?.id !== message.id) {
                                e.currentTarget.style.background = message.status === 'unread' ? '#f0fdf4' : 'white'
                              }
                            }}>
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
                                  padding: '6px 12px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: 500
                                }}
                              >
                                Delete
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                      Message Details
                    </h3>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>From</p>
                    <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>{selectedMessage.sender_name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{selectedMessage.sender_email}</p>
                    {selectedMessage.sender_phone && (
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>📱 {selectedMessage.sender_phone}</p>
                    )}
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
                          {reg.events?.title || reg.event?.title || 'N/A'}
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

          {/* Events Section */}
          {activeSection === 'events' && (
            <div>
              {/* Header with Create Button */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '25px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '5px', color: '#1a1a1a' }}>
                    Event Management
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    Create, edit, and manage career events
                  </p>
                </div>
                <button
                  onClick={() => openEventModal()}
                  style={{
                    background: '#00A651',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Event
                </button>
              </div>

              {/* Events List */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '25px'
              }}>
                {events.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '16px' }}>No events found</p>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#999' }}>Create your first event to get started</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Event</th>
                          <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date & Time</th>
                          <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Location</th>
                          <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Capacity</th>
                          <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(event => (
                          <tr key={event.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '16px 0' }}>
                              <div>
                                <div style={{ fontWeight: 500, color: '#1a1a1a', marginBottom: '4px' }}>
                                  {event.title}
                                  {event.featured && (
                                    <span style={{
                                      background: '#fbbf24',
                                      color: 'white',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '10px',
                                      marginLeft: '8px'
                                    }}>
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  {event.event_type} • {event.event_format}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 0', color: '#374151' }}>
                              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                                {new Date(event.event_date).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {event.event_time}
                              </div>
                            </td>
                            <td style={{ padding: '16px 0', color: '#374151', fontSize: '14px' }}>
                              {event.location}
                            </td>
                            <td style={{ padding: '16px 0' }}>
                              <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                {event.spots_taken} / {event.capacity}
                              </div>
                              <div style={{
                                width: '60px',
                                height: '4px',
                                background: '#e5e7eb',
                                borderRadius: '2px',
                                marginTop: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(event.spots_taken / event.capacity) * 100}%`,
                                  height: '100%',
                                  background: event.spots_taken >= event.capacity ? '#ef4444' : event.spots_taken / event.capacity > 0.8 ? '#f59e0b' : '#00A651',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                            </td>
                            <td style={{ padding: '16px 0' }}>
                              <span style={{
                                background: event.status === 'upcoming' ? '#dcfce7' : event.status === 'ongoing' ? '#fef3c7' : '#fee2e2',
                                color: event.status === 'upcoming' ? '#166534' : event.status === 'ongoing' ? '#92400e' : '#dc2626',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 500,
                                textTransform: 'capitalize'
                              }}>
                                {event.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px 0', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => openEventModal(event)}
                                  style={{
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#374151'
                                  }}
                                  title="Edit Event"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteEvent(event.id)}
                                  style={{
                                    background: '#fee2e2',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: '#dc2626'
                                  }}
                                  title="Delete Event"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            animation: 'slideUp 0.3s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '25px 30px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0
              }}>Edit Your Admin Data</h2>
              <button
                onClick={() => {
                  setShowEditProfile(false)
                  setPasswordError('')
                  setProfileUpdateSuccess(false)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px' }}>
              {profileUpdateSuccess && (
                <div style={{
                  padding: '12px 16px',
                  background: '#10b98120',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#059669',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Profile updated successfully!
                </div>
              )}

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4b5563'
                }}>Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00A651'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4b5563'
                }}>Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00A651'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4b5563'
                }}>Occupation</label>
                <input
                  type="text"
                  value={editFormData.occupation}
                  onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00A651'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#4b5563'
                }}>Current Status</label>
                <div style={{
                  padding: '10px 14px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ textTransform: 'capitalize' }}>
                    {adminData.role.replace('_', ' ')}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#00A651',
                    background: '#00A65120',
                    padding: '4px 10px',
                    borderRadius: '4px'
                  }}>Active</span>
                </div>
              </div>

              {/* Password Change Section */}
              <div style={{
                marginTop: '30px',
                paddingTop: '30px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '20px'
                }}>Change Password (Optional)</h3>

                {passwordError && (
                  <div style={{
                    padding: '10px 14px',
                    background: '#ef444420',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    color: '#dc2626',
                    fontSize: '13px'
                  }}>
                    {passwordError}
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}>Current Password</label>
                  <input
                    type="password"
                    value={editFormData.currentPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, currentPassword: e.target.value })}
                    placeholder="Enter current password to change"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A651'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}>New Password</label>
                  <input
                    type="password"
                    value={editFormData.newPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A651'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#4b5563'
                  }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={editFormData.confirmPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00A651'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '30px'
              }}>
                <button
                  onClick={handleProfileUpdate}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#00A651',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#008741'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#00A651'}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditProfile(false)
                    setPasswordError('')
                    setProfileUpdateSuccess(false)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              borderRadius: '16px 16px 0 0',
              zIndex: 10
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#1a1a1a',
                margin: 0
              }}>
                {selectedEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={closeEventModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEventSubmit} style={{ padding: '32px' }}>
              {/* Basic Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s'
                      }}
                      placeholder="Enter event title"
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Description
                    </label>
                    <textarea
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        transition: 'border-color 0.3s'
                      }}
                      placeholder="Describe the event..."
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Date & Location
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventFormData.event_date}
                      onChange={(e) => setEventFormData({...eventFormData, event_date: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={eventFormData.event_time}
                      onChange={(e) => setEventFormData({...eventFormData, event_time: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={eventFormData.capacity}
                      onChange={(e) => setEventFormData({...eventFormData, capacity: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'border-color 0.3s'
                      }}
                      placeholder="Max attendees"
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s'
                    }}
                    placeholder="Event location or online meeting link"
                    onFocus={(e) => e.target.style.borderColor = '#00A651'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Event Type & Format */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Event Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Event Type
                    </label>
                    <select
                      value={eventFormData.event_type}
                      onChange={(e) => setEventFormData({...eventFormData, event_type: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="fair">Career Fair</option>
                      <option value="networking">Networking</option>
                      <option value="conference">Conference</option>
                      <option value="training">Training</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Format
                    </label>
                    <select
                      value={eventFormData.event_format}
                      onChange={(e) => setEventFormData({...eventFormData, event_format: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        transition: 'border-color 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    >
                      <option value="on-campus">On Campus</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="off-campus">Off Campus</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '30px' }}>
                    <input
                      type="checkbox"
                      id="featured"
                      checked={eventFormData.featured}
                      onChange={(e) => setEventFormData({...eventFormData, featured: e.target.checked})}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#00A651'
                      }}
                    />
                    <label htmlFor="featured" style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      cursor: 'pointer'
                    }}>
                      Featured Event
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Additional Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Agenda
                    </label>
                    <textarea
                      value={eventFormData.agenda}
                      onChange={(e) => setEventFormData({...eventFormData, agenda: e.target.value})}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        transition: 'border-color 0.3s'
                      }}
                      placeholder="Event agenda or schedule..."
                      onFocus={(e) => e.target.style.borderColor = '#00A651'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Host Organization
                      </label>
                      <input
                        type="text"
                        value={eventFormData.host_org}
                        onChange={(e) => setEventFormData({...eventFormData, host_org: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s'
                        }}
                        placeholder="Hosting organization"
                        onFocus={(e) => e.target.style.borderColor = '#00A651'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        What to Bring
                      </label>
                      <input
                        type="text"
                        value={eventFormData.what_to_bring}
                        onChange={(e) => setEventFormData({...eventFormData, what_to_bring: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s'
                        }}
                        placeholder="What attendees should bring"
                        onFocus={(e) => e.target.style.borderColor = '#00A651'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                  {eventFormData.event_format === 'online' || eventFormData.event_format === 'hybrid' ? (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Meeting Link
                      </label>
                      <input
                        type="url"
                        value={eventFormData.meeting_link}
                        onChange={(e) => setEventFormData({...eventFormData, meeting_link: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'border-color 0.3s'
                        }}
                        placeholder="https://zoom.us/j/..."
                        onFocus={(e) => e.target.style.borderColor = '#00A651'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
                position: 'sticky',
                bottom: 0,
                backgroundColor: 'white',
                marginTop: '32px'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: '#00A651',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#008741'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#00A651'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={closeEventModal}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}