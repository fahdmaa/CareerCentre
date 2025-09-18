'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import ClientLayout from '../../components/ClientLayout'
import StarBorder from '../../components/StarBorder'

export default function JobsPage() {
  const [countdown, setCountdown] = useState(10)
  const router = useRouter()
  const redirectUrl = 'https://emsicommunity.com/'

  useEffect(() => {
    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1)
      } else {
        window.location.href = redirectUrl
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  const handleGoNow = () => {
    window.location.href = redirectUrl
  }

  return (
    <ClientLayout>
      <div className="redirect-container">
        <div className="redirect-content">
          <div className="redirect-icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="redirect-message">
            You&apos;re being redirected to EMSI Community to explore job opportunities.
          </h1>
          
          <div className="countdown-wrapper">
            <p className="countdown-text">
              Redirecting in <span className="countdown-number">{countdown}</span> seconds
            </p>
          </div>
          
          <StarBorder
            onClick={handleGoNow}
            className="go-now-button"
            color="#00A651"
            speed="4s"
          >
            Go Now
          </StarBorder>
          
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
        
        <Navigation />
      </div>
      
      <style jsx>{`
        .redirect-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffffff 0%, rgba(0, 166, 81, 0.05) 100%);
          padding: 2rem;
        }
        
        .redirect-content {
          text-align: center;
          max-width: 600px;
          animation: fadeIn 0.5s ease-out;
        }
        
        .redirect-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(0, 166, 81, 0.1), rgba(0, 166, 81, 0.05));
          border-radius: 50%;
          margin-bottom: 2rem;
          color: #00A651;
        }
        
        .redirect-message {
          font-size: 1.5rem;
          line-height: 1.75;
          color: #374151;
          margin-bottom: 2rem;
        }
        
        @media (min-width: 768px) {
          .redirect-message {
            font-size: 2rem;
          }
        }
        
        .countdown-wrapper {
          margin-bottom: 2rem;
        }
        
        .countdown-text {
          font-size: 1.125rem;
          color: #6B7280;
        }
        
        .countdown-number {
          font-weight: bold;
          color: #00A651;
          font-size: 1.5rem;
          margin: 0 0.25rem;
          display: inline-block;
          animation: pulse 1s ease-in-out infinite;
        }
        
        .go-now-button {
          margin-bottom: 2rem;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          color: #6B7280;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }
        
        .back-link:hover {
          color: #374151;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </ClientLayout>
  )
}