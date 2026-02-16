import { HelpCircle, Eye, EyeOff } from "lucide-react"
import type { ReactNode } from "react"

interface FormSectionProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  infoIcon?: boolean
  eyeIcon?: boolean
  isVisible?: boolean
  onToggleVisibility?: () => void
  subtitle?: string
  subtitleLink?: string
  onSubtitleClick?: () => void
}

export function FormSection({
  title,
  icon,
  children,
  infoIcon,
  eyeIcon,
  isVisible = true,
  onToggleVisibility,
  subtitle,
  subtitleLink,
  onSubtitleClick,
}: FormSectionProps) {
  const EyeIcon = isVisible ? Eye : EyeOff

  return (
    <div className={`event-form__section ${!isVisible ? "event-form__section--hidden" : ""}`}>
      <div className="event-form__section-header">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-1">
          {title}
          {infoIcon && (
            <HelpCircle
              size={14}
              className="text-muted-foreground cursor-pointer"
            />
          )}
        </h3>
        <div className="flex items-center gap-4 ml-auto">
          {subtitle && (
            <span className="text-xs text-muted-foreground">
              {subtitle}{" "}
              {subtitleLink && (
                <button
                  type="button"
                  onClick={onSubtitleClick}
                  className="underline hover:text-foreground transition-colors"
                >
                  {subtitleLink}
                </button>
              )}
            </span>
          )}
          {eyeIcon && (
            <button
              type="button"
              onClick={onToggleVisibility}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title={isVisible ? "Hide section" : "Show section"}
            >
              <EyeIcon
                size={16}
                className={`cursor-pointer transition-colors ${isVisible ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/50"}`}
              />
            </button>
          )}
        </div>
      </div>
      {isVisible && <div className="event-form__section-content">{children}</div>}
    </div>
  )
}

export default FormSection
