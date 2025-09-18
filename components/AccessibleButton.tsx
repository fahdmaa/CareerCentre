import React from 'react'

interface AccessibleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
  style?: React.CSSProperties
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  style = {}
}) => {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    position: 'relative',
    ...style
  }

  // Size styles
  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '14px' },
    medium: { padding: '8px 16px', fontSize: '16px' },
    large: { padding: '12px 24px', fontSize: '18px' }
  }

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? '#9ca3af' : '#00A651',
      color: 'white',
      boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
    },
    secondary: {
      backgroundColor: disabled ? '#f3f4f6' : '#e5e7eb',
      color: disabled ? '#9ca3af' : '#374151',
      border: '1px solid #d1d5db'
    },
    danger: {
      backgroundColor: disabled ? '#fca5a5' : '#dc2626',
      color: 'white',
      boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
    }
  }

  const focusStyles: React.CSSProperties = {
    outline: '2px solid #3b82f6',
    outlineOffset: '2px'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter and Space key activation
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled && !loading) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={`accessible-button ${className}`}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant]
      }}
      onFocus={(e) => {
        Object.assign(e.target.style, focusStyles)
      }}
      onBlur={(e) => {
        e.target.style.outline = 'none'
        e.target.style.outlineOffset = 'initial'
      }}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      <span>{children}</span>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}

export default AccessibleButton