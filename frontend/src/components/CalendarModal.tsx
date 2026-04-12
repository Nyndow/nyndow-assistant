import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './CalendarModal.css'

type CalendarModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect?: (date: Date) => void
  selectedDate?: Date | null
}

type CalendarCell = {
  date: Date
  inMonth: boolean
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const CalendarModal = ({ isOpen, onClose, onSelect, selectedDate = null }: CalendarModalProps) => {
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate ?? new Date())
  const [draftDate, setDraftDate] = useState<Date | null>(selectedDate)
  const [timeValue, setTimeValue] = useState<string>(() => {
    const base = selectedDate ?? new Date()
    return `${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`
  })

  useEffect(() => {
    if (!isOpen) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
    const daysInMonth = endOfMonth.getDate()

    const mondayIndex = (startOfMonth.getDay() + 6) % 7
    const totalCells = 42

    const cells: CalendarCell[] = []

    for (let i = 0; i < totalCells; i += 1) {
      const dayOffset = i - mondayIndex + 1
      const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayOffset)
      const inMonth = dayOffset >= 1 && dayOffset <= daysInMonth
      cells.push({ date: cellDate, inMonth })
    }

    return cells
  }, [viewDate])

  if (!isOpen) return null

  const monthLabel = viewDate.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const today = new Date()

  const applyTimeToDate = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const updated = new Date(date)
    updated.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0)
    return updated
  }

  const handleSelect = (date: Date) => {
    setDraftDate(date)
  }

  const handleConfirm = () => {
    if (!draftDate) return
    onSelect?.(applyTimeToDate(draftDate, timeValue))
  }

  return (
    <button
      type="button"
      className="calendar-overlay"
      onClick={onClose}
      aria-label="Close calendar"
    >
      <div className="calendar-shell" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header className="calendar-header">
          <div className="calendar-title">
            <div className="calendar-title-icon">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="calendar-kicker">Schedule</p>
              <h2>{monthLabel}</h2>
            </div>
          </div>

          <div className="calendar-actions">
            <button
              type="button"
              className="calendar-nav"
              aria-label="Previous month"
              onClick={() =>
                setViewDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="calendar-nav"
              aria-label="Next month"
              onClick={() =>
                setViewDate(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
            >
              <ChevronRight size={18} />
            </button>
            <button type="button" className="calendar-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarCells.map((cell) => {
            const isToday = isSameDay(cell.date, today)
            const isSelected = draftDate ? isSameDay(cell.date, draftDate) : false

            return (
              <button
                type="button"
                key={cell.date.toISOString()}
                className={`calendar-day${cell.inMonth ? '' : ' is-outside'}${
                  isToday ? ' is-today' : ''
                }${isSelected ? ' is-selected' : ''}`}
                onClick={() => handleSelect(cell.date)}
              >
                <span>{cell.date.getDate()}</span>
              </button>
            )
          })}
        </div>

        <div className="calendar-footer">
          <div className="calendar-footer-row">
            <button
              type="button"
              className="calendar-today"
              onClick={() => setViewDate(new Date())}
            >
              Jump to today
            </button>

            <button
              type="button"
              className="calendar-now"
              onClick={() => {
                const now = new Date()
                setTimeValue(
                  `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                )
              }}
            >
              Use current time
            </button>
          </div>

          <div className="calendar-time">
            <label htmlFor="calendar-time-input">Time</label>
            <input
              id="calendar-time-input"
              type="time"
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
            />
            <button
              type="button"
              className="calendar-confirm"
              disabled={!draftDate}
              onClick={handleConfirm}
            >
              Set date & time
            </button>
          </div>

          <div className="calendar-selected">
            {draftDate
              ? `Selected: ${draftDate.toLocaleDateString()} at ${timeValue}`
              : 'Pick a day and time to set a reminder.'}
          </div>
        </div>
      </div>
    </button>
  )
}

export default CalendarModal