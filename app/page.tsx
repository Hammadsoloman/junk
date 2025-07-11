"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

import MOVING_ICON from "@/public/assets/moving.svg";
import LABOR_ICON from "@/public/assets/labor.svg";
import JUNK_ICON from "@/public/assets/junk.svg";

const services = [
  // {
  //   id: "moving-1",
  //   title: "Moving Services",
  //   description:
  //     " Whether you're relocating your home or office, we handle the packing, lifting, and transport with care and precision.",
  //   icon: MOVING_ICON,
  //   urlParam: "moving",
  // },
  {
    id: "moving-3",
    title: "Junk Removal",
    description:
      " From old furniture and appliances to renovation debris, we haul away the mess so you don’t have to.",
    icon: JUNK_ICON,
    urlParam: "junk",
  },
  {
    id: "moving-2",
    title: "Labor-Only Assistance",
    description:
      " Need a few strong hands for furniture setup, event prep, or truck loading? Our professional crew is ready — no truck needed.",
    icon: LABOR_ICON,
    urlParam: "labor",
  },
];

export default function MovingMavericksLanding() {
  const [selectedService, setSelectedService] = useState<string>(
    services[0].id
  );
  const [currentServiceUrlParam, setCurrentServiceUrlParam] = useState<string>(
    services[0].urlParam
  );

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  return (
    <div className=" bg-gray-50 h-[100%] flex flex-col justify-center ">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto  px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-4">
            How Can our Mavericks Help You?
          </h1>
          <p className="text-gray-600 text-lg">Please select all that apply.</p>
        </div>

        {/* Service Cards */}
        <div className={`grid md:grid-cols-${services.length} gap-6 mb-12`}>
          {services.map((service) => {
            const isSelected = selectedService === service.id;

            return (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  isSelected
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 hover:border-teal-300"
                }`}
                onClick={() => {
                  handleServiceSelect(service.id);
                  setCurrentServiceUrlParam(service.urlParam);
                }}
              >
                <CardContent className="p-6 relative">
                  <div className="absolute top-4 left-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-teal-600 bg-teal-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center pt-8">
                    <div className="mb-4 p-3 bg-green-100 rounded-full">
                      <Image src={service.icon} alt={service.title} />
                    </div>

                    <h3 className="text-xl font-semibold text-teal-800 mb-3">
                      {service.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Apply Button */}
        <div className="text-center">
          <Link href={`/service?service=${currentServiceUrlParam}`}>
            <Button className="bg-teal-700 hover:bg-teal-800 text-white px-12 py-3 text-lg rounded-md font-medium">
              Apply & Next
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
