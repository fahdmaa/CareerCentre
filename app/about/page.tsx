'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '../../components/Navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage as a fallback
        if (data.token) {
          localStorage.setItem('admin-token', data.token)
        }
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00A651 0%, #004A99 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '48px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease-out'
        }}>
          {/* Logo Section */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#00A651',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 30px rgba(0, 166, 81, 0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>
              Admin Portal
            </h1>
            <p style={{
              color: '#666',
              fontSize: '14px'
            }}>
              EMSI Career Center Management
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#B91C1C',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  disabled={isLoading}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    borderRadius: '10px',
                    border: '2px solid #E5E7EB',
                    fontSize: '15px',
                    transition: 'all 0.3s',
                    outline: 'none',
                    background: 'white',
                    color: '#1a1a1a'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00A651'
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 166, 81, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  pointerEvents: 'none'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoading}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    borderRadius: '10px',
                    border: '2px solid #E5E7EB',
                    fontSize: '15px',
                    transition: 'all 0.3s',
                    outline: 'none',
                    background: 'white',
                    color: '#1a1a1a'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00A651'
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 166, 81, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  pointerEvents: 'none'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#9CA3AF' : '#00A651',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '10px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(0, 166, 81, 0.4)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#008A43'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 166, 81, 0.5)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#00A651'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 166, 81, 0.4)'
                }
              }}
            >
              {isLoading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2V6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 18V22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.93 4.93L7.76 7.76" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.24 16.24L19.07 19.07" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M2 12H6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 12H22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.93 19.07L7.76 16.24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.24 7.76L19.07 4.93" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 17L15 12L10 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#9CA3AF',
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              Secure access to Career Center management
            </p>
            <p style={{
              color: '#6B7280',
              fontSize: '13px'
            }}>
              © 2024 EMSI Career Center
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .login-container > div {
            padding: 32px 24px !important;
          }
        }
      `}</style>

      <Navigation />
    </div>
  )
}