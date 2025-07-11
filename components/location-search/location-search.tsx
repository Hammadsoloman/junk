"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useQuote } from "@/contexts/quote-context"
import { AlertCircle, CheckCircle, Loader2, MapPin } from "lucide-react"
import { validateLocation } from "@/lib/google-maps-utils"
import AsyncSelect from "react-select/async"
import { components } from "react-select"
import { cn } from "@/lib/utils"
import { debounce } from "lodash"

interface LocationOption {
  value: string
  label: string
  address_components?: google.maps.GeocoderAddressComponent[]
  formatted_address?: string
  place_id?: string
  city?: string
  state?: string
  zip?: string
}

interface LocationSearchProps {
  placeholder?: string
  className?: string
  isDestination?: boolean
  value?: string
  onChange?: (value: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  id?: string
}

export function LocationSearch({
  placeholder = "Enter City Or ZIP Code",
  className,
  isDestination = false,
  value: externalValue,
  onChange: externalOnChange,
  onPlaceSelect: externalOnPlaceSelect,
  id,
}: LocationSearchProps) {
  const { quoteData, updateQuoteData, markStepCompleted } = useQuote()
  const [selectedOption, setSelectedOption] = useState<LocationOption | null>(null)
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null)
  const [validationMessage, setValidationMessage] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Initialize selected option from context if available
  useEffect(() => {
    if (externalValue !== undefined) {
      setSelectedOption({
        value: externalValue,
        label: externalValue,
      })
    } else if (isDestination && quoteData.destinationCity) {
      const formattedAddress =
        quoteData.destinationAddress ||
        `${quoteData.destinationCity}${quoteData.destinationState ? `, ${quoteData.destinationState}` : ""}${quoteData.destinationZip ? ` ${quoteData.destinationZip}` : ""}`

      setSelectedOption({
        value: formattedAddress,
        label: formattedAddress,
      })
      setIsValidAddress(true)
    } else if (!isDestination && quoteData.originCity) {
      const formattedAddress =
        quoteData.originAddress ||
        `${quoteData.originCity}${quoteData.originState ? `, ${quoteData.originState}` : ""}${quoteData.originZip ? ` ${quoteData.originZip}` : ""}`

      setSelectedOption({
        value: formattedAddress,
        label: formattedAddress,
      })
      setIsValidAddress(true)
    }
  }, [
    externalValue,
    isDestination,
    quoteData.destinationCity,
    quoteData.destinationState,
    quoteData.destinationZip,
    quoteData.destinationAddress,
    quoteData.originCity,
    quoteData.originState,
    quoteData.originZip,
    quoteData.originAddress,
  ])

  // Load Google Maps JavaScript API
  useEffect(() => {
    // If Google Maps is already loaded, we're good to go
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setIsGoogleLoaded(true)
      return
    }

    // If we're on the server or Google Maps is already loading, do nothing
    if (typeof window === "undefined" || document.getElementById("google-maps-script")) {
      return
    }

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
              setIsGoogleLoaded(true)
            } else {
              console.error("Google Maps API loaded but places library not available")
              setLoadError(true)
            }
          }

          script.onerror = () => {
            console.error("Failed to load Google Maps API")
            setLoadError(true)
          }

          document.head.appendChild(script)
        })
        .catch((error) => {
          console.error("Error fetching Google Maps API URL:", error)
          setLoadError(true)
        })
    } catch (error) {
      console.error("Error setting up Google Maps API:", error)
      setLoadError(true)
    }
  }, [])

  // Function to load options for AsyncSelect
  const loadOptions = useCallback(
    async (inputValue: string): Promise<LocationOption[]> => {
      if (!inputValue || inputValue.length < 2) {
        return []
      }

      if (!isGoogleLoaded || !window.google?.maps?.Geocoder) {
        console.log("Google Maps API not loaded yet")
        return [
          {
            value: inputValue,
            label: inputValue,
          },
        ]
      }

      try {
        const geocoder = new window.google.maps.Geocoder()
        const request: google.maps.GeocoderRequest = {
          address: inputValue,
          componentRestrictions: { country: "us" },
          region: "us",
        }

        return new Promise((resolve) => {
          geocoder.geocode(request, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const options = results.map((result) => {
                let city = ""
                let state = ""
                let zip = ""

                if (result.address_components) {
                  for (const component of result.address_components) {
                    if (component.types.includes("locality")) {
                      city = component.long_name
                    } else if (component.types.includes("administrative_area_level_1")) {
                      state = component.short_name
                    } else if (component.types.includes("postal_code")) {
                      zip = component.long_name
                    }
                  }
                }

                return {
                  value: result.formatted_address || result.name || inputValue,
                  label: result.formatted_address || result.name || inputValue,
                  address_components: result.address_components,
                  formatted_address: result.formatted_address,
                  place_id: result.place_id,
                  city,
                  state,
                  zip,
                }
              })

              resolve(options)
            } else {
              // If no results, return the input as an option
              resolve([
                {
                  value: inputValue,
                  label: inputValue,
                },
              ])
            }
          })
        })
      } catch (error) {
        console.error("Error loading options:", error)
        return [
          {
            value: inputValue,
            label: inputValue,
          },
        ]
      }
    },
    [isGoogleLoaded],
  )

  // Debounced version of loadOptions to prevent too many API calls
  const debouncedLoadOptions = useCallback(
    debounce((inputValue: string, callback: (options: LocationOption[]) => void) => {
      loadOptions(inputValue).then(callback)
    }, 350),
    [loadOptions],
  )

  // Handle selection change
  const handleChange = async (option: LocationOption | null) => {
    setSelectedOption(option)

    if (!option) {
      setIsValidAddress(null)
      setValidationMessage("")

      if (externalOnChange) {
        externalOnChange("")
      }
      return
    }

    // If the option has address components, it came from Google Places
    if (option.address_components) {
      setIsValidAddress(true)
      setValidationMessage("")

      // Create a place-like object to maintain compatibility
      const placeResult: Partial<google.maps.places.PlaceResult> = {
        formatted_address: option.formatted_address,
        name: option.label,
        address_components: option.address_components,
        place_id: option.place_id,
      }

      // Update the quote context
      updateLocationData(option)

      // Call external handlers
      if (externalOnChange) {
        externalOnChange(option.value)
      }

      if (externalOnPlaceSelect) {
        externalOnPlaceSelect(placeResult as google.maps.places.PlaceResult)
      }
    } else {
      // If the option doesn't have address components, validate it
      setIsValidating(true)
      setIsValidAddress(null)
      setValidationMessage("Validating location...")

      try {
        const validationResult = await validateLocation(option.value)

        setIsValidAddress(validationResult.isValid)
        setValidationMessage(validationResult.message)

        if (validationResult.isValid && validationResult.components) {
          const { city, state, zip, formattedAddress } = validationResult.components

          // Update the option with the validated data
          const validatedOption: LocationOption = {
            ...option,
            city,
            state,
            zip,
            formatted_address: formattedAddress,
          }

          setSelectedOption(validatedOption)

          // Update the quote context
          updateLocationData(validatedOption)

          // Call external handlers
          if (externalOnChange) {
            externalOnChange(formattedAddress || option.value)
          }
        }
      } catch (error) {
        console.error("Error validating location:", error)
        setIsValidAddress(false)
        setValidationMessage("Could not validate location. Please try again.")
      } finally {
        setIsValidating(false)
      }
    }
  }

  // Helper function to update location data in the quote context
  const updateLocationData = (option: LocationOption) => {
    const updateData: Partial<typeof quoteData> = {}

    // If we have a formatted address, use it
    if (option.formatted_address) {
      updateData[isDestination ? "destinationAddress" : "originAddress"] = option.formatted_address
    }

    // If we have city, state, zip, use them
    if (option.city) {
      updateData[isDestination ? "destinationCity" : "originCity"] = option.city
    }

    if (option.state) {
      updateData[isDestination ? "destinationState" : "originState"] = option.state
    }

    if (option.zip) {
      updateData[isDestination ? "destinationZip" : "originZip"] = option.zip
    }

    // If we don't have city but have a formatted address, try to extract city
    if (!option.city && option.formatted_address) {
      const parts = option.formatted_address.split(",").map((part) => part.trim())
      if (parts.length >= 2) {
        // Assume the second-to-last part is the city (in "Street, City, State ZIP" format)
        const cityPart = parts[parts.length - 2]
        // Remove state code if it exists in the city part
        const cityName = cityPart.replace(/\s[A-Z]{2}$/, "").trim()

        if (cityName) {
          updateData[isDestination ? "destinationCity" : "originCity"] = cityName
        }
      }
    }

    console.log("LocationSearch - Updating quote data with:", updateData)
    updateQuoteData(updateData)

    // Mark location step as completed if we have any location data
    if (option.formatted_address || option.city || option.zip) {
      markStepCompleted("location")
    }
  }

  // Custom styles for react-select
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "48px",
      borderColor:
        isValidAddress === true
          ? "#22c55e"
          : isValidAddress === false
            ? "#ef4444"
            : state.isFocused
              ? "#064c3b"
              : "#e5e7eb",
      boxShadow: state.isFocused
        ? isValidAddress === true
          ? "0 0 0 1px #22c55e"
          : isValidAddress === false
            ? "0 0 0 1px #ef4444"
            : "0 0 0 1px #064c3b"
        : "none",
      "&:hover": {
        borderColor: state.isFocused
          ? isValidAddress === true
            ? "#22c55e"
            : isValidAddress === false
              ? "#ef4444"
              : "#064c3b"
          : "#d1d5db",
      },
      paddingLeft: "36px", // Space for the icon
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    input: (base: any) => ({
      ...base,
      color: "#111827",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? "#064c3b" : state.isFocused ? "#e6f7f2" : "white",
      color: state.isSelected ? "white" : "#111827",
      "&:active": {
        backgroundColor: state.isSelected ? "#064c3b" : "#e6f7f2",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#111827",
    }),
    loadingIndicator: (base: any) => ({
      ...base,
      color: "#064c3b",
    }),
    loadingMessage: (base: any) => ({
      ...base,
      color: "#6b7280",
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: "#6b7280",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        color: "#6b7280",
      },
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        color: "#6b7280",
      },
    }),
  }

  // Custom components for react-select
  const customComponents = {
    DropdownIndicator: (props: any) => <components.DropdownIndicator {...props} />,
    Control: ({ children, ...props }: any) => (
      <components.Control {...props}>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isValidating ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <MapPin
              className={cn(
                "h-5 w-5",
                isValidAddress === true
                  ? "text-green-500"
                  : isValidAddress === false
                    ? "text-red-500"
                    : "text-gray-400",
              )}
            />
          )}
        </div>
        {children}
      </components.Control>
    ),
  }
  const isClient = useRef(false);
  useEffect(() => {
    isClient.current = true;
    
  }, []);
  if (!isClient.current) return null; // Prevent SSR mismatch
  return (
    <div className="space-y-1">
      <AsyncSelect
        id={id}
        placeholder={placeholder}
        className={className}
        value={selectedOption}
        onChange={handleChange}
        loadOptions={debouncedLoadOptions}
        isClearable
        isDisabled={isValidating || loadError}
        isLoading={isValidating}
        styles={customStyles}
        components={customComponents}
        noOptionsMessage={({ inputValue }) =>
          !inputValue
            ? "Start typing to search locations"
            : inputValue.length < 2
              ? "Type at least 2 characters"
              : "No locations found"
        }
        loadingMessage={() => "Searching locations..."}
        aria-label="Search for city or ZIP code"
        aria-required="true"
        classNamePrefix="location-select"
      />

      {/* Validation feedback */}
      {!isValidating && isValidAddress === true && selectedOption && (
        <div className="flex items-center text-green-600 text-xs mt-1">
          <CheckCircle size={12} className="mr-1" />
          <span>Valid location</span>
        </div>
      )}

      {!isValidating && isValidAddress === false && validationMessage && (
        <div className="flex items-center text-red-600 text-xs mt-1">
          <AlertCircle size={12} className="mr-1" />
          <span>{validationMessage}</span>
        </div>
      )}

      {loadError && (
        <div className="text-red-500 text-xs mt-1">
          Unable to load location search. Please enter your location manually.
        </div>
      )}
    </div>
  )
}
