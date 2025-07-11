"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { submitLeadToSmartMoving } from "@/app/actions/submit-lead"

// Define the structure of our quote data
export interface QuoteData {
  // Location information
  originZip: string
  originCity: string
  originState: string
  originAddress: string
  originStreetAddress: string
  destinationZip: string
  destinationCity: string
  destinationState: string
  destinationAddress: string
  destinationStreetAddress: string

  // Move details
  moveSize: string
  moveDate: Date | null
  moveTimeframe: string
  serviceType: string
  projectStatus: string

  // Additional services
  additionalServices: string[]

  // Personal information
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string

  // Consent and preferences
  marketingConsent: boolean
  smsConsent: boolean

  // Metadata
  createdAt: Date
  updatedAt: Date
  completedSteps: string[]
  currentStep: string

  // Quote results
  estimatedCost: {
    min: number
    max: number
  } | null

  // API submission status
  submissionStatus?: {
    success: boolean
    message: string
    id?: string
  }
}

// Initial state for the quote data
const initialQuoteData: QuoteData = {
  originZip: "",
  originCity: "",
  originState: "",
  originAddress: "",
  originStreetAddress: "",
  destinationZip: "",
  destinationCity: "",
  destinationState: "",
  destinationAddress: "",
  destinationStreetAddress: "",

  moveSize: "",
  moveDate: new Date(),
  moveTimeframe: "",
  serviceType: "",
  projectStatus: "",

  additionalServices: [],

  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  phoneNumber: "",

  marketingConsent: false,
  smsConsent: false,

  createdAt: new Date(),
  updatedAt: new Date(),
  completedSteps: [],
  currentStep: "location",

  estimatedCost: null,
}

// Define the context type
interface QuoteContextType {
  quoteData: QuoteData
  updateQuoteData: (data: Partial<QuoteData>) => void
  resetQuoteData: () => void
  markStepCompleted: (step: string) => void
  isStepCompleted: (step: string) => boolean
  setCurrentStep: (step: string) => void
  submitQuoteData: () => Promise<void>
}

// Create the context
const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

// Provider component
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quoteData, setQuoteData] = useState<QuoteData>(() => {
    // Try to load from localStorage on initial render (client-side only)
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("quoteData")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          // Convert date strings back to Date objects
          if (parsedData.moveDate) {
            parsedData.moveDate = new Date(parsedData.moveDate)
          }
          parsedData.createdAt = new Date(parsedData.createdAt)
          parsedData.updatedAt = new Date(parsedData.updatedAt)
          return parsedData
        } catch (error) {
          console.error("Failed to parse saved quote data:", error)
        }
      }
    }
    return initialQuoteData
  })

  // Save to localStorage whenever quoteData changes
  useEffect(() => {
    localStorage.setItem("quoteData", JSON.stringify(quoteData))
  }, [quoteData])

  // Update quote data
  const updateQuoteData = (data: Partial<QuoteData>) => {
    setQuoteData((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date(),
    }))
  }

  // Reset quote data
  const resetQuoteData = () => {
    setQuoteData({
      ...initialQuoteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  // Mark a step as completed
  const markStepCompleted = (step: string) => {
    setQuoteData((prev) => {
      if (prev.completedSteps.includes(step)) {
        return prev
      }
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, step],
        updatedAt: new Date(),
      }
    })
  }

  // Check if a step is completed
  const isStepCompleted = (step: string) => {
    return quoteData.completedSteps.includes(step)
  }

  // Set the current step
  const setCurrentStep = (step: string) => {
    setQuoteData((prev) => ({
      ...prev,
      currentStep: step,
      updatedAt: new Date(),
    }))
  }

  // Submit quote data to backend
  const submitQuoteData = async () => {
    try {
      console.log("Starting quote submission process...")

      // Validate required fields before submission
      const requiredFields = {
        firstName: quoteData.firstName,
        lastName: quoteData.lastName,
        email: quoteData.email,
        phoneNumber: quoteData.phoneNumber,
        moveDate: quoteData.moveDate,
        //moveSize: quoteData.moveSize,
      }

      const missingFields = Object.entries(requiredFields).filter(([key, value]) => !value)

      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields)
        updateQuoteData({
          submissionStatus: {
            success: false,
            message: `Missing required information: ${missingFields.join(", ")}. Please complete all fields.`,
          },
        })
        return Promise.reject(new Error("Missing required fields"))
      }

      // Generate a random price estimate if we don't have one yet
      if (!quoteData.estimatedCost) {
        const basePrice =
          quoteData.moveSize === "a Studio" || quoteData.moveSize === "Studio"
            ? 500
            : quoteData.moveSize === "1 Bedroom"
              ? 800
              : quoteData.moveSize === "2 Bedroom"
                ? 1200
                : quoteData.moveSize === "3 Bedroom"
                  ? 1800
                  : quoteData.moveSize === "4 Bedroom"
                    ? 2500
                    : 3000

        const multiplier = quoteData.serviceType === "Cheapest" ? 1 : quoteData.serviceType === "Standard" ? 1.3 : 1.6

        const minPrice = Math.round(basePrice * multiplier * 0.9)
        const maxPrice = Math.round(basePrice * multiplier * 1.1)

        // Update quote data with estimate
        updateQuoteData({
          estimatedCost: { min: minPrice, max: maxPrice },
        })
      }

      console.log("Submitting to SmartMoving API with complete data...")

      // Submit to SmartMoving API
      const result = await submitLeadToSmartMoving(quoteData)

      console.log("SmartMoving API result:", result)

      // Update the submission status
      updateQuoteData({
        submissionStatus: result,
      })

      if (!result.success) {
        return Promise.reject(new Error(result.message))
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Failed to submit quote data:", error)

      // Update with error status
      updateQuoteData({
        submissionStatus: {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "There was an error submitting your information. Please try again.",
        },
      })

      return Promise.reject(error)
    }
  }

  return (
    <QuoteContext.Provider
      value={{
        quoteData,
        updateQuoteData,
        resetQuoteData,
        markStepCompleted,
        isStepCompleted,
        setCurrentStep,
        submitQuoteData,
      }}
    >
      {children}
    </QuoteContext.Provider>
  )
}

// Custom hook for using the quote context
export function useQuote() {
  const context = useContext(QuoteContext)
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider")
  }
  return context
}
