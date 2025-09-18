import React from 'react'

interface AccessibleInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
  autoComplete?: string
  ariaDescribedBy?: string
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  autoComplete,
  ariaDescribedBy
}) => {
  const inputId = id
  const errorId = error ? `${id}-error` : undefined
  const helpId = helpText ? `${id}-help` : undefined

  const describedBy = [ariaDescribedBy, errorId, helpId].filter(Boolean).join(' ')

  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          marginBottom: '4px',
          fontWeight: 600,
          color: error ? '#dc2626' : '#374151',
          fontSize: '14px'
        }}
      >
        {label}
        {required && (
          <span
            aria-label="required"
            style={{ color: '#dc2626', marginLeft: '4px' }}
          >
            *
          </span>
        )}
      </label>

      {helpText && (
        <p
          id={helpId}
          style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0 0 4px 0'
          }}
        >
          {helpText}
        </p>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `2px solid ${error ? '#dc2626' : '#d1d5db'}`,
          borderRadius: '4px',
          fontSize: '16px',
          backgroundColor: disabled ? '#f3f4f6' : 'white',
          color: disabled ? '#9ca3af' : '#111827',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#dc2626' : '#3b82f6'
          e.target.style.outline = '2px solid rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#dc2626' : '#d1d5db'
          e.target.style.outline = 'none'
        }}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            fontSize: '12px',
            color: '#dc2626',
            margin: '4px 0 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

interface AccessibleSelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error,
  helpText
}) => {
  const selectId = id
  const errorId = error ? `${id}-error` : undefined
  const helpId = helpText ? `${id}-help` : undefined

  const describedBy = [errorId, helpId].filter(Boolean).join(' ')

  return (
    <div style={{ marginBottom: '16px' }}>
      <label
        htmlFor={selectId}
        style={{
          display: 'block',
          marginBottom: '4px',
          fontWeight: 600,
          color: error ? '#dc2626' : '#374151',
          fontSize: '14px'
        }}
      >
        {label}
        {required && (
          <span
            aria-label="required"
            style={{ color: '#dc2626', marginLeft: '4px' }}
          >
            *
          </span>
        )}
      </label>

      {helpText && (
        <p
          id={helpId}
          style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0 0 4px 0'
          }}
        >
          {helpText}
        </p>
      )}

      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `2px solid ${error ? '#dc2626' : '#d1d5db'}`,
          borderRadius: '4px',
          fontSize: '16px',
          backgroundColor: disabled ? '#f3f4f6' : 'white',
          color: disabled ? '#9ca3af' : '#111827',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#dc2626' : '#3b82f6'
          e.target.style.outline = '2px solid rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#dc2626' : '#d1d5db'
          e.target.style.outline = 'none'
        }}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            fontSize: '12px',
            color: '#dc2626',
            margin: '4px 0 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}