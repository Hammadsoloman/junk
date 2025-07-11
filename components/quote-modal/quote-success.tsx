"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Phone,
  Calendar,
  MapPin,
  User,
  Mail,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuote } from "@/contexts/quote-context";
import type { QuoteData } from "./quote-modal";

type QuoteSuccessProps = {
  isOpen: boolean;
  onClose: () => void;
  quoteData: QuoteData | null;
};

export function QuoteSuccess({
  isOpen,
  onClose,
  quoteData,
}: QuoteSuccessProps) {
  const { quoteData: contextData } = useQuote();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  // Use context data if available, otherwise fall back to prop data
  const displayData = {
    originLocation:
      contextData.originAddress ||
      (contextData.originCity && contextData.originState
        ? `${contextData.originCity}, ${contextData.originState} ${contextData.originZip}`
        : quoteData?.originLocation || ""),
    destinationLocation:
      contextData.destinationAddress ||
      (contextData.destinationCity && contextData.destinationState
        ? `${contextData.destinationCity}, ${contextData.destinationState} ${contextData.destinationZip}`
        : quoteData?.destinationLocation || ""),
    destinationZip:
      contextData.destinationZip || quoteData?.destinationZip || "",
    moveDate: contextData.moveDate
      ? contextData.moveDate
      : quoteData?.moveDate || "",
    fullName: contextData.fullName || quoteData?.fullName || "",
    firstName:
      contextData.firstName || quoteData?.fullName?.split(" ")[0] || "",
    email: contextData.email || quoteData?.email || "",
    phoneNumber: contextData.phoneNumber || quoteData?.phoneNumber || "",
    moveSize: contextData.moveSize || quoteData?.moveSize || "",
    price: contextData.estimatedCost || { min: 0, max: 0 },
    submissionStatus: contextData.submissionStatus,
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 border-none max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-xl max-h-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#064c3b] rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-[#064c3b] mb-2">
                Connecting You with THE MOVING MAVERICKS & JUNK REMOVAL
              </h2>
              <p className="text-gray-600 text-center">
                We're finding the best moving professionals in your area...
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Header Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#064c3b] mb-2">
                  Thank you, {displayData.firstName}!
                </h1>
                <p className="text-gray-600 text-sm">
                  Please, expect a call any minute.
                </p>
                <p className="text-gray-500 text-xs">
                  We may have additional questions.
                </p>
              </div>

              {/* API Submission Status */}
              {displayData.submissionStatus && (
                <div
                  className={`p-3 rounded-md mb-4 ${
                    displayData.submissionStatus.success
                      ? "bg-green-50 border border-green-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {displayData.submissionStatus.success ? (
                      <CheckCircle2
                        size={16}
                        className="text-green-600 mt-0.5 flex-shrink-0"
                      />
                    ) : (
                      <AlertCircle
                        size={16}
                        className="text-yellow-600 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          displayData.submissionStatus.success
                            ? "text-green-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {displayData.submissionStatus.success
                          ? "Request Submitted Successfully"
                          : "Request Status"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {displayData.submissionStatus.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Move Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-[#064c3b] mb-3 text-sm">
                  Your Move Summary
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-[#064c3b] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-gray-500">From</p>
                      <p className="font-medium text-gray-700">
                        {displayData.originLocation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-[#064c3b] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-gray-500">To</p>
                      <p className="font-medium text-gray-700">
                        {displayData.destinationLocation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar
                      size={14}
                      className="text-[#064c3b] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-700">
                        {displayData.moveDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User
                      size={14}
                      className="text-[#064c3b] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-gray-500">Size</p>
                      <p className="font-medium text-gray-700">
                        {displayData.moveSize}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Cost */}
              {/*displayData.price.min > 0 && (
                <div className="bg-[#064c3b] text-white rounded-lg p-4 text-center mb-4">
                  <p className="text-sm opacity-90 mb-1">Estimated Cost Range</p>
                  <p className="text-2xl font-bold">
                    ${displayData.price.min.toLocaleString()} - ${displayData.price.max.toLocaleString()}
                  </p>
                  <p className="text-xs opacity-75 mt-1">Final quote may vary based on actual inventory</p>
                </div>
              )*/}

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-[#064c3b] mb-2 text-sm">
                  Your Contact Information
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-[#064c3b]" />
                    <span className="text-gray-700">
                      {displayData.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-[#064c3b]" />
                    <span className="text-gray-700">{displayData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-[#064c3b]" />
                    <span className="text-gray-700">
                      {displayData.phoneNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Company Card */}
              <div className="bg-[#f5f3f0] rounded-lg p-4 mb-6 border border-[#e8e5e0]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[#064c3b] font-bold text-sm">
                      Your Recommended Company
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Best for Full-service moves
                    </p>
                  </div>
                  <Info size={16} className="text-gray-400" />
                </div>

                {/* Company Logo/Branding */}
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="text-[#064c3b] font-bold text-lg">MM</div>
                  </div>
                  <h4 className="text-[#064c3b] font-bold text-lg">
                    THE MOVING MAVERICKS & JUNK REMOVAL
                  </h4>
                  <p className="text-xs text-gray-600">
                    THE MOVING MAVERICKS & JUNK REMOVAL, LLC
                  </p>
                  <p className="text-xs text-gray-500">
                    Licensed Florida Moving Company
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-green-600 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700">
                      Licensed & Insured Professionals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-green-600 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700">
                      Full-Service Moving Solutions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-green-600 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700">
                      Local and Long-Distance Moves
                    </span>
                  </div>
                </div>

                {/* Contact Button */}
                <div className="border border-[#064c3b] rounded-md p-3 text-center bg-white">
                  <p className="text-[#064c3b] font-medium text-sm mb-1">
                    Talk to a Person
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Phone size={16} className="text-[#064c3b]" />
                    <a
                      href="tel:2397220000"
                      className="text-[#064c3b] font-bold text-lg"
                    >
                      (239) 722-0000
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-[#064c3b] text-[#064c3b] hover:bg-[#f0f9f6] text-sm py-2"
                    onClick={() => (window.location.href = "/get-quotes")}
                  >
                    Get More Quotes
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2"
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  A moving specialist will contact you shortly to discuss your
                  move details and provide a personalized quote.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
