import { useCallback, useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from "react-leaflet"
import { Icon, type Map as LeafletMap } from "leaflet"
import { ExternalLink, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"

// Fix for default marker icon in react-leaflet
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Component to expose map instance
function MapController({ onMapReady }: { onMapReady: (map: LeafletMap) => void }) {
  const map = useMap()
  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])
  return null
}

interface LocationMapProps {
  location: string
  venueName: string
  latitude?: number | null
  longitude?: number | null
}

export function LocationMap({ location, venueName, latitude, longitude }: LocationMapProps) {
  const hasCoordinates = latitude != null && longitude != null
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null)

  // Open location in Google Maps
  const openInGoogleMaps = useCallback(() => {
    if (hasCoordinates) {
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }, [hasCoordinates, latitude, longitude])

  // Center map to marker position
  const centerToMarker = useCallback(() => {
    if (mapInstance && hasCoordinates) {
      mapInstance.setView([latitude, longitude], mapInstance.getZoom(), {
        animate: true,
        duration: 0.5,
      })
    }
  }, [mapInstance, hasCoordinates, latitude, longitude])

  return (
    <div className="event-details__location space-y-6">
      <div className="location-map__container rounded-2xl border border-white/10 h-64 relative">
        {hasCoordinates ? (
          <>
            <MapContainer
              center={[latitude, longitude]}
              zoom={15}
              className="location-map__map h-full w-full"
              scrollWheelZoom={true}
              zoomControl={false}
              doubleClickZoom={true}
              dragging={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]} icon={defaultIcon} />
              <ZoomControl position="topright" />
              <MapController onMapReady={setMapInstance} />
            </MapContainer>

            {/* Map action buttons */}
            <div className="location-map__actions">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={centerToMarker}
                className="location-map__action-btn"
                title="Center to marker"
              >
                <Crosshair size={14} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={openInGoogleMaps}
                className="location-map__action-btn"
                title="Open in Google Maps"
              >
                <ExternalLink size={14} />
              </Button>
            </div>
          </>
        ) : (
          // Fallback placeholder when no coordinates
          <div className="w-full h-full bg-muted/20 flex items-center justify-center grayscale contrast-125 opacity-70">
            <img
              src="https://picsum.photos/seed/map/1200/400"
              alt="Map location"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-500/30 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold">{venueName || "Location"}</h3>
        <p className="text-white/60">{location || "Location to be announced"}</p>
      </div>
    </div>
  )
}

export default LocationMap
