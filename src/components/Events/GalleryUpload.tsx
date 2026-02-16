import { X } from "lucide-react"
import type { GalleryImage } from "@/types/event"

interface GalleryUploadProps {
  existingImages: GalleryImage[] // Existing images from API
  newImageUrls: string[] // Preview URLs for newly uploaded files
  newFiles: File[] // Actual new files for upload
  onChange: (
    existingImages: GalleryImage[],
    newImageUrls: string[],
    newFiles: File[]
  ) => void
  maxImages?: number
}

export function GalleryUpload({
  existingImages,
  newImageUrls,
  newFiles,
  onChange,
  maxImages = 5,
}: GalleryUploadProps) {
  const totalImages = existingImages.length + newImageUrls.length

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && totalImages < maxImages) {
      const url = URL.createObjectURL(file)
      onChange(
        existingImages,
        [...newImageUrls, url],
        [...newFiles, file]
      )
    }
    // Reset input so same file can be selected again
    e.target.value = ""
  }

  const handleRemoveExisting = (imageId: string) => {
    const updatedExisting = existingImages.filter((img) => img.id !== imageId)
    onChange(updatedExisting, newImageUrls, newFiles)
  }

  const handleRemoveNew = (index: number) => {
    const updatedUrls = newImageUrls.filter((_, i) => i !== index)
    const updatedFiles = newFiles.filter((_, i) => i !== index)
    onChange(existingImages, updatedUrls, updatedFiles)
  }

  // Create array of slots
  const slots = Array.from({ length: maxImages }, (_, i) => i)

  return (
    <div className="event-form__gallery-slots">
      {slots.map((slotIndex) => {
        // First slots are for existing images
        if (slotIndex < existingImages.length) {
          const img = existingImages[slotIndex]
          return (
            <div key={`existing-${img.id}`} className="event-form__gallery-slot">
              <div className="event-form__gallery-image-wrapper">
                <img
                  src={img.imageUrl}
                  alt={`Gallery ${slotIndex + 1}`}
                  className="event-form__gallery-image"
                />
                <button
                  type="button"
                  className="event-form__gallery-remove"
                  onClick={() => handleRemoveExisting(img.id)}
                  aria-label={`Remove image ${slotIndex + 1}`}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )
        }

        // Next slots are for new images
        const newIndex = slotIndex - existingImages.length
        if (newIndex < newImageUrls.length) {
          return (
            <div key={`new-${newIndex}`} className="event-form__gallery-slot">
              <div className="event-form__gallery-image-wrapper">
                <img
                  src={newImageUrls[newIndex]}
                  alt={`Gallery ${slotIndex + 1}`}
                  className="event-form__gallery-image"
                />
                <button
                  type="button"
                  className="event-form__gallery-remove"
                  onClick={() => handleRemoveNew(newIndex)}
                  aria-label={`Remove image ${slotIndex + 1}`}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )
        }

        // Empty slot - show upload button
        return (
          <div key={`empty-${slotIndex}`} className="event-form__gallery-slot">
            <label className="event-form__gallery-upload-label">
              <span className="text-muted-foreground text-sm font-medium">
                {slotIndex + 1}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="event-form__hidden-input"
              />
            </label>
          </div>
        )
      })}
    </div>
  )
}
