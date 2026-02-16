import { useRef } from "react"
import { Image as ImageIcon, X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string
  onChange: (url: string, file?: File) => void
  onRemove: () => void
  placeholder?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Upload your flyer",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onChange(url, file)
    }
  }

  return (
    <div className={`event-form__flyer-upload ${className}`}>
      {value ? (
        <div className="event-form__flyer-preview">
          <img
            src={value}
            alt="Uploaded image"
            className="event-form__flyer-image"
          />
          <button
            type="button"
            className="event-form__flyer-remove"
            onClick={onRemove}
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
          <label className="event-form__flyer-change">
            <Pencil size={14} />
            Change
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="event-form__hidden-input"
            />
          </label>
        </div>
      ) : (
        <>
          <div className="event-form__flyer-bg" />
          <div className="event-form__flyer-content">
            <div className="event-form__flyer-icon">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
            <label className="event-form__flyer-btn-label">
              <Button variant="outline" className="event-form__flyer-btn" asChild>
                <span>{placeholder}</span>
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="event-form__hidden-input"
              />
            </label>
          </div>
        </>
      )}
    </div>
  )
}
