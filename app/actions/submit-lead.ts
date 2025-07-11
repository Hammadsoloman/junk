"use server"

import type { QuoteData } from "@/contexts/quote-context"

// Define the SmartMoving Lead API request type based on their documentation
type SmartMovingLeadRequest = {
  firstName?: string
  lastName?: string
  fullName?: string
  phoneNumber?: string
  extension?: string
  userOptIn?: string
  email?: string
  moveDate?: string
  leadCost?: number
  originStreet?: string
  originCity?: string
  originState?: string
  originZip?: string
  originAddressFull?: string
  destinationStreet?: string
  destinationCity?: string
  destinationState?: string
  destinationZip?: string
  destinationAddressFull?: string
  bedrooms?: string
  moveSize?: string
  notes?: string
  referralSource?: string
  branchId?: string
  serviceType?: string
  [key: string]: any // For custom fields
}

// Map service types to SmartMoving's expected values
const mapServiceType = (serviceType: string): string => {
  const serviceTypeMap: Record<string, string> = {
    Cheapest: "Moving",
    Standard: "MovingAndPacking",
    Premium: "MovingAndPacking",
  }
  return serviceTypeMap[serviceType] || "Moving"
}

// Format the move date to YYYYMMDD format
const formatMoveDate = (date: Date | null): string => {
  if (!date) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}${month}${day}`
}

// Map move size to bedrooms
const mapMoveSize = (moveSize: string): string => {
  const moveSizeMap: Record<string, string> = {
    "a Studio": "Studio",
    "1 Bedroom": "1 Bedroom",
    "2 Bedroom": "2 Bedroom",
    "3 Bedroom": "3 Bedroom",
    "4 Bedroom": "4 Bedroom",
    "a Business": "Commercial",
  }
  return moveSizeMap[moveSize] || moveSize
}

export async function submitLeadToSmartMoving(
  quoteData: QuoteData,
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    console.log("Starting SmartMoving API submission with data:", {
      firstName: quoteData.firstName,
      lastName: quoteData.lastName,
      email: quoteData.email,
      phoneNumber: quoteData.phoneNumber,
      moveDate: quoteData.moveDate,
      moveSize: quoteData.moveSize,
      originCity: quoteData.originCity,
      destinationCity: quoteData.destinationCity,
    })

    // Format the data according to SmartMoving's API requirements
    const payload: SmartMovingLeadRequest = {
      // Customer Information
      firstName: quoteData.firstName || undefined,
      lastName: quoteData.lastName || undefined,
      fullName: !quoteData.firstName && !quoteData.lastName ? quoteData.fullName : undefined,
      phoneNumber: quoteData.phoneNumber || undefined,
      userOptIn: quoteData.smsConsent ? "true" : "false",
      email: quoteData.email || undefined,

      // Move Information
      moveDate: quoteData.moveDate ? formatMoveDate(quoteData.moveDate) : undefined,
      moveSize: quoteData.moveSize ? mapMoveSize(quoteData.moveSize) : undefined,
      serviceType:
        quoteData.serviceType && quoteData.serviceType !== "Moving"
          ? quoteData.serviceType
          : mapServiceType(quoteData.serviceType),
      notes: `Move timeframe: ${quoteData.moveTimeframe || "Not specified"}, Project status: ${quoteData.projectStatus || "Not specified"}`,

      // Origin Address
      originStreet: quoteData.originStreetAddress || undefined,
      originCity: quoteData.originCity || undefined,
      originState: quoteData.originState || undefined,
      originZip: quoteData.originZip || undefined,

      // Destination Address
      destinationStreet: quoteData.destinationStreetAddress || undefined,
      destinationCity: quoteData.destinationCity || undefined,
      destinationState: quoteData.destinationState || undefined,
      destinationZip: quoteData.destinationZip || undefined,

      // Additional custom fields
      QuoteEstimateMin: quoteData.estimatedCost?.min?.toString() || "",
      QuoteEstimateMax: quoteData.estimatedCost?.max?.toString() || "",
      VerificationCode: "Verified", // Assuming the user completed verification
    }

    // If we don't have individual address components but have full addresses, use those
    if (!payload.originStreet && !payload.originCity && quoteData.originAddress) {
      payload.originAddressFull = quoteData.originAddress
    }

    if (!payload.destinationStreet && !payload.destinationCity && quoteData.destinationAddress) {
      payload.destinationAddressFull = quoteData.destinationAddress
    }

    // Replace this with your actual provider key
    const providerKey = process.env.SMARTMOVING_PROVIDER_KEY || "your_provider_key_here"
    const apiUrl = `https://api.smartmoving.com/api/leads/from-provider/v2?providerKey=${providerKey}`

    console.log("Submitting lead to SmartMoving API:", {
      url: apiUrl,
      payload: { ...payload, phoneNumber: payload.phoneNumber ? "***-***-****" : undefined }, // Hide phone in logs
    })

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("SmartMoving API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("SmartMoving API error response:", errorText)

      // Check for duplicate submission
      if (response.status === 400) {
        if (errorText.includes("already been submitted") || errorText.includes("duplicate")) {
          return {
            success: false,
            message: "Your information has already been received. A representative will contact you shortly.",
          }
        }
      }

      // Handle rate limiting
      if (response.status === 429) {
        return {
          success: false,
          message: "Too many requests. Please wait a moment and try again.",
        }
      }

      // Handle server errors
      if (response.status >= 500) {
        return {
          success: false,
          message: "Our system is temporarily unavailable. Please try again in a few minutes or call us directly.",
        }
      }

      // Handle other errors
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("SmartMoving API success response:", data)

    return {
      success: true,
      message: "Your moving request has been submitted successfully! A representative will contact you shortly.",
      id: data.id || "unknown",
    }
  } catch (error) {
    console.error("Error submitting lead to SmartMoving:", error)

    // Provide specific error messages based on error type
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Network connection error. Please check your internet connection and try again.",
      }
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return {
        success: false,
        message: "Request timed out. Please try again or contact us directly.",
      }
    }

    return {
      success: false,
      message:
        "There was an error submitting your information. Please try again or contact us directly at (239) 722-0000.",
    }
  }
}
