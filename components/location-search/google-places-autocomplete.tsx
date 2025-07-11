"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface GooglePlacesAutocompleteProps {
  placeholder?: string
  className?: string
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
  disabled?: boolean
  id?: string
  onBlur?: () => void
  isValid?: boolean | null
}

declare global {
  interface Window {
    google?: any
  }
}

export function GooglePlacesAutocomplete({
  placeholder = "Enter City Or ZIP Code",
  className,
  value,
  onChange,
  onPlaceSelect,
  disabled = false,
  id,
  onBlur,
  isValid = null,
}: GooglePlacesAutocompleteProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Load Google Maps JavaScript API
  useEffect(() => {
    // If Google Maps is already loaded, we're good to go
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setIsLoaded(true)
      return
    }

    // If we're on the server or Google Maps is already loading, do nothing
    if (typeof window === "undefined" || document.getElementById("google-maps-script")) {
      return
    }

    setIsLoading(true)

    // Simple approach: load the script and set up a basic error handler
    try {
      fetch("/api/maps-loader")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load Google Maps API: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          const script = document.createElement("script")
          script.id = "google-maps-script"
          script.src = data.scriptUrl
          script.async = true
          script.defer = true

          script.onload = () => {
            // Check if Google Maps is actually loaded
            if (window.google?.maps?.places) {
              setIsLoaded(true)
              setIsLoading(false)
            } else {
              console.error("Google Maps API loaded but places library not available")
              setLoadError(true)
              setIsLoading(false)
            }
          }

          script.onerror = () => {
            console.error("Failed to load Google Maps API")
            setLoadError(true)
            setIsLoading(false)
          }

          document.head.appendChild(script)
        })
        .catch((error) => {
          console.error("Error fetching Google Maps API URL:", error)
          setLoadError(true)
          setIsLoading(false)
        })
    } catch (error) {
      console.error("Error setting up Google Maps API:", error)
      setLoadError(true)
      setIsLoading(false)
    }
  }, [])

  // Initialize autocomplete when the API is loaded and the input is available
  useEffect(() => {
    // Only proceed if everything is ready
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) {
      return
    }

    try {
      // Create the autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["geocode"], // Use only 'geocode' which includes addresses, cities, etc.
      })

      // Add listener for place selection
      const listener = autocompleteRef.current.addListener("place_changed", () => {
        try {
          if (!autocompleteRef.current) return

          const place = autocompleteRef.current.getPlace()

          if (place) {
            // Call the onPlaceSelect callback
            onPlaceSelect(place)

            // Update the input value
            if (place.formatted_address) {
              onChange(place.formatted_address)
            } else if (place.name) {
              onChange(place.name)
            }
          }
        } catch (error) {
          console.error("Error handling place selection:", error)
        }
      })

      return () => {
        // Clean up listener when component unmounts
        if (window.google?.maps?.event && listener) {
          window.google.maps.event.removeListener(listener)
        }
      }
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error)
    }
  }, [isLoaded, onPlaceSelect, onChange])

  const handleClear = () => {
    onChange("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleBlur = () => {
    // Use a small timeout to allow click events on autocomplete suggestions to complete
    setTimeout(() => {
      if (onBlur) {
        onBlur()
      }
    }, 150)
  }

  // Determine border color based on validation state
  const getBorderClass = () => {
    if (isValid === true) return "border-green-500 focus:border-green-500 focus:ring-green-500"
    if (isValid === false) return "border-red-500 focus:border-red-500 focus:ring-red-500"
    return "border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b]"
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn("pl-10 pr-10 h-12 rounded-md", getBorderClass())}
          disabled={disabled || isLoading || loadError}
          aria-label="Search for city or ZIP code"
          aria-required="true"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <MapPin
              className={cn(
                "h-5 w-5",
                isValid === true ? "text-green-500" : isValid === false ? "text-red-500" : "text-gray-400",
              )}
            />
          )}
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear input"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {loadError && (
        <div className="text-red-500 text-xs mt-1">
          Unable to load location search. Please enter your location manually.
        </div>
      )}
    </div>
  )
}
