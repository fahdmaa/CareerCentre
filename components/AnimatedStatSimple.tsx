'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedStatProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  ariaLabel?: string
}

export default function AnimatedStat({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  className = '',
  ariaLabel
}: AnimatedStatProps) {
  const [count, setCount] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsInView(true)
          hasAnimated.current = true
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    let animationFrame: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Ease out cubic
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOutCubic * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount)
      } else {
        setCount(value)
      }
    }

    animationFrame = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, value, duration])

  return (
    <span
      ref={elementRef}
      className={className}
      aria-label={ariaLabel}
      role="status"
    >
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}