'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
  durationMs = 1600,
  step,
  className = '',
  ariaLabel
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setIsReducedMotion(mediaQuery.matches)
      
      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Calculate optimal step for smooth animation
  const calculateStep = useCallback(() => {
    if (step !== undefined) return step
    
    // Target 60-120 frames for smooth animation
    const targetFrames = 80
    const estimatedStep = value / targetFrames
    
    if (value > 1000) {
      return Math.max(10, Math.floor(estimatedStep))
    } else if (value > 100) {
      return Math.max(1, Math.floor(estimatedStep))
    }
    return Math.max(0.1, estimatedStep)
  }, [value, step])

  // Ease-out animation curve
  const easeOut = (t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }

  // Animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now()
    }

    const currentTime = performance.now()
    const elapsed = currentTime - startTimeRef.current
    const progress = Math.min(elapsed / durationMs, 1)
    
    const easedProgress = easeOut(progress)
    const currentValue = Math.floor(value * easedProgress)
    
    setDisplayValue(currentValue)

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setDisplayValue(value)
      setHasAnimated(true)
    }
  }, [value, durationMs])

  // Setup Intersection Observer
  useEffect(() => {
    // Skip if reduced motion or already animated
    if (isReducedMotion || hasAnimated) {
      setDisplayValue(value)
      return
    }

    if (typeof window === 'undefined' || !elementRef.current) {
      return
    }

    // Fallback if IntersectionObserver is not available
    if (!('IntersectionObserver' in window)) {
      setDisplayValue(value)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35 && !hasAnimated) {
            startTimeRef.current = undefined
            animate()
          }
        })
      },
      {
        threshold: [0.35]
      }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, hasAnimated, isReducedMotion, value])

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  // Determine aria-live attribute
  const ariaLive = !isReducedMotion && !hasAnimated && displayValue < value ? 'polite' : 'off'

  return (
    <span
      ref={elementRef}
      className={className}
      aria-label={ariaLabel || `${prefix}${formatNumber(value)}${suffix}`}
      aria-live={ariaLive}
      role="status"
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  )
}