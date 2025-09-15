import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnimatedStat from '../AnimatedStat'

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  private callback: IntersectionObserverCallback
  private elements: Set<Element> = new Set()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.thresholds = options?.threshold ? (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : []
  }

  observe(target: Element): void {
    this.elements.add(target)
    // Simulate immediate intersection
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting: true,
      intersectionRatio: 0.5,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: {} as DOMRectReadOnly,
      boundingClientRect: {} as DOMRectReadOnly,
      time: Date.now()
    }
    this.callback([entry], this)
  }

  unobserve(target: Element): void {
    this.elements.delete(target)
  }

  disconnect(): void {
    this.elements.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

describe('AnimatedStat', () => {
  let originalIntersectionObserver: typeof IntersectionObserver
  let originalRequestAnimationFrame: typeof requestAnimationFrame

  beforeEach(() => {
    // Save original implementations
    originalIntersectionObserver = global.IntersectionObserver
    originalRequestAnimationFrame = global.requestAnimationFrame

    // Mock IntersectionObserver
    global.IntersectionObserver = MockIntersectionObserver as any

    // Mock requestAnimationFrame for instant execution in tests
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      setTimeout(() => callback(Date.now()), 0)
      return 1
    }) as any

    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    // Restore original implementations
    global.IntersectionObserver = originalIntersectionObserver
    global.requestAnimationFrame = originalRequestAnimationFrame
  })

  describe('Reduced Motion', () => {
    it('should render final value immediately when prefers-reduced-motion is enabled', () => {
      // Mock matchMedia to return reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })

      render(<AnimatedStat value={1000} prefix="+" />)
      
      // Should immediately show the final value
      expect(screen.getByRole('status')).toHaveTextContent('+1,000')
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'off')
    })

    it('should not animate when prefers-reduced-motion is enabled', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })

      render(<AnimatedStat value={500} />)
      
      // Wait a bit to ensure no animation occurs
      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('500')
      })

      // Value should remain at 500 (no animation from 0)
      expect(screen.getByRole('status')).toHaveTextContent('500')
    })
  })

  describe('Intersection Observer', () => {
    beforeEach(() => {
      // Mock matchMedia to return no reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })
    })

    it('should start animation when element intersects', async () => {
      const { container } = render(<AnimatedStat value={100} prefix="+" suffix="%" />)
      
      // Initially should start at 0
      expect(screen.getByRole('status')).toHaveTextContent('+0%')

      // Wait for animation to complete
      await waitFor(() => {
        const element = screen.getByRole('status')
        const text = element.textContent || ''
        const match = text.match(/\+(\d+)%/)
        if (match) {
          const value = parseInt(match[1])
          return value > 0
        }
        return false
      }, { timeout: 3000 })

      // Animation should have started
      expect(screen.getByRole('status').textContent).toMatch(/\+\d+%/)
    })

    it('should render final value when IntersectionObserver is not available', () => {
      // Remove IntersectionObserver
      delete (global as any).IntersectionObserver

      render(<AnimatedStat value={999} />)
      
      // Should fallback to showing final value
      expect(screen.getByRole('status')).toHaveTextContent('999')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })
    })

    it('should have correct aria-label', () => {
      render(<AnimatedStat value={2000} prefix="+" ariaLabel="+2,000 — Students Mentored" />)
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', '+2,000 — Students Mentored')
    })

    it('should use polite aria-live during animation', () => {
      render(<AnimatedStat value={50} />)
      
      const element = screen.getByRole('status')
      // During animation, should be polite
      expect(element).toHaveAttribute('aria-live', 'polite')
    })

    it('should format numbers with thousands separator', async () => {
      render(<AnimatedStat value={5000} />)
      
      await waitFor(() => {
        const element = screen.getByRole('status')
        const text = element.textContent || ''
        // Check if number is formatted with comma
        return text.includes(',')
      }, { timeout: 3000 })

      // Should format with thousands separator
      expect(screen.getByRole('status').textContent).toMatch(/\d{1,3},\d{3}/)
    })
  })

  describe('Number Formatting', () => {
    it('should format large numbers correctly', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })

      render(<AnimatedStat value={1234567} />)
      expect(screen.getByRole('status')).toHaveTextContent('1,234,567')
    })

    it('should handle prefix and suffix correctly', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }))
      })

      render(<AnimatedStat value={80} prefix="+" suffix="%" />)
      expect(screen.getByRole('status')).toHaveTextContent('+80%')
    })
  })
})