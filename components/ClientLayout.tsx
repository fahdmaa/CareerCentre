'use client'

import { useEffect } from 'react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize animations
    const initAnimations = () => {
      // Intersection Observer for scroll animations
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }

      const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated')
            // For one-time animations
            if (entry.target.classList.contains('animate-once')) {
              animateOnScroll.unobserve(entry.target)
            }
          }
        })
      }, observerOptions)

      // Observe all elements with animation classes
      const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right, .zoom-in, .animate-on-scroll')
      animatedElements.forEach(el => animateOnScroll.observe(el))

      // Stats counter animation
      const animateStats = () => {
        const stats = document.querySelectorAll('.stat-number')
        stats.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target') || stat.textContent?.replace(/\D/g, '') || '0')
          const duration = 2000
          const increment = target / (duration / 16)
          let current = 0

          const updateCounter = () => {
            current += increment
            if (current < target) {
              stat.textContent = Math.floor(current) + '+'
              requestAnimationFrame(updateCounter)
            } else {
              stat.textContent = target + '+'
            }
          }

          // Start animation when element is in view
          const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
              updateCounter()
              observer.unobserve(stat)
            }
          })
          observer.observe(stat)
        })
      }

      // Initialize stats animation
      animateStats()

      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault()
          const target = document.querySelector(this.getAttribute('href'))
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      })

      // Add parallax effect
      const parallaxElements = document.querySelectorAll('.parallax')
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset
        parallaxElements.forEach(el => {
          const speed = el.getAttribute('data-speed') || '0.5'
          const yPos = -(scrolled * parseFloat(speed))
          el.style.transform = `translateY(${yPos}px)`
        })
      })

      // Cleanup
      return () => {
        animatedElements.forEach(el => animateOnScroll.unobserve(el))
      }
    }

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initAnimations, 100)
    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}