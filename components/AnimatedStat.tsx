'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedStatProps {
  value: number
  prefix?: string
  suffix?: string
  durationMs?: number
  step?: number
  className?: string
  ariaLabel?: string
}

export default function AnimatedStat({
  value,
  prefix = '',
  suffix = '',
  durationMs = 2000,
  step,
  className = '',
  ariaLabel
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number>()

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mediaQuery.matches) {
        setDisplayValue(value)
        setHasAnimated(true)
      }
    }
  }, [value])

  // Setup Intersection Observer
  useEffect(() => {
    const element = elementRef.current
    if (!element || hasAnimated) return

    // Check if IntersectionObserver is available
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setDisplayValue(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true)
            setHasAnimated(true)
          }
        })
      },
      {
        threshold: 0.1 // Lower threshold for better triggering
      }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [hasAnimated, value])

  // Animation effect
  useEffect(() => {
    if (!isVisible || displayValue >= value) return

    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      
      // Ease-out cubic animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (value - startValue) * easeOutCubic)
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isVisible, value, durationMs, displayValue])

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <span
      ref={elementRef}
      className={className}
      aria-label={ariaLabel || `${prefix}${formatNumber(value)}${suffix}`}
      role="status"
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  )
}