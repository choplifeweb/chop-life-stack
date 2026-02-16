import * as React from "react"
import { format, isSameDay, startOfDay } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showTime?: boolean
  dateFormat?: string
  timeFormat?: "12h" | "24h"
  minDate?: Date
  maxDate?: Date
}

function DateTimePicker({
  value,
  onChange,
  disabled = false,
  className,
  showTime = true,
  dateFormat = "EEE, MMM d",
  timeFormat = "12h",
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [dateOpen, setDateOpen] = React.useState(false)
  const [timeOpen, setTimeOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    setSelectedDate(value)
  }, [value])

  const hours = timeFormat === "24h"
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // 5-minute intervals

  // Check if a time option should be disabled based on minDate/maxDate constraints
  // Uses <= for minDate to ensure selected time is strictly after minDate
  const isTimeDisabled = (testDate: Date): boolean => {
    if (minDate && testDate <= minDate) return true
    if (maxDate && testDate > maxDate) return true
    return false
  }

  // Check if we're on the same day as min/max date (for time restrictions)
  const shouldRestrictTime = (selectedDate && minDate && isSameDay(selectedDate, minDate)) ||
    (selectedDate && maxDate && isSameDay(selectedDate, maxDate))

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const newDate = new Date(date)
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours())
      newDate.setMinutes(selectedDate.getMinutes())
    }

    // If the new date with current time is before or equal to minDate, adjust to minDate's time + 5 minutes
    if (minDate && newDate <= minDate) {
      newDate.setHours(minDate.getHours())
      // Add 5 minutes to ensure it's after minDate, rounded to next 5-minute interval
      const minMinutes = minDate.getMinutes()
      const nextInterval = Math.ceil((minMinutes + 1) / 5) * 5
      if (nextInterval >= 60) {
        newDate.setHours(minDate.getHours() + 1)
        newDate.setMinutes(0)
      } else {
        newDate.setMinutes(nextInterval)
      }
    }

    // If the new date with current time is after maxDate, adjust to maxDate's time
    if (maxDate && newDate > maxDate) {
      newDate.setHours(maxDate.getHours())
      newDate.setMinutes(maxDate.getMinutes())
    }

    setSelectedDate(newDate)
    onChange?.(newDate)
    setDateOpen(false)
  }

  const handleTimeChange = (type: "hour" | "minute" | "ampm", val: string) => {
    const date = selectedDate ? new Date(selectedDate) : new Date()

    if (type === "hour") {
      const hour = parseInt(val, 10)
      if (timeFormat === "12h") {
        const isPM = date.getHours() >= 12
        date.setHours(isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour))
      } else {
        date.setHours(hour)
      }
    } else if (type === "minute") {
      date.setMinutes(parseInt(val, 10))
    } else if (type === "ampm") {
      const currentHour = date.getHours()
      if (val === "PM" && currentHour < 12) {
        date.setHours(currentHour + 12)
      } else if (val === "AM" && currentHour >= 12) {
        date.setHours(currentHour - 12)
      }
    }

    // Don't allow selecting time outside of min/max bounds
    if (isTimeDisabled(date)) return

    setSelectedDate(date)
    onChange?.(date)
  }

  // Helper to check if a specific hour is disabled
  const isHourDisabled = (hour: number): boolean => {
    if (!selectedDate) return false
    const testDate = new Date(selectedDate)
    if (timeFormat === "12h") {
      const isPM = testDate.getHours() >= 12
      testDate.setHours(isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour))
    } else {
      testDate.setHours(hour)
    }
    // Set minutes to 0 to check if the hour itself is valid
    testDate.setMinutes(0)
    return isTimeDisabled(testDate)
  }

  // Helper to check if a specific minute is disabled
  const isMinuteDisabled = (minute: number): boolean => {
    if (!selectedDate) return false
    const testDate = new Date(selectedDate)
    testDate.setMinutes(minute)
    // Use <= comparison to ensure end time is strictly after minDate
    if (minDate && testDate <= minDate) return true
    if (maxDate && testDate > maxDate) return true
    return false
  }

  // Helper to check if AM/PM is disabled
  const isAmPmDisabled = (ampm: "AM" | "PM"): boolean => {
    if (!selectedDate) return false
    const testDate = new Date(selectedDate)
    const currentHour = testDate.getHours()
    if (ampm === "PM" && currentHour < 12) {
      testDate.setHours(currentHour + 12)
    } else if (ampm === "AM" && currentHour >= 12) {
      testDate.setHours(currentHour - 12)
    }
    return isTimeDisabled(testDate)
  }

  const getDisplayHour = () => {
    if (!selectedDate) return timeFormat === "12h" ? 12 : 0
    const hour = selectedDate.getHours()
    if (timeFormat === "24h") return hour
    if (hour === 0) return 12
    if (hour > 12) return hour - 12
    return hour
  }

  const getAmPm = () => {
    if (!selectedDate) return "AM"
    return selectedDate.getHours() >= 12 ? "PM" : "AM"
  }

  const formatDateDisplay = () => {
    if (!selectedDate) return "Select date"
    return format(selectedDate, dateFormat)
  }

  const formatTimeDisplay = () => {
    if (!selectedDate) return "Select time"
    return format(selectedDate, timeFormat === "12h" ? "h:mm a" : "HH:mm")
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Date Picker */}
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-md transition-colors"
          >
            <CalendarIcon className="h-4 w-4 opacity-70" />
            <span>{formatDateDisplay()}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            autoFocus
            captionLayout="dropdown"
            startMonth={new Date(new Date().getFullYear(), 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            disabled={(date) => {
              if (minDate && date < startOfDay(minDate)) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
          />
        </PopoverContent>
      </Popover>

      {/* Time Picker */}
      {showTime && (
        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-md transition-colors"
            >
              <Clock className="h-4 w-4 opacity-70" />
              <span>{formatTimeDisplay()}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex gap-2">
              {/* Hours */}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-2 text-center">Hour</span>
                <ScrollArea className="h-48 w-12">
                  <div className="flex flex-col gap-0.5">
                    {hours.map((hour) => {
                      const hourDisabled = shouldRestrictTime && isHourDisabled(hour)
                      return (
                        <Button
                          key={hour}
                          variant={getDisplayHour() === hour ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full h-8 justify-center text-xs",
                            hourDisabled && "opacity-30 cursor-not-allowed"
                          )}
                          onClick={() => !hourDisabled && handleTimeChange("hour", String(hour))}
                          disabled={hourDisabled}
                        >
                          {hour.toString().padStart(2, "0")}
                        </Button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Minutes */}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground mb-2 text-center">Min</span>
                <ScrollArea className="h-48 w-12">
                  <div className="flex flex-col gap-0.5">
                    {minutes.map((minute) => {
                      const minuteDisabled = shouldRestrictTime && isMinuteDisabled(minute)
                      return (
                        <Button
                          key={minute}
                          variant={
                            selectedDate && Math.floor(selectedDate.getMinutes() / 5) * 5 === minute
                              ? "default"
                              : "ghost"
                          }
                          size="sm"
                          className={cn(
                            "w-full h-8 justify-center text-xs",
                            minuteDisabled && "opacity-30 cursor-not-allowed"
                          )}
                          onClick={() => !minuteDisabled && handleTimeChange("minute", String(minute))}
                          disabled={minuteDisabled}
                        >
                          {minute.toString().padStart(2, "0")}
                        </Button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* AM/PM */}
              {timeFormat === "12h" && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-2 text-center">&nbsp;</span>
                  <div className="flex flex-col gap-1">
                    {(["AM", "PM"] as const).map((ampm) => {
                      const ampmDisabled = shouldRestrictTime && isAmPmDisabled(ampm)
                      return (
                        <Button
                          key={ampm}
                          variant={getAmPm() === ampm ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-12 h-8 text-xs",
                            ampmDisabled && "opacity-30 cursor-not-allowed"
                          )}
                          onClick={() => !ampmDisabled && handleTimeChange("ampm", ampm)}
                          disabled={ampmDisabled}
                        >
                          {ampm}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export { DateTimePicker }
export type { DateTimePickerProps }
