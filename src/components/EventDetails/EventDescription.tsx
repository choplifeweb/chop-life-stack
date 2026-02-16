import { useState } from "react"

interface EventDescriptionProps {
  description: string
}

export function EventDescription({ description }: EventDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if description is long enough to need expand/collapse
  const needsExpansion = description.length > 300

  return (
    <div className="event-details__description space-y-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">
        About this event
      </h2>

      <div
        className={`text-white/90 leading-relaxed transition-all duration-300 ${
          !isExpanded && needsExpansion
            ? "max-h-[300px] overflow-hidden relative"
            : ""
        }`}
      >
        <div
          className="prose prose-invert max-w-none whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {!isExpanded && needsExpansion && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d12]/80 via-[#0d0d12]/40 to-transparent" />
        )}
      </div>

      {needsExpansion && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/60 text-sm font-bold hover:text-white transition-colors"
        >
          {isExpanded ? "View less" : "View more"}
        </button>
      )}
    </div>
  )
}

export default EventDescription
