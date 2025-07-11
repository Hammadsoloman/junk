"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { QuoteModal, type QuoteData } from "./quote-modal"
import { QuoteSuccess } from "./quote-success"
import { useQuote } from "@/contexts/quote-context"
import { AlertCircle } from "lucide-react"

export function QuoteButton({ service }: { service?: string | null }) {
  const { quoteData, resetQuoteData } = useQuote()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [modalQuoteData, setModalQuoteData] = useState<QuoteData | null>(null)
  const [showLocationError, setShowLocationError] = useState(false)

  // Debug: Log quote data changes
  useEffect(() => {
    console.log("QuoteButton - Current quote data:", quoteData)
  }, [quoteData])

  // Update the handleOpenModal function to check for valid location data
  const handleOpenModal = () => {
    console.log("Attempting to open modal with data:", {
      originCity: quoteData.originCity,
      originZip: quoteData.originZip,
      originAddress: quoteData.originAddress,
    })

    // Check if we have either city or ZIP code
    const hasCityOrZip = Boolean(quoteData.originCity || quoteData.originZip)

    // Also check if we have a full address (which would contain city or ZIP)
    const hasAddress = Boolean(quoteData.originAddress && quoteData.originAddress.trim().length > 5)

    if (!hasCityOrZip && !hasAddress) {
      console.log("No valid location data found, showing error")
      // Show error message
      setShowLocationError(true)

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setShowLocationError(false)
      }, 5000)

      return
    }

    // Clear any previous error
    setShowLocationError(false)
    console.log("Valid location data found, opening modal")

    // Open the modal
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleQuoteComplete = (data: QuoteData) => {
    setModalQuoteData(data)
    setIsModalOpen(false)
    setIsSuccessOpen(true)
  }

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false)
    // Optionally reset the quote data after completion
    // resetQuoteData();
  }

  return (
    <>
      <div className="space-y-2 w-full">
        <Button onClick={handleOpenModal} className="w-full bg-[#064c3b] hover:bg-[#053c2e] text-white py-6 text-lg">
          Get a Quote
        </Button>

        {showLocationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm">Please enter a city or ZIP code above before requesting a quote.</p>
          </div>
        )}
      </div>

      <QuoteModal isOpen={isModalOpen} onClose={handleCloseModal} onComplete={handleQuoteComplete} service={service} />
      <QuoteSuccess isOpen={isSuccessOpen} onClose={handleCloseSuccess} quoteData={modalQuoteData} />
    </>
  )
}
