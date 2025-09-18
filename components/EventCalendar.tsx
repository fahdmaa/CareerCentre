'use client'

import { useState } from 'react'

interface Event {
  id: number
  title: string
  event_date: string
  event_time: string
  location: string
  event_type: string
  event_format: string
  capacity: number
  spots_taken: number
}

interface EventCalendarProps {
  events: Event[]
  onEventClick: (event: Event) => void
}

export default function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventPanel, setShowEventPanel] = useState(false)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date)
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear()
    })
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    const dayEvents = getEventsForDate(clickedDate)
    if (dayEvents.length > 0) {
      setShowEventPanel(true)
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${period}`
  }

  const renderCalendarDays = () => {
    const days = []
    const today = new Date()

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      const isPast = date < today && !isToday

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {dayEvents.length > 0 && (
            <div className="event-dots">
              {dayEvents.slice(0, 3).map((_, idx) => (
                <span key={idx} className="event-dot"></span>
              ))}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <>
      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .calendar-month {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .calendar-nav {
          display: flex;
          gap: 8px;
        }

        .nav-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .nav-btn:hover {
          background: #00A651;
          border-color: #00A651;
          color: white;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #f9fafb;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .weekday {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 8px;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s;
          position: relative;
          margin: 2px;
        }

        .calendar-day:hover:not(.empty):not(.past) {
          background: #f3f4f6;
        }

        .calendar-day.today {
          background: #dcfce7;
        }

        .calendar-day.selected {
          background: #00A651;
          color: white;
        }

        .calendar-day.past {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .calendar-day.has-events:not(.selected) .day-number {
          font-weight: 700;
          color: #00A651;
        }

        .calendar-day.empty {
          cursor: default;
        }

        .day-number {
          font-size: 15px;
          margin-bottom: 4px;
        }

        .event-dots {
          display: flex;
          gap: 2px;
          position: absolute;
          bottom: 8px;
        }

        .event-dot {
          width: 4px;
          height: 4px;
          background: #00A651;
          border-radius: 50%;
        }

        .calendar-day.selected .event-dot {
          background: white;
        }

        .event-panel {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 400px;
          background: white;
          box-shadow: -4px 0 16px rgba(0,0,0,0.1);
          transform: translateX(${showEventPanel ? '0' : '100%'});
          transition: transform 0.3s ease;
          z-index: 50;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: #e5e7eb;
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .panel-event {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s;
          cursor: pointer;
        }

        .panel-event:hover {
          background: #f3f4f6;
          transform: translateX(-4px);
        }

        .panel-event-time {
          font-size: 13px;
          color: #00A651;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .panel-event-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .panel-event-location {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .panel-event-spots {
          font-size: 13px;
          font-weight: 600;
          color: #00A651;
        }

        .panel-event-spots.full {
          color: #ef4444;
        }

        .btn-rsvp-panel {
          background: #00A651;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-top: 12px;
          transition: all 0.3s;
        }

        .btn-rsvp-panel:hover {
          background: #008a43;
        }

        .no-events {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .event-panel {
            width: 100%;
          }

          .calendar-grid {
            padding: 4px;
          }

          .calendar-day {
            margin: 1px;
          }

          .day-number {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="calendar-container">
        <div className="calendar-header">
          <h3 className="calendar-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="calendar-nav">
            <button
              className="nav-btn"
              onClick={previousMonth}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="nav-btn"
              onClick={nextMonth}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>
      </div>

      <div className="event-panel">
        <div className="panel-header">
          <h3 className="panel-title">
            {selectedDate && `${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
          </h3>
          <button className="close-btn" onClick={() => setShowEventPanel(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="panel-content">
          {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map(event => {
              const spotsLeft = event.capacity - event.spots_taken
              return (
                <div key={event.id} className="panel-event" onClick={() => onEventClick(event)}>
                  <div className="panel-event-time">{formatTime(event.event_time)}</div>
                  <div className="panel-event-title">{event.title}</div>
                  <div className="panel-event-location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{event.location}</span>
                  </div>
                  <div className={`panel-event-spots ${spotsLeft <= 0 ? 'full' : ''}`}>
                    {spotsLeft <= 0 ? 'Full · Join waitlist' : `${spotsLeft} spots left`}
                  </div>
                  <button
                    className="btn-rsvp-panel"
                  >
                    {spotsLeft <= 0 ? 'Join waitlist' : 'RSVP'}
                  </button>
                </div>
              )
            })
          ) : (
            <div className="no-events">
              <i className="fas fa-calendar-times" style={{ fontSize: '32px', marginBottom: '12px', color: '#d1d5db' }}></i>
              <p>No events scheduled for this date</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}