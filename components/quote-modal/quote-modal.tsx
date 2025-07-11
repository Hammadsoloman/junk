"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  X,
  MapPin,
  Home,
  Calendar,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useQuote } from "@/contexts/quote-context";
import { LocationSearch } from "@/components/location-search/location-search";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
declare global {
  interface Window {
    google: any;
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

type QuoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: QuoteData) => void;
  service?: string | null;
};

export type QuoteData = {
  moveTime: string;
  moveSize: string;
  serviceType: string;
  projectStatus: string;
  originLocation: string;
  destinationLocation: string;
  destinationZip: string;
  moveDate: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export function QuoteModal({
  isOpen,
  onClose,
  onComplete,
  service,
}: QuoteModalProps) {
  const { quoteData, updateQuoteData, markStepCompleted, submitQuoteData } =
    useQuote();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuoteData>({
    moveTime: "",
    moveSize: "",
    serviceType: "",
    projectStatus: "",
    originLocation: "New York, NY",
    destinationLocation: "Agawam, MA",
    destinationZip: "",
    moveDate: new Date().toLocaleDateString(), // Keep as string for display
    email: "",
    fullName: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [originInputValue, setOriginInputValue] = useState("");
  const [destinationInputValue, setDestinationInputValue] = useState("");
  const [locationStep, setLocationStep] = useState<"origin" | "destination">(
    "origin"
  );
  const [isValidatingDestination, setIsValidatingDestination] = useState("");
  const [destinationValidationMessage, setDestinationValidationMessage] =
    useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSMSError, setSubmissionSMSError] = useState("");
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [selectedMoveDate, setSelectedMoveDate] = useState<Date>(new Date());

  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const isClient = useRef(false);
  useEffect(() => {
    isClient.current = true;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        }
      );
    }
  }, []);

  // Initialize local state from context when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentDate = new Date().toLocaleDateString();
      const moveDate = quoteData.moveDate || currentDate;

      setData({
        moveTime: quoteData.moveTimeframe || "",
        moveSize: quoteData.moveSize || "",
        serviceType: quoteData.serviceType || "",
        projectStatus: quoteData.projectStatus || "",
        originLocation:
          quoteData.originCity && quoteData.originState
            ? `${quoteData.originCity}, ${quoteData.originState}`
            : "New York, NY",
        destinationLocation:
          quoteData.destinationCity && quoteData.destinationState
            ? `${quoteData.destinationCity}, ${quoteData.destinationState}`
            : "Agawam, MA",
        destinationZip: quoteData.destinationZip || "",
        moveDate:
          moveDate instanceof Date
            ? moveDate.toLocaleDateString()
            : moveDate.toString(),
        email: quoteData.email || "",
        fullName: quoteData.fullName || "",
        firstName: quoteData.firstName || "",
        lastName: quoteData.lastName || "",
        phoneNumber: quoteData.phoneNumber || "",
      });

      setSelectedMoveDate(moveDate instanceof Date ? moveDate : currentDate);
      setConsentChecked(quoteData.smsConsent || false);
      setOriginInputValue(quoteData.originAddress || "");
      setDestinationInputValue(quoteData.destinationAddress || "");

      // Only determine starting step when modal first opens, not on every data change
      if (step === 1) {
        if (quoteData.moveTimeframe && !quoteData.moveSize) setStep(2);
        else if (quoteData.moveSize && !quoteData.serviceType) setStep(3);
        else if (quoteData.serviceType && !quoteData.projectStatus) setStep(4);
        else if (quoteData.projectStatus && !quoteData.destinationZip)
          setStep(6);
        else if (quoteData.destinationZip && !quoteData.email) setStep(7);
        else if (quoteData.email && !quoteData.fullName) setStep(8);
        else if (quoteData.fullName && !quoteData.phoneNumber) setStep(9);
      }
    }
  }, [
    isOpen,
    quoteData.moveTimeframe,
    quoteData.moveSize,
    quoteData.serviceType,
    quoteData.projectStatus,
    quoteData.destinationZip,
    quoteData.email,
    quoteData.fullName,
  ]);

  // Handle Enter key press for form navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle Enter key
      if (event.key !== "Enter") return;

      // Prevent default form submission
      event.preventDefault();

      // Handle Enter key based on current step
      switch (step) {
        case 6:
          // Step 6: Confirm move details and destination
          if (quoteData.destinationCity || quoteData.destinationZip) {
            markStepCompleted("destinationZip");
            setStep(7);
          } else {
            setDestinationValidationMessage(
              "Please enter a valid destination city or ZIP code"
            );
          }
          break;

        case 7:
          // Step 7: Email collection
          if (data.email && validateEmail(data.email)) {
            updateQuoteData({ email: data.email });
            markStepCompleted("email");
            setStep(8);
          }
          break;

        case 8:
          // Step 8: Name collection
          if (data.firstName.length >= 2 && data.lastName.length >= 2) {
            const fullName = `${data.firstName} ${data.lastName}`;
            updateQuoteData({
              firstName: data.firstName,
              lastName: data.lastName,
              fullName: fullName,
            });
            setData({ ...data, fullName: fullName });
            markStepCompleted("name");
            setStep(9);
          }
          break;

        case 9:
          // Step 9: Phone number collection
          if (validatePhone(data.phoneNumber) && consentChecked) {
            updateQuoteData({
              phoneNumber: data.phoneNumber,
              smsConsent: consentChecked,
            });
            markStepCompleted("phone");
            setStep(10);
          }
          break;

        case 10:
          // Step 10: Confirm phone number
          if (!isSendingSMS) {
            handleConfirmBySMS();
          }
          break;

        case 11:
          // Step 11: Verification code
          if (verificationCode.length >= 3 && !isSubmitting) {
            handleVerificationSubmit();
          }
          break;

        default:
          // No action for other steps
          break;
      }
    };

    // Only add event listener for steps 6-11
    if (isOpen && step >= 6 && step <= 11) {
      document.addEventListener("keydown", handleKeyPress);

      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [
    isOpen,
    step,
    data.email,
    data.firstName,
    data.lastName,
    data.phoneNumber,
    consentChecked,
    verificationCode,
    isSubmitting,
    isSendingSMS,
    quoteData.destinationCity,
    quoteData.destinationZip,
  ]);

  // When moving to the next step from step 1, skip step 2 if service is JunkRemoval
  const handleMoveTimeSelect = (time: string) => {
    setData({ ...data, moveTime: time });
    updateQuoteData({ moveTimeframe: time });
    markStepCompleted("moveTimeframe");
    if (service === "JunkRemoval") {
      setStep(3); // Skip step 2
    } else {
      setStep(2);
    }
  };

  // When going back from step 3 to step 1 for JunkRemoval, decrement by 2
  const handleBack = () => {
    if (service === "JunkRemoval" && step === 3) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleMoveSizeSelect = (size: string) => {
    setData({ ...data, moveSize: size });
    updateQuoteData({ moveSize: size });
    markStepCompleted("moveSize");
    setStep(3);
  };

  const handleServiceTypeSelect = (type: string) => {
    setData({ ...data, serviceType: type });
    updateQuoteData({ serviceType: type });
    markStepCompleted("serviceType");
    setStep(4);
  };

  const handleProjectStatusSelect = (status: string) => {
    setData({ ...data, projectStatus: status });
    updateQuoteData({ projectStatus: status });
    markStepCompleted("projectStatus");

    // Initialize the move date to current date when proceeding to location step
    const currentDate = new Date();
    setSelectedMoveDate(currentDate);
    setData((prev) => ({
      ...prev,
      moveDate: currentDate?.toLocaleDateString(),
    }));

    setStep(5); // Now go to location step
  };

  const handleLocationContinue = () => {
    // Validate that we have location data before proceeding
    if (!quoteData.originCity && !quoteData.originZip) {
      setLocationError("Please enter your origin city or ZIP code");
      setLocationStep("origin");
      return;
    }

    if (!quoteData.destinationCity && !quoteData.destinationZip) {
      setLocationError("Please enter your destination city or ZIP code");
      setLocationStep("destination");
      return;
    }

    setLocationError("");
    markStepCompleted("location");
    setStep(6);
  };

  const handleZipCodeSubmit = async () => {
    // This function is no longer needed as the LocationSearch component handles validation
    // But we'll keep it for backward compatibility
    if (quoteData.destinationCity || quoteData.destinationZip) {
      markStepCompleted("destinationZip");
      setStep(7);
    } else {
      setDestinationValidationMessage(
        "Please enter a valid destination city or ZIP code"
      );
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    if (data.email && validateEmail(data.email)) {
      updateQuoteData({ email: data.email });
      markStepCompleted("email");
      setStep(8);
    }
  };

  const handleNameSubmit = () => {
    if (data.firstName.length >= 2 && data.lastName.length >= 2) {
      const fullName = `${data.firstName} ${data.lastName}`;
      updateQuoteData({
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: fullName,
      });
      setData({ ...data, fullName: fullName });
      markStepCompleted("name");
      setStep(9);
    }
  };

  const handlePhoneSubmit = () => {
    console.log("handlePhoneSubmit called");
    console.log("Phone number:", data.phoneNumber);
    console.log("Phone valid:", validatePhone(data.phoneNumber));
    console.log("Consent checked:", consentChecked);

    if (validatePhone(data.phoneNumber) && consentChecked) {
      console.log(
        "Validation passed, updating quote data and moving to step 10"
      );
      updateQuoteData({
        phoneNumber: data.phoneNumber,
        smsConsent: consentChecked,
      });
      markStepCompleted("phone");

      // Use setTimeout to ensure state updates before step change
      setTimeout(() => {
        setStep(10);
      }, 50);
    } else {
      console.log("Validation failed");
      if (!validatePhone(data.phoneNumber)) {
        console.log("Phone validation failed");
      }
      if (!consentChecked) {
        console.log("Consent not checked");
      }
    }
  };

  const handleConfirmBySMS = async () => {
 
    try {
      setIsSendingSMS(true);
      setSubmissionError("");
      setSubmissionSMSError("");
      const appVerifier = window.recaptchaVerifier!;
      const result = await signInWithPhoneNumber(
        auth,
        `+1${data.phoneNumber}`,
        appVerifier
      );
      console.log(result);
      setConfirmationResult(result);
      window.confirmationResult = result;
      console.log("OTP sent!");
      //alert("OTP sent!");
      setStep(11);
      console.log("Moving to step 11");
    } catch (error) {
      console.error("Error sending OTP: ", error);
      setSubmissionSMSError(
        `There was an error submitting your information. Please try again.`
      );
      //alert("Error sending OTP");
    } finally {
      setIsSendingSMS(false);
      updateQuoteData({ phoneNumber: data.phoneNumber });
    }
    //  // Simulate sending SMS
    //  setIsSendingSMS(true)
    //  console.log("Confirming by SMS for number:", data.phoneNumber)
    //  updateQuoteData({ phoneNumber: data.phoneNumber })
    //
    //  // Add a small delay to simulate SMS sending
    //  setTimeout(() => {
    //    setIsSendingSMS(false)
    //    setStep(11)
    //    console.log("Moving to step 11")
    //  }, 1500)
  };

  const handleVerificationSubmit = async () => {
 
  
    //  if (verificationCode.length >= 3) {
    setIsSubmitting(true);
    setSubmissionError("");

    try {
      if (!confirmationResult) throw new Error("No OTP confirmation found.");
      const result = await confirmationResult.confirm(verificationCode);
      console.log(result);
      //alert("Phone number verified! User ID: " + result.user.uid);

      // First, update the quote context with all the collected data
      const finalQuoteData = {
        moveTimeframe: data.moveTime,
        moveSize: data.moveSize,
        serviceType: data.serviceType,
        projectStatus: data.projectStatus,
        moveDate: selectedMoveDate?.toLocaleDateString(), // Use the selected date from step 6
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        smsConsent: consentChecked,
        // Include destination data if available
        destinationZip: quoteData.destinationZip || data.destinationZip,
      };

      // Update the context with all final data
      updateQuoteData(finalQuoteData);

      // Submit the quote data to the API
      console.log("Submitting quote data with move date:", selectedMoveDate);
      await submitQuoteData();

      // Check the submission status from the context
      // Note: We need to wait a moment for the context to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if there was an error in the submission
      if (quoteData.submissionStatus && !quoteData.submissionStatus.success) {
        setSubmissionError(
          quoteData.submissionStatus.message ||
            "There was an error submitting your information. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      // If submission was successful, proceed to success state
      setIsSubmitting(false);

      // Create the final data object for the success component
      const successData = {
        ...data,
        moveDate: selectedMoveDate?.toLocaleDateString(),
        destinationZip: quoteData.destinationZip || data.destinationZip,
      };

      console.log("Data submitted successfully:", successData);
      onComplete(successData);
      onClose();
    } catch (error) {
      console.error("Error submitting quote:", error);
      setIsSubmitting(false);

      // Show user-friendly error message
      if (error instanceof Error) {
        setSubmissionError(
          `Submission failed: ${error.message}. Please try again or contact us directly.`
        );
      } else {
        setSubmissionError(
          "There was an unexpected error submitting your information. Please try again or contact us directly."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
    //  }
  };

  const validatePhone = (phone: string) => {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, "");
    console.log(
      "Validating phone:",
      phone,
      "Digits only:",
      digitsOnly,
      "Length:",
      digitsOnly.length
    );
    return digitsOnly.length >= 10;
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;

    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "");

    // Don't format if empty
    if (phoneNumber.length === 0) return "";

    // Format based on length
    if (phoneNumber.length < 4) {
      return phoneNumber;
    }
    if (phoneNumber.length < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6, 10)}`;
    }

    // Limit to 10 digits
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedPhoneNumber = formatPhoneNumber(value);
    setData((prev) => ({ ...prev, phoneNumber: formattedPhoneNumber }));
  };

  const handleOriginPlaceSelect = (place: google.maps.places.PlaceResult) => {
    // Update data with the selected place
    if (place.formatted_address) {
      setData({ ...data, originLocation: place.formatted_address });
    }
    setLocationError("");
  };

  const handleDestinationPlaceSelect = (
    place: google.maps.places.PlaceResult
  ) => {
    // Update data with the selected place
    if (place.formatted_address) {
      setData({ ...data, destinationLocation: place.formatted_address });
    }
    setLocationError("");
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log("handleDateSelect called with:", date);
    if (date) {
      console.log("Setting date:", date);
      setSelectedMoveDate(date);
      const formattedDate = date?.toLocaleDateString();
      setData((prev) => ({ ...prev, moveDate: formattedDate }));
      updateQuoteData({ moveDate: date });
    }
  };

  const handleClose = () => {
    setStep(1);
    setData({
      moveTime: "",
      moveSize: "",
      serviceType: "",
      projectStatus: "",
      originLocation: "New York, NY",
      destinationLocation: "Agawam, MA",
      destinationZip: "",
      moveDate: new Date().toLocaleDateString(),
      email: "",
      fullName: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    });
    setSelectedMoveDate(new Date());
    setConsentChecked(false);
    setVerificationCode("");
    setLocationError("");
    setSubmissionError("");
    onClose();
  };

  // Add a reset function to clear form data
  const handleResetForm = () => {
    const currentDate = new Date();

    // Reset local state
    setData({
      moveTime: "",
      moveSize: "",
      serviceType: "",
      projectStatus: "",
      originLocation: "",
      destinationLocation: "",
      destinationZip: "",
      moveDate: currentDate?.toLocaleDateString(),
      email: "",
      fullName: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    });
    setSelectedMoveDate(currentDate);
    setConsentChecked(false);
    setVerificationCode("");
    setLocationError("");
    setOriginInputValue("");
    setDestinationInputValue("");
    setSubmissionError("");

    // Reset context data related to the quote form
    updateQuoteData({
      moveTimeframe: "",
      moveSize: "",
      serviceType: "",
      projectStatus: "",
      moveDate: currentDate,
      destinationZip: "",
      email: "",
      fullName: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      smsConsent: false,
      completedSteps: [],
      submissionStatus: undefined,
    });

    // Go back to step 1
    setStep(1);
  };

  // Calculate progress percentage
  const totalSteps = service === "JunkRemoval" ? 10 : 11;
  // For JunkRemoval, display step number as step-1 for steps >= 3
  const displayStep = service === "JunkRemoval" && step >= 3 ? step - 1 : step;
  const progressPercentage = ((displayStep - 1) / totalSteps) * 100;

  if (!isClient.current) return null; // Prevent SSR mismatch

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 border-none max-w-md mx-auto">
        <div className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-xl">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-1">
            <div
              className="bg-[#064c3b] h-1 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Step indicator */}
          <div className="bg-[#064c3b] text-white px-4 py-2 text-sm font-medium flex justify-between items-center">
            <span>
              Step {displayStep} of {totalSteps}
            </span>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {/* Step 1: When are you moving? */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#064c3b] text-center mb-6">
                  {service === "JunkRemoval"
                    ? "When do you need junk removal?"
                    : "When are you Moving?"}
                </h2>
                <div className="space-y-3">
                  {[
                    "In a few days",
                    "In 2 weeks",
                    "In 1 month",
                    "In 2 months",
                    "Later",
                  ].map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "w-full py-3 px-4 rounded-md text-center font-medium transition-colors border",
                        data.moveTime === option
                          ? "bg-[#064c3b] text-white border-[#064c3b]"
                          : "bg-white text-gray-800 border-gray-300 hover:border-[#064c3b] hover:text-[#064c3b]"
                      )}
                      onClick={() => handleMoveTimeSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Your Move Size */}
            {step === 2 && service !== "JunkRemoval" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#064c3b] text-center mb-6">
                  Choose Your Move Size
                </h2>
                <div className="space-y-3">
                  {[
                    "a Studio",
                    "1 Bedroom",
                    "2 Bedroom",
                    "3 Bedroom",
                    "4 Bedroom",
                    "a Business",
                  ].map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "w-full py-3 px-4 rounded-md text-center font-medium transition-colors border",
                        data.moveSize === option
                          ? "bg-[#064c3b] text-white border-[#064c3b]"
                          : "bg-white text-gray-800 border-gray-300 hover:border-[#064c3b] hover:text-[#064c3b]"
                      )}
                      onClick={() => handleMoveSizeSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: What type of service are you looking for */}
            {step === 3 && (
              <div className="space-y-6">
                {service && service !== "Moving" ? (
                  // Auto-set service type and proceed
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-[#064c3b] text-center mb-6">
                      Service Type Confirmed
                    </h2>
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-center">
                      <p className="text-sm">Service Type: {service}</p>
                    </div>
                    <Button
                      onClick={() => {
                        handleServiceTypeSelect(service);
                      }}
                      className="w-full bg-[#064c3b] hover:bg-[#053c2e] text-white"
                    >
                      Continue
                    </Button>
                  </div>
                ) : (
                  // Show normal service type selection
                  <>
                    <h2 className="text-2xl font-bold text-[#064c3b] text-center mb-6">
                      What type of service are you looking for?
                    </h2>
                    <div className="space-y-3">
                      {["Cheapest", "Standard", "Premium"].map((option) => (
                        <button
                          key={option}
                          className={cn(
                            "w-full py-3 px-4 rounded-md text-center font-medium transition-colors border",
                            data.serviceType === option
                              ? "bg-[#064c3b] text-white border-[#064c3b]"
                              : "bg-white text-gray-800 border-gray-300 hover:border-[#064c3b] hover:text-[#064c3b]"
                          )}
                          onClick={() => handleServiceTypeSelect(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: What's the project status? */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#064c3b] text-center mb-6">
                  What's the project status?
                </h2>
                <div className="space-y-3">
                  {["Ready to Hire", "Viewing Options"].map((option) => (
                    <button
                      key={option}
                      className={cn(
                        "w-full py-3 px-4 rounded-md text-center font-medium transition-colors border",
                        data.projectStatus === option
                          ? "bg-[#064c3b] text-white border-[#064c3b]"
                          : "bg-white text-gray-800 border-gray-300 hover:border-[#064c3b] hover:text-[#064c3b]"
                      )}
                      onClick={() => handleProjectStatusSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Location Information (NEW STEP) */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#064c3b] text-center mb-6">
                  Where are you moving?
                </h2>

                {locationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2 mb-4">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{locationError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div
                    className={
                      locationStep === "origin"
                        ? "border-2 border-[#064c3b] p-3 rounded-md"
                        : ""
                    }
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin Location
                    </label>
                    <LocationSearch
                      placeholder="Enter City Or ZIP Code"
                      isDestination={false}
                      value={originInputValue}
                      onChange={setOriginInputValue}
                      onPlaceSelect={handleOriginPlaceSelect}
                    />
                    {locationStep === "origin" && (
                      <p className="text-xs text-[#064c3b] mt-1">
                        Please enter your origin city or ZIP code
                      </p>
                    )}
                  </div>

                  <div
                    className={
                      locationStep === "destination"
                        ? "border-2 border-[#064c3b] p-3 rounded-md"
                        : ""
                    }
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Location
                    </label>
                    <LocationSearch
                      placeholder="Enter City Or ZIP Code"
                      isDestination={true}
                      value={destinationInputValue}
                      onChange={setDestinationInputValue}
                      onPlaceSelect={handleDestinationPlaceSelect}
                    />
                    {locationStep === "destination" && (
                      <p className="text-xs text-[#064c3b] mt-1">
                        Please enter your destination city or ZIP code
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleLocationContinue}
                  className="w-full bg-[#064c3b] hover:bg-[#053c2e] text-white"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 6: Location Details, Date Selection and ZIP Code */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#064c3b] mb-4">
                  Confirm Your Move Details
                </h2>

                <div className="bg-gray-50 p-4 rounded-md space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-[#064c3b]" />
                    <span>
                      From:{" "}
                      {quoteData.originAddress ||
                        `${quoteData.originCity}, ${quoteData.originState}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Home size={18} className="text-[#064c3b]" />
                    <span>Size: {data.moveSize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-[#064c3b]" />
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Destination Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-[#064c3b]" />
                    <span className="font-medium">Destination</span>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Destination City or ZIP Code
                  </label>
                  <LocationSearch
                    placeholder="Enter City Or ZIP Code"
                    isDestination={true}
                    value={destinationInputValue}
                    onChange={(value) => {
                      setDestinationInputValue(value);
                      // Clear any previous validation message when user types
                      setDestinationValidationMessage("");
                    }}
                    onPlaceSelect={(place) => {
                      // When a place is selected, update both the local state and the quote context
                      if (place.formatted_address) {
                        setData({
                          ...data,
                          destinationLocation: place.formatted_address,
                        });
                        setDestinationInputValue(place.formatted_address);

                        // Extract ZIP code if available
                        let zipCode = "";
                        if (place.address_components) {
                          for (const component of place.address_components) {
                            if (component.types.includes("postal_code")) {
                              zipCode = component.long_name;
                              break;
                            }
                          }
                        }

                        if (zipCode) {
                          setData({ ...data, destinationZip: zipCode });
                        }
                      }
                    }}
                    className="w-full"
                  />

                  {destinationValidationMessage && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {destinationValidationMessage}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    // Check if we have valid destination data before proceeding
                    if (quoteData.destinationCity || quoteData.destinationZip) {
                      markStepCompleted("destinationZip");
                      setStep(7);
                    } else {
                      setDestinationValidationMessage(
                        "Please enter a valid destination city or ZIP code"
                      );
                    }
                  }}
                  className="w-full bg-[#064c3b] hover:bg-[#053c2e] text-white"
                  disabled={
                    !quoteData.destinationCity && !quoteData.destinationZip
                  }
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 7: Email Collection */}
            {step === 7 && (
              <div className="space-y-6">
                <div className="flex justify-between mb-4">
                  <div className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                    <span>Route Confirmed</span>
                    <CheckCircle size={14} />
                  </div>
                  <div className="bg-[#064c3b] text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                    <span>View Prices</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-lg text-gray-700">
                    Amazing, almost ready to display
                  </p>
                  <p className="text-xl font-bold text-[#064c3b]">
                    your ballpark estimate
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Valid Email Address
                  </label>
                  <p className="text-xs text-gray-500">
                    We'll send your quote details to this email
                  </p>
                  <div className="relative">
                    <Input
                      type="email"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent default form submission
                          if (data.email && validateEmail(data.email)) {
                            handleEmailSubmit();
                          }
                        }
                      }}
                      placeholder="example@email.com"
                      className={cn(
                        "border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b] pr-10",
                        data.email && !validateEmail(data.email)
                          ? "border-red-500"
                          : ""
                      )}
                      autoFocus
                    />
                    {data.email && validateEmail(data.email) && (
                      <CheckCircle
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                      />
                    )}
                    {data.email && !validateEmail(data.email) && (
                      <AlertCircle
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                      />
                    )}
                  </div>

                  {data.email && !validateEmail(data.email) && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid email address
                    </p>
                  )}

                  <Button
                    onClick={handleEmailSubmit}
                    className="w-full mt-4 bg-[#064c3b] hover:bg-[#053c2e] text-white"
                    disabled={!data.email || !validateEmail(data.email)}
                  >
                    Next
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By proceeding you agree to receive our emails. We respect
                    your privacy and will never share your email.
                  </p>
                </div>
              </div>
            )}

            {/* Step 8: Name Collection */}
            {step === 8 && (
              <div className="space-y-6">
                <div className="flex justify-between mb-4">
                  <div className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                    <span>Route Confirmed</span>
                    <CheckCircle size={14} />
                  </div>
                  <div className="bg-[#064c3b] text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                    <span>View Prices</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-lg text-gray-700">
                    Amazing, almost ready to display
                  </p>
                  <p className="text-xl font-bold text-[#064c3b]">
                    your ballpark estimate
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <Input
                        value={data.firstName}
                        onChange={(e) =>
                          setData({ ...data, firstName: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            // Focus on last name field if first name is valid, otherwise try to submit
                            if (data.firstName.length >= 2) {
                              const lastNameInput = document.querySelector(
                                'input[placeholder="e.g. Smith"]'
                              ) as HTMLInputElement;
                              if (lastNameInput && data.lastName.length < 2) {
                                lastNameInput.focus();
                              } else if (data.lastName.length >= 2) {
                                handleNameSubmit();
                              }
                            }
                          }
                        }}
                        placeholder="e.g. John"
                        className={cn(
                          "border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b] pr-10",
                          data.firstName && data.firstName.length < 2
                            ? "border-red-500"
                            : ""
                        )}
                        autoFocus
                      />
                      {data.firstName && data.firstName.length >= 2 && (
                        <CheckCircle
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                      {data.firstName && data.firstName.length < 2 && (
                        <AlertCircle
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                        />
                      )}
                    </div>
                    {data.firstName && data.firstName.length < 2 && (
                      <p className="text-xs text-red-500 mt-1">
                        First name must be at least 2 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <Input
                        value={data.lastName}
                        onChange={(e) =>
                          setData({ ...data, lastName: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (
                              data.firstName.length >= 2 &&
                              data.lastName.length >= 2
                            ) {
                              handleNameSubmit();
                            }
                          }
                        }}
                        placeholder="e.g. Smith"
                        className={cn(
                          "border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b] pr-10",
                          data.lastName && data.lastName.length < 2
                            ? "border-red-500"
                            : ""
                        )}
                      />
                      {data.lastName && data.lastName.length >= 2 && (
                        <CheckCircle
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                        />
                      )}
                      {data.lastName && data.lastName.length < 2 && (
                        <AlertCircle
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
                        />
                      )}
                    </div>
                    {data.lastName && data.lastName.length < 2 && (
                      <p className="text-xs text-red-500 mt-1">
                        Last name must be at least 2 characters
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      if (
                        data.firstName.length >= 2 &&
                        data.lastName.length >= 2
                      ) {
                        const fullName = `${data.firstName} ${data.lastName}`;
                        updateQuoteData({
                          firstName: data.firstName,
                          lastName: data.lastName,
                          fullName: fullName,
                        });
                        setData({ ...data, fullName: fullName });
                        markStepCompleted("name");
                        setStep(9);
                      }
                    }}
                    className="w-full mt-4 bg-[#064c3b] hover:bg-[#053c2e] text-white"
                    disabled={
                      data.firstName.length < 2 || data.lastName.length < 2
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 9: Phone Number Collection */}
            {step === 9 && (
              <div className="space-y-6">
                <div className="flex justify-between mb-4">
                  <div className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                    <span>Route Confirmed</span>
                    <CheckCircle size={14} />
                  </div>
                  <div className="bg-[#064c3b] text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                    <span>View Prices</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-lg text-gray-700">
                    Amazing, almost ready to display
                  </p>
                  <p className="text-xl font-bold text-[#064c3b]">
                    your ballpark estimate
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <Input
                    type="tel"
                    value={data.phoneNumber}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (validatePhone(data.phoneNumber) && consentChecked) {
                          handlePhoneSubmit();
                        }
                      }
                    }}
                    placeholder="(xxx) xxx-xxxx"
                    className="border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b]"
                    autoFocus
                  />

                  <div className="flex items-start space-x-2 mt-4">
                    <Checkbox
                      id="consent"
                      checked={consentChecked}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setConsentChecked(isChecked);
                        // Don't update quote context here to avoid state conflicts
                        // We'll update it when the user proceeds to the next step
                      }}
                      className="mt-1 data-[state=checked]:bg-[#064c3b] data-[state=checked]:border-[#064c3b]"
                    />
                    <label htmlFor="consent" className="text-xs text-gray-600">
                      I confirm that I expressly consent to receive marketing
                      calls and text messages from All American Moving Group,
                      LLC at the telephone number I provided, including calls
                      and texts sent using an autodialer or prerecorded voice. I
                      understand my consent is not a condition of purchase.
                      Message and data rates may apply.
                    </label>
                  </div>

                  <Button
                    onClick={() => {
                      console.log("Get My Estimate button clicked");
                      console.log("Current phone:", data.phoneNumber);
                      console.log("Current consent:", consentChecked);
                      handlePhoneSubmit();
                    }}
                    className="w-full mt-4 bg-[#064c3b] hover:bg-[#053c2e] text-white"
                    disabled={
                      !validatePhone(data.phoneNumber) || !consentChecked
                    }
                  >
                    Get My Estimate
                  </Button>
                </div>
              </div>
            )}

            {/* Step 10: Confirm Phone Number */}
            {step === 10 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#064c3b] text-center">
                  Confirm Number
                </h2>
                <p className="text-center text-gray-600">Edit or confirm</p>

                <Input
                  type="tel"
                  value={data.phoneNumber}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!isSendingSMS) {
                        handleConfirmBySMS();
                      }
                    }
                  }}
                  className="border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b]"
                  autoFocus
                />
                {submissionSMSError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Error sending OTP: </p>
                      <p className="text-xs">{submissionSMSError}</p>
                      <p className="text-xs mt-1">
                        You can try again or call us at (239) 722-0000 for
                        immediate assistance.
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleConfirmBySMS}
                  className="w-full bg-[#064c3b] hover:bg-[#053c2e] text-white"
                  type="button"
                  disabled={isSendingSMS}
                >
                  {isSendingSMS ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending SMS...
                    </>
                  ) : (
                    "Confirm by SMS"
                  )}
                </Button>
              </div>
            )}

            {/* Step 11: Verification Code */}
            {step === 11 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[#064c3b] text-center">
                  Enter Your Verification Code
                </h2>
                <p className="text-center text-gray-600">
                  SMS Code Sent To {data.phoneNumber}
                </p>

                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (verificationCode.length >= 3 && !isSubmitting) {
                        handleVerificationSubmit();
                      }
                    }
                  }}
                  placeholder="XXXXXX"
                  className="text-center text-xl border-gray-300 focus:border-[#064c3b] focus:ring-[#064c3b]"
                  maxLength={6}
                  autoFocus
                />

                {submissionError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Submission Error</p>
                      <p className="text-xs">{submissionError}</p>
                      <p className="text-xs mt-1">
                        You can try again or call us at (239) 722-0000 for
                        immediate assistance.
                      </p>
                    </div>
                  </div>
                )}

                {isSubmitting && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-start gap-2">
                    <Loader2
                      size={18}
                      className="mt-0.5 flex-shrink-0 animate-spin"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        Submitting Your Information
                      </p>
                      <p className="text-xs">
                        Please wait while we process your moving request...
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleVerificationSubmit}
                  className="w-full bg-[#064c3b] hover:bg-[#053c2e] text-white"
                  disabled={verificationCode.length < 3 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Your Request...
                    </>
                  ) : (
                    "Submit & Get Quotes"
                  )}
                </Button>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setStep(10)}
                  >
                    Change Number
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setVerificationCode("");
                      handleConfirmBySMS();
                    }}
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with back button */}
          {step > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-[#064c3b] hover:bg-transparent flex items-center gap-1"
                onClick={handleBack}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </Button>

              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                onClick={handleResetForm}
              >
                <X size={16} />
                <span>Reset Form</span>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
