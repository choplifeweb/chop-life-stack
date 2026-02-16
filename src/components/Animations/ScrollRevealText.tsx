import { motion } from "framer-motion"

export interface TextEntry {
  text: string
  year?: string
  highlight?: boolean
}

interface ScrollRevealTextProps {
  entries: TextEntry[]
  className?: string
}

interface TextLineProps {
  entry: TextEntry
}

function TextLine({ entry }: TextLineProps) {
  return (
    <motion.div
      className="scroll-reveal__line"
      initial={{ opacity: 0.3 }}
      whileHover={{
        opacity: 1,
        scale: 1.05,
        x: 10,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {entry.year && (
        <motion.span className="scroll-reveal__year">{entry.year}</motion.span>
      )}
      <motion.span
        className={`scroll-reveal__text ${entry.highlight ? "scroll-reveal__text--highlight" : ""}`}
      >
        {entry.text}
      </motion.span>
    </motion.div>
  )
}

export function ScrollRevealText({ entries, className = "" }: ScrollRevealTextProps) {
  return (
    <section className={`scroll-reveal ${className}`}>
      <div className="scroll-reveal__container">
        <div className="scroll-reveal__content">
          {entries.map((entry, index) => (
            <TextLine key={index} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  )
}
