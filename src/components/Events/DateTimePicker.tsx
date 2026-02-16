import { Info } from "lucide-react"

interface DateTimePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  showInfo?: boolean
  timezone?: string
}

export function DateTimePicker({
  label,
  value,
  onChange,
  showInfo = false,
  timezone,
}: DateTimePickerProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getTimezoneAbbr = () => {
    if (timezone) return timezone
    const offset = new Date().getTimezoneOffset()
    const hours = Math.abs(Math.floor(offset / 60))
    const sign = offset <= 0 ? "+" : "-"
    return `GMT ${sign}${hours}`
  }

  const handleDateChange = (newDate: string) => {
    const time = value.slice(11, 16)
    onChange(`${newDate}T${time}`)
  }

  const handleTimeChange = (newTime: string) => {
    const date = value.slice(0, 10)
    onChange(`${date}T${newTime}`)
  }

  return (
    <div className="event-form__datetime-row">
      <span className="event-form__datetime-label flex items-center gap-2">
        {label}
        {showInfo && <Info size={14} className="text-muted-foreground" />}
      </span>
      <div className="flex items-center gap-3 ml-auto">
        <span className="event-form__timezone-badge">{getTimezoneAbbr()}</span>
        <label className="event-form__date-btn">
          {formatDate(value)}
          <input
            type="date"
            value={value.slice(0, 10)}
            onChange={(e) => handleDateChange(e.target.value)}
            className="event-form__hidden-input"
          />
        </label>
        <label className="event-form__time-btn">
          {formatTime(value)}
          <input
            type="time"
            value={value.slice(11, 16)}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="event-form__hidden-input"
          />
        </label>
      </div>
    </div>
  )
}
