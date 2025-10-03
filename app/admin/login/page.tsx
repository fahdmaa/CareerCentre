'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import '../../form-theme.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Image 
              src="/images/logo-admin.svg" 
              alt="Admin Logo" 
              width={150}
              height={50}
              priority
            />
            <h1>Admin Portal</h1>
            <p>Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" style={{ padding: '30px' }}>
            {error && (
              <div className="error-message-themed">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <div className="form-group-themed">
              <label htmlFor="username" className="form-label-themed">
                <i className="fas fa-user"></i> Username
              </label>
              <input
                type="text"
                id="username"
                className="themed"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                disabled={isLoading}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group-themed">
              <label htmlFor="password" className="form-label-themed">
                <i className="fas fa-lock"></i> Password
              </label>
              <input
                type="password"
                id="password"
                className="themed"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn-submit-themed"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2024 EMSI Career Center. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}