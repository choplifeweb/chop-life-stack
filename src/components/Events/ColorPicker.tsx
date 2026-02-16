import { useState, useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"

// Predefined color palette
const defaultColors = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  colors?: string[]
  label?: string
}

export function ColorPicker({
  value,
  onChange,
  colors = defaultColors,
  label = "Custom",
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleColorSelect = (color: string) => {
    onChange(color)
    setIsOpen(false)
  }

  return (
    <div className="event-form__color-picker-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="event-form__color-preview"
        style={{ backgroundColor: value }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select color"
      />
      {isOpen && (
        <div className="event-form__color-dropdown">
          <div className="event-form__color-palette">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`event-form__color-swatch ${value === color ? "event-form__color-swatch--selected" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
          <div className="event-form__color-custom">
            <Label className="text-xs">{label}</Label>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="event-form__color-input"
            />
          </div>
        </div>
      )}
    </div>
  )
}
