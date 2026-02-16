import { useEffect, useRef, useState, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { Icon, type Map as LeafletMap } from "leaflet"
import { MapPin, Search, X, Loader2, ExternalLink, Crosshair } from "lucide-react"
import { Input } from "@/components/ui/input"
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

interface LocationPickerProps {
  location: string
  latitude?: number
  longitude?: number
  onLocationChange: (location: string) => void
  onCoordinatesChange: (lat: number, lng: number) => void
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

// Component to handle map click events
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Component to recenter map when coordinates change
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

// Component to expose map instance via ref
function MapController({
  onMapReady,
}: {
  onMapReady: (map: LeafletMap) => void
}) {
  const map = useMap()
  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])
  return null
}

export function LocationPicker({
  location,
  latitude,
  longitude,
  onLocationChange,
  onCoordinatesChange,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Default to a central location if no coordinates provided
  const defaultLat = latitude ?? 6.5244 // Lagos, Nigeria
  const defaultLng = longitude ?? 3.3792

  const [markerPosition, setMarkerPosition] = useState<[number, number]>([
    defaultLat,
    defaultLng,
  ])
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null)

  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        )
        const data = await response.json()
        if (data.display_name) {
          onLocationChange(data.display_name)
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error)
      }
    },
    [onLocationChange]
  )

  // Handle map click
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setMarkerPosition([lat, lng])
      onCoordinatesChange(lat, lng)
      reverseGeocode(lat, lng)
    },
    [onCoordinatesChange, reverseGeocode]
  )

  // Search for locations using Nominatim
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      )
      const data: SearchResult[] = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error("Location search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value)
    }, 500)
  }

  // Select a search result
  const selectResult = (result: SearchResult) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    setMarkerPosition([lat, lng])
    onCoordinatesChange(lat, lng)
    onLocationChange(result.display_name)
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Open location in Google Maps
  const openInGoogleMaps = useCallback(() => {
    const [lat, lng] = markerPosition
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, "_blank", "noopener,noreferrer")
  }, [markerPosition])

  // Center map to marker position
  const centerToMarker = useCallback(() => {
    if (mapInstance) {
      mapInstance.setView(markerPosition, mapInstance.getZoom(), {
        animate: true,
        duration: 0.5,
      })
    }
  }, [mapInstance, markerPosition])

  return (
    <div className="location-picker">
      {/* Search Input */}
      <div className="location-picker__search" ref={resultsRef}>
        <div className="location-picker__search-input-wrapper">
          <Search size={16} className="location-picker__search-icon" />
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="location-picker__search-input"
          />
          {isSearching && (
            <Loader2 size={16} className="location-picker__loading-icon animate-spin" />
          )}
          {searchQuery && !isSearching && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSearchResults([])
                setShowResults(false)
              }}
              className="location-picker__clear-btn"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="location-picker__results">
            {searchResults.map((result, index) => (
              <button
                key={`${result.lat}-${result.lon}-${index}`}
                type="button"
                className="location-picker__result-item"
                onClick={() => selectResult(result)}
              >
                <MapPin size={14} className="location-picker__result-icon" />
                <span className="location-picker__result-text">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="location-picker__map-container">
        <MapContainer
          center={markerPosition}
          zoom={13}
          className="location-picker__map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={markerPosition} icon={defaultIcon} />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapRecenter lat={markerPosition[0]} lng={markerPosition[1]} />
          <MapController onMapReady={setMapInstance} />
        </MapContainer>

        {/* Map action buttons */}
        <div className="location-picker__map-actions">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={centerToMarker}
            className="location-picker__action-btn"
            title="Center to marker"
          >
            <Crosshair size={14} />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openInGoogleMaps}
            className="location-picker__action-btn"
            title="Open in Google Maps"
          >
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>

      {/* Selected Location Display */}
      {location && (
        <div className="location-picker__selected">
          <MapPin size={14} className="text-muted-foreground" />
          <span className="location-picker__selected-text">{location}</span>
        </div>
      )}

      {/* Coordinates Display */}
      {latitude && longitude && (
        <div className="location-picker__coordinates">
          <span className="text-xs text-muted-foreground">
            Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  )
}

export default LocationPicker
