'use client'

import { useState } from 'react'

interface Event {
  id: number
  title: string
  event_date: string
  event_time: string
  location: string
  capacity: number
  spots_taken: number
}

interface RSVPModalProps {
  event: Event
  onClose: () => void
  onSuccess: () => void
}

export default function RSVPModal({ event, onClose, onSuccess }: RSVPModalProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentYear: '',
    studentProgram: '',
    consentUpdates: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call our API endpoint instead of direct database access
      const response = await fetch(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: formData.studentName,
          student_email: formData.studentEmail,
          student_phone: '',
          student_year: formData.studentYear,
          student_program: formData.studentProgram,
          consent_updates: formData.consentUpdates
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.success) {
        if (data.on_waitlist) {
          alert(`You're on the waitlist! Position #${data.waitlist_position}. We'll notify you if a spot opens.`)
        } else {
          alert("You're in! We've emailed your ticket and added it to your calendar.")
        }
        onSuccess()
      } else {
        setError(data.error || 'Registration failed. Please try again.')
      }
    } catch (error: any) {
      console.error('RSVP error:', error)
      setError(error.message || 'Something went wrong. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const spotsLeft = event.capacity - event.spots_taken
  const isWaitlist = spotsLeft <= 0

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

        .modal-header {
          background: linear-gradient(135deg, #00A651 0%, #00C853 100%);
          color: white;
          padding: 24px;
          position: relative;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .event-info {
          font-size: 14px;
          opacity: 0.95;
        }

        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          color: white;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .modal-body {
          padding: 32px 24px;
          max-height: 60vh;
          overflow-y: auto;
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

        .required {
          color: #ef4444;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
        }

        .form-input:focus, .form-select:focus {
          border-color: #00A651;
          box-shadow: 0 0 0 3px rgba(0, 166, 81, 0.1);
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 24px 0;
        }

        .checkbox-input {
          width: 20px;
          height: 20px;
          accent-color: #00A651;
          cursor: pointer;
          margin-top: 2px;
        }

        .checkbox-label {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
          cursor: pointer;
        }

        .waitlist-notice {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #991b1b;
          font-size: 14px;
        }

        .waitlist-notice i {
          margin-right: 8px;
          color: #ef4444;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #991b1b;
          font-size: 14px;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        .btn-primary {
          background: #00A651;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #008a43;
          transform: translateY(-1px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.6s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .modal-container {
            width: 95%;
            margin: 20px;
          }

          .modal-body {
            padding: 24px 20px;
          }

          .modal-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Reserve your spot</h2>
            <div className="event-info">
              {event.title} · {new Date(event.event_date).toLocaleDateString()}
            </div>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {isWaitlist && (
                <div className="waitlist-notice">
                  <i className="fas fa-exclamation-circle"></i>
                  This event is full. You'll be added to the waitlist.
                </div>
              )}

              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  EMSI Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                  required
                  placeholder="your.name@emsi.ma"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Year/Program <span className="optional">(optional)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <select
                    className="form-select"
                    value={formData.studentYear}
                    onChange={(e) => setFormData({...formData, studentYear: e.target.value})}
                  >
                    <option value="">Select year</option>
                    <option value="1st year">1st year</option>
                    <option value="2nd year">2nd year</option>
                    <option value="3rd year">3rd year</option>
                    <option value="4th year">4th year</option>
                    <option value="5th year">5th year</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.studentProgram}
                    onChange={(e) => setFormData({...formData, studentProgram: e.target.value})}
                    placeholder="Program/Major"
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="consent"
                  className="checkbox-input"
                  checked={formData.consentUpdates}
                  onChange={(e) => setFormData({...formData, consentUpdates: e.target.checked})}
                />
                <label htmlFor="consent" className="checkbox-label">
                  I agree to receive event updates for this RSVP.
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="loading-spinner"></span>}
                {isWaitlist ? 'Join waitlist' : 'Confirm RSVP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}