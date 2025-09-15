'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  end,
  prefix = '',
  suffix = '',
  duration = 2000,
  className = ''
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const countRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setCount(end)
        return
      }
    }

    const currentElement = countRef.current
    if (!currentElement) return

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: animate immediately
      console.log('IntersectionObserver not supported, animating immediately')
      setIsVisible(true)
      return
    }

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        // Only trigger if element is intersecting and we haven't animated yet
        if (entry && entry.isIntersecting && !hasAnimated.current) {
          console.log('Element is visible, starting animation for value:', end)
          setIsVisible(true)
          hasAnimated.current = true
          observer.disconnect() // Stop observing once animation starts
        }
      },
      {
        threshold: 0.01, // Very low threshold to trigger easily
        rootMargin: '0px'
      }
    )

    // Start observing
    observer.observe(currentElement)

    // Cleanup
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [end])

  useEffect(() => {
    if (!isVisible) return

    console.log('Starting count animation to', end)
    
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // Ease out cubic function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(easeOutCubic * end)
      
      setCount(currentCount)
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(end) // Ensure we end on exact value
      }
    }
    
    window.requestAnimationFrame(step)
  }, [end, duration, isVisible])

  // Format number with comma separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div ref={countRef} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </div>
  )
}