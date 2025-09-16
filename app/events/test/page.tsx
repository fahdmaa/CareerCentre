'use client'

import { useState, useEffect } from 'react'

export default function TestEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?upcoming=true')
      const data = await response.json()

      if (response.ok && data.events) {
        setEvents(data.events)
      } else {
        setError('Failed to fetch events')
      }
    } catch (err) {
      setError('Error fetching events')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading events...</div>
  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: '50px' }}>
      <h1>Test Events Page</h1>
      <p>Found {events.length} events</p>

      <div style={{ marginTop: '20px' }}>
        {events.map(event => (
          <div key={event.id} style={{
            border: '1px solid #ccc',
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '8px'
          }}>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>Date: {event.event_date}</p>
            <p>Time: {event.event_time}</p>
            <p>Location: {event.location}</p>
            <p>Type: {event.event_type}</p>
            <p>Format: {event.event_format}</p>
            <p>Capacity: {event.capacity} | Spots taken: {event.spots_taken}</p>
          </div>
        ))}
      </div>

      <button
        onClick={fetchEvents}
        style={{
          padding: '10px 20px',
          backgroundColor: '#00A651',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Refresh Events
      </button>
    </div>
  )
}