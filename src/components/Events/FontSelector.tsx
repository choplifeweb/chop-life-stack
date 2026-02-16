import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Available font options
const defaultFonts = [
  "Default",
  "Serif",
  "Sans Serif",
  "Monospace",
  "Display",
  "Handwriting",
]

interface FontSelectorProps {
  value: string
  onChange: (font: string) => void
  fonts?: string[]
  className?: string
}

export function FontSelector({
  value,
  onChange,
  fonts = defaultFonts,
  className = "event-form__font-select",
}: FontSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {fonts.map((font) => (
          <SelectItem key={font} value={font}>
            {font}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
