"use client"
import Image from "next/image"
import { DollarSign, Package, Star, Timer, Gift, BarChart3, MapPin } from "lucide-react"
import { QuoteButton } from "@/components/quote-modal/quote-button"
import { LocationSearch } from "@/components/location-search/location-search"
import { useSearchParams } from "next/navigation"

export default function Home() {
  const searchParams = useSearchParams();
  const service = searchParams.get("ServiceType");
  return (
    <div
      className=" relative"
      style={{
        backgroundImage: 'url("/vector-background.svg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-16 overflow-auto">
        <div className="md:grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-4 lg:space-y-8">
            <div className="bg-white rounded-lg p-4 lg:p-10 shadow-sm border">
              <h1 className="text-2xl lg:text-5xl font-bold text-[#064c3b] leading-tight mb-6">
                Stress-Free Moving Starts Here
              </h1>
              <p className="text-gray-700 mb-4 lg:mb-8 text-sm lg:text-md ">
                Fast. Reliable. Affordable. Serving Southwest Florida with professional moving, labor, and junk removal
                services
              </p>

              {/* Zip Code Input */}
              <div className="mb-6">
                <label
                  htmlFor="location-search"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <MapPin size={16} className="mr-1 text-[#064c3b]" />
                  Where are you moving from? <span className="text-red-500 ml-1">*</span>
                </label>
                <LocationSearch id="location-search" />
                <p className="text-xs text-gray-500 mt-1">Enter your city or ZIP code to get started</p>
              </div>

              {/* CTA Button */}
              <QuoteButton service={service} />

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-y-2 lg:gap-y-6 mt-8 text-sm lg:text-md">
                <div className="flex items-center gap-2">
                  <div className="text-[#064c3b]">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-gray-700">Competitive Price</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[#064c3b]">
                    <Timer size={20} />
                  </div>
                  <span className="text-gray-700">Fast In Response</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[#064c3b]">
                    <Package size={20} />
                  </div>
                  <span className="text-gray-700">Licensed and Insured</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[#064c3b]">
                    <Gift size={20} />
                  </div>
                  <span className="text-gray-700">Free Moving Quotes</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[#064c3b]">
                    <Star size={20} />
                  </div>
                  <span className="text-gray-700">Full-Service Moving Pros</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[#064c3b]">
                    <BarChart3 size={20} />
                  </div>
                  <span className="text-gray-700">Compare and Save</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Illustrations */}
          <div className="relative h-full ">
            {/* Moving Truck */}
            <div className="absolute right-0 bottom-0 w-1/2 hidden md:block">
              <Image src="/moving-truck.png" alt="Moving truck" width={350} height={200} className="w-full h-auto" />
            </div>

            {/* Parachute Package */}
            <div className="absolute right-1/4 top-0 w-1/4 z-20 hidden md:block">
              <Image
                src="/parachute-package.png"
                alt="Package with parachute"
                width={150}
                height={150}
                className="w-full h-auto"
              />
            </div>

            {/* Stacked Boxes */}
            <div className="absolute left-0 bottom-1/4 w-1/4 z-10 hidden md:block">
              <Image src="/stacked-boxes.png" alt="Stacked boxes" width={150} height={150} className="w-full h-auto" />
            </div>

            {/* Movers with Boxes */}
            <div className="md:absolute md:left-1/4 md:bottom-0 mx-auto w-[200px] md:w-1/2 z-10">
              <Image
                src="/movers-with-boxes.gif"
                alt="Movers with boxes"
                width={300}
                height={300}
                className="w-full h-auto"
                unoptimized // This ensures the GIF animation works properly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
