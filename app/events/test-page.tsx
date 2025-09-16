'use client'

import { useState, useEffect } from 'react'

export default function TestEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('TEST: useEffect running!')
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    console.log('TEST: fetchEvents called')
    try {
      const response = await fetch('/api/events?upcoming=true')
      console.log('TEST: API response status:', response.status)

      if (response.ok) {
        const { events } = await response.json()
        console.log('TEST: API returned events:', events?.length || 0)
        setEvents(events || [])
      }
    } catch (error) {
      console.error('TEST: API call failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading events...</div>
  }

  return (
    <div>
      <h1>Test Events Page</h1>
      <p>Found {events.length} events</p>
      {events.length > 0 ? (
        <ul>
          {events.map((event: any) => (
            <li key={event.id}>
              {event.title} - {event.event_date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No events found</p>
      )}
    </div>
  )
}