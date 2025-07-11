/**
 * Utility functions for working with Google Maps API
 */

// Validate a location (ZIP code or city name) using Google Maps Geocoding API
export async function validateLocation(input: string): Promise<{
  isValid: boolean
  message: string
  components?: {
    city?: string
    state?: string
    zip?: string
    formattedAddress?: string
  }
}> {
  if (!input || input.trim().length < 2) {
    return { isValid: false, message: "Please enter a city or ZIP code" }
  }

  try {
    // Check if we have the Google Maps API loaded
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) {
      console.log("Google Maps API not loaded")
      return {
        isValid: false,
        message: "Location validation service unavailable",
      }
    }

    const geocoder = new window.google.maps.Geocoder()

    // Determine if input is likely a ZIP code
    const isZipCode = /^\d{5}$/.test(input.trim())

    // Set up the geocoding request
    const request: google.maps.GeocoderRequest = {
      address: input.trim(),
      componentRestrictions: { country: "us" },
      region: "us",
    }

    // Execute the geocoding request
    return new Promise((resolve) => {
      geocoder.geocode(request, (results, status) => {
        console.log("Geocode status:", status, "Results:", results?.length || 0)

        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const result = results[0]

          // Extract address components
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

          // For ZIP code validation
          if (isZipCode) {
            if (zip) {
              resolve({
                isValid: true,
                message: "Valid ZIP code",
                components: {
                  city,
                  state,
                  zip,
                  formattedAddress: result.formatted_address,
                },
              })
            } else {
              resolve({
                isValid: false,
                message: "Invalid ZIP code",
              })
            }
          }
          // For city name validation
          else {
            if (city) {
              resolve({
                isValid: true,
                message: "Valid city",
                components: {
                  city,
                  state,
                  zip,
                  formattedAddress: result.formatted_address,
                },
              })
            } else {
              resolve({
                isValid: false,
                message: "Invalid city name",
              })
            }
          }
        } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
          // Handle no results found
          resolve({
            isValid: false,
            message: isZipCode ? "ZIP code not found" : "City not found",
          })
        } else {
          // Handle other error statuses
          console.warn("Geocoding error:", status)
          resolve({
            isValid: false,
            message: "Could not validate location",
          })
        }
      })
    })
  } catch (error) {
    console.error("Error in validateLocation:", error)
    return {
      isValid: false,
      message: "Could not validate location",
    }
  }
}
