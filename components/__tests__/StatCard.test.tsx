import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatCard from '../StatCard'

// Mock the AnimatedStat component
jest.mock('../AnimatedStat', () => {
  return function MockAnimatedStat({ value, prefix, suffix, ariaLabel, className }: any) {
    return (
      <span aria-label={ariaLabel} className={className}>
        {prefix}{value.toLocaleString()}{suffix}
      </span>
    )
  }
})

describe('StatCard', () => {
  it('should render all elements correctly', () => {
    render(
      <StatCard
        value={80}
        title="Employability Rate"
        caption="Within 6 months of graduation"
        suffix="%"
      />
    )

    // Check if title is rendered
    expect(screen.getByText('Employability Rate')).toBeInTheDocument()
    
    // Check if caption is rendered
    expect(screen.getByText('Within 6 months of graduation')).toBeInTheDocument()
    
    // Check if value is rendered with prefix and suffix
    expect(screen.getByLabelText('+80% — Employability Rate')).toBeInTheDocument()
  })

  it('should use default prefix when not provided', () => {
    render(
      <StatCard
        value={2000}
        title="Students Mentored"
        caption="Career guidance provided"
      />
    )

    // Should have the default '+' prefix
    expect(screen.getByLabelText('+2,000 — Students Mentored')).toBeInTheDocument()
  })

  it('should handle custom prefix', () => {
    render(
      <StatCard
        value={100}
        title="Test Metric"
        caption="Test caption"
        prefix="~"
        suffix=" units"
      />
    )

    expect(screen.getByLabelText('~100 units — Test Metric')).toBeInTheDocument()
  })

  it('should format aria-label correctly', () => {
    render(
      <StatCard
        value={200}
        title="Partners in Morocco"
        caption="Leading companies"
      />
    )

    const element = screen.getByLabelText('+200 — Partners in Morocco')
    expect(element).toBeInTheDocument()
  })

  it('should render with proper HTML structure', () => {
    const { container } = render(
      <StatCard
        value={50}
        title="Test Title"
        caption="Test Caption"
        suffix="%"
      />
    )

    // Check for main card container
    const card = container.querySelector('.stat-card')
    expect(card).toBeInTheDocument()

    // Check for value container
    const valueContainer = container.querySelector('.stat-value')
    expect(valueContainer).toBeInTheDocument()

    // Check for title element
    const title = container.querySelector('.stat-title')
    expect(title).toHaveTextContent('Test Title')

    // Check for caption element
    const caption = container.querySelector('.stat-caption')
    expect(caption).toHaveTextContent('Test Caption')
  })

  it('should apply correct CSS classes', () => {
    const { container } = render(
      <StatCard
        value={1000}
        title="Metric"
        caption="Description"
      />
    )

    // Check that AnimatedStat receives the correct className
    const animatedStat = container.querySelector('.stat-number')
    expect(animatedStat).toBeInTheDocument()
  })

  it('should handle large numbers correctly', () => {
    render(
      <StatCard
        value={1000000}
        title="Large Number"
        caption="Big metric"
      />
    )

    expect(screen.getByLabelText('+1,000,000 — Large Number')).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    render(
      <StatCard
        value={0}
        title="Zero Metric"
        caption="Starting point"
        prefix=""
      />
    )

    expect(screen.getByLabelText('0 — Zero Metric')).toBeInTheDocument()
  })

  it('should handle negative values', () => {
    render(
      <StatCard
        value={-50}
        title="Negative Metric"
        caption="Below baseline"
        prefix=""
        suffix="%"
      />
    )

    expect(screen.getByLabelText('-50% — Negative Metric')).toBeInTheDocument()
  })
})