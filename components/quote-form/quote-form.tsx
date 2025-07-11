"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuote } from "@/contexts/quote-context"
import { LocationSearch } from "@/components/location-search/location-search"

export function QuoteForm({ initialZip = "" }: { initialZip?: string }) {
  const router = useRouter()
  const { quoteData, updateQuoteData, markStepCompleted, submitQuoteData } = useQuote()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    moveSize: quoteData.moveSize || "",
    moveDate: quoteData.moveDate || undefined,
    firstName: quoteData.firstName || "",
    lastName: quoteData.lastName || "",
    email: quoteData.email || "",
    phone: quoteData.phoneNumber || "",
    additionalServices: quoteData.additionalServices || [],
  })

  // Initialize form data from context when component mounts
  useEffect(() => {
    setFormData({
      moveSize: quoteData.moveSize || "",
      moveDate: quoteData.moveDate || undefined,
      firstName: quoteData.firstName || "",
      lastName: quoteData.lastName || "",
      email: quoteData.email || "",
      phone: quoteData.phoneNumber || "",
      additionalServices: quoteData.additionalServices || [],
    })

    // Set initial step based on completed data
    if (quoteData.originZip && quoteData.destinationZip) setStep(2)
    if (quoteData.moveSize && quoteData.moveDate) setStep(3)
    if (quoteData.firstName && quoteData.lastName && quoteData.email && quoteData.phoneNumber) setStep(4)
  }, [quoteData])

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAdditionalService = (service: string) => {
    setFormData((prev) => {
      const services = [...prev.additionalServices]
      if (services.includes(service)) {
        return { ...prev, additionalServices: services.filter((s) => s !== service) }
      } else {
        return { ...prev, additionalServices: [...services, service] }
      }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Update the context with all form data
    updateQuoteData({
      moveSize: formData.moveSize,
      moveDate: formData.moveDate as Date,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phoneNumber: formData.phone,
      additionalServices: formData.additionalServices,
    })

    // Mark all steps as completed
    markStepCompleted("location")
    markStepCompleted("moveDetails")
    markStepCompleted("contact")
    markStepCompleted("additionalServices")

    try {
      // Submit the quote data
      await submitQuoteData()
      setIsSubmitting(false)
      setStep(5) // Move to success step
    } catch (error) {
      console.error("Error submitting quote:", error)
      setIsSubmitting(false)
      // Handle error (could show an error message)
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      // Update context with current step data
      if (step === 1) {
        markStepCompleted("location")
      } else if (step === 2) {
        updateQuoteData({
          moveSize: formData.moveSize,
          moveDate: formData.moveDate as Date,
        })
        markStepCompleted("moveDetails")
      } else if (step === 3) {
        updateQuoteData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phoneNumber: formData.phone,
        })
        markStepCompleted("contact")
      }

      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return !!quoteData.originZip && !!quoteData.destinationZip
      case 2:
        return !!formData.moveSize && !!formData.moveDate
      case 3:
        return !!formData.firstName && !!formData.lastName && !!formData.email && !!formData.phone
      default:
        return true
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step > i
                    ? "bg-[#064c3b] text-white"
                    : step === i
                      ? "bg-[#064c3b] text-white"
                      : "bg-gray-200 text-gray-500",
                )}
              >
                {step > i ? <CheckCircle size={16} /> : i}
              </div>
              <span className="text-xs mt-1 hidden md:block">
                {i === 1 ? "Location" : i === 2 ? "Move Details" : i === 3 ? "Contact" : "Review"}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-[#064c3b] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#064c3b]">Where are you moving?</h2>
          <p className="text-gray-600">Enter your current and destination addresses</p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="originAddress">Current Address</Label>
              <LocationSearch placeholder="Enter City Or ZIP Code" className="mt-1" isDestination={false} />
            </div>

            <div>
              <Label htmlFor="destinationAddress">Destination Address</Label>
              <LocationSearch placeholder="Enter City Or ZIP Code" className="mt-1" isDestination={true} />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={nextStep}
              className="w-full bg-[#064c3b] hover:bg-[#053c2e]"
              disabled={!quoteData.originZip || !quoteData.destinationZip}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Move Details */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#064c3b]">Tell us about your move</h2>
          <p className="text-gray-600">Help us understand the size and timing of your move</p>

          <div className="space-y-4">
            <div>
              <Label>Move Size</Label>
              <RadioGroup
                value={formData.moveSize}
                onValueChange={(value) => updateFormData("moveSize", value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2"
              >
                <div className="border rounded-md p-3 cursor-pointer hover:border-[#064c3b] transition-colors">
                  <RadioGroupItem value="Studio" id="studio" className="sr-only" />
                  <Label htmlFor="studio" className="flex items-center cursor-pointer">
                    <div className="w-full">
                      <div className="font-medium">Studio/1 Bedroom</div>
                      <div className="text-sm text-gray-500">400-650 sq ft</div>
                    </div>
                  </Label>
                </div>

                <div className="border rounded-md p-3 cursor-pointer hover:border-[#064c3b] transition-colors">
                  <RadioGroupItem value="2 Bedroom" id="small" className="sr-only" />
                  <Label htmlFor="small" className="flex items-center cursor-pointer">
                    <div className="w-full">
                      <div className="font-medium">2 Bedroom</div>
                      <div className="text-sm text-gray-500">800-1000 sq ft</div>
                    </div>
                  </Label>
                </div>

                <div className="border rounded-md p-3 cursor-pointer hover:border-[#064c3b] transition-colors">
                  <RadioGroupItem value="3 Bedroom" id="medium" className="sr-only" />
                  <Label htmlFor="medium" className="flex items-center cursor-pointer">
                    <div className="w-full">
                      <div className="font-medium">3 Bedroom</div>
                      <div className="text-sm text-gray-500">1200-1500 sq ft</div>
                    </div>
                  </Label>
                </div>

                <div className="border rounded-md p-3 cursor-pointer hover:border-[#064c3b] transition-colors">
                  <RadioGroupItem value="4 Bedroom" id="large" className="sr-only" />
                  <Label htmlFor="large" className="flex items-center cursor-pointer">
                    <div className="w-full">
                      <div className="font-medium">4+ Bedroom</div>
                      <div className="text-sm text-gray-500">1500+ sq ft</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Moving Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.moveDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.moveDate ? format(formData.moveDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.moveDate}
                    onSelect={(date) => updateFormData("moveDate", date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={prevStep} variant="outline" className="w-1/2">
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="w-1/2 bg-[#064c3b] hover:bg-[#053c2e]"
              disabled={!formData.moveSize || !formData.moveDate}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#064c3b]">Your Contact Information</h2>
          <p className="text-gray-600">We'll send your quotes to this contact information</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={prevStep} variant="outline" className="w-1/2">
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="w-1/2 bg-[#064c3b] hover:bg-[#053c2e]"
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Additional Services & Review */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#064c3b]">Additional Services & Review</h2>
          <p className="text-gray-600">Select any additional services you need and review your information</p>

          <div className="space-y-4">
            <Label>Additional Services (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["Packing Services", "Storage Services", "Furniture Assembly", "Junk Removal"].map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.replace(/\s+/g, "-").toLowerCase()}
                    checked={formData.additionalServices.includes(service)}
                    onCheckedChange={() => toggleAdditionalService(service)}
                  />
                  <Label htmlFor={service.replace(/\s+/g, "-").toLowerCase()}>{service}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium">Review Your Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">From:</div>
              <div>
                {quoteData.originAddress || `${quoteData.originCity}, ${quoteData.originState} ${quoteData.originZip}`}
              </div>

              <div className="text-gray-500">To:</div>
              <div>
                {quoteData.destinationAddress ||
                  `${quoteData.destinationCity}, ${quoteData.destinationState} ${quoteData.destinationZip}`}
              </div>

              <div className="text-gray-500">Move Size:</div>
              <div>{formData.moveSize}</div>

              <div className="text-gray-500">Move Date:</div>
              <div>{formData.moveDate ? format(formData.moveDate, "PPP") : "Not selected"}</div>

              <div className="text-gray-500">Name:</div>
              <div>
                {formData.firstName} {formData.lastName}
              </div>

              <div className="text-gray-500">Contact:</div>
              <div>
                {formData.email} / {formData.phone}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={prevStep} variant="outline" className="w-1/2">
              Back
            </Button>
            <Button onClick={handleSubmit} className="w-1/2 bg-[#064c3b] hover:bg-[#053c2e]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Get Quotes"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="text-center space-y-6 py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-[#064c3b]">Quote Request Submitted!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Thank you for your request. We'll analyze your moving needs and send competitive quotes to your email
            shortly.
          </p>

          <div className="pt-4">
            <Button onClick={() => router.push("/")} className="bg-[#064c3b] hover:bg-[#053c2e]">
              Return to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
