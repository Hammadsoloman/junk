import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use | THE MOVING MAVERICKS & JUNK REMOVAL",
  description: "Review the terms and conditions for using THE MOVING MAVERICKS & JUNK REMOVAL services and website.",
}

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#064c3b] mb-8">Terms of Use</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">Last Updated: May 20, 2025</p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing or using the THE MOVING MAVERICKS & JUNK REMOVAL website and services, you agree to be bound by
            these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you
            are prohibited from using or accessing this site.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily download one copy of the materials on THE MOVING MAVERICKS & JUNK
            REMOVAL's website for personal, non-commercial transitory viewing only. This is the grant of a license, not
            a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
          <p className="text-gray-700 mb-4">
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by
            THE MOVING MAVERICKS & JUNK REMOVAL at any time.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">3. Service Description</h2>
          <p className="text-gray-700 mb-4">
            THE MOVING MAVERICKS & JUNK REMOVAL provides moving and junk removal services as described on our website.
            We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without
            notice.
          </p>
          <p className="text-gray-700 mb-4">
            All quotes provided through our website are estimates only and are subject to change based on the actual
            scope of work required. Final pricing will be determined after an in-person assessment or detailed
            inventory.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">4. User Responsibilities</h2>
          <p className="text-gray-700 mb-4">When using our services, you agree to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Provide accurate and complete information about your moving needs</li>
            <li>Secure valuable and fragile items appropriately</li>
            <li>Ensure clear access to all items that need to be moved</li>
            <li>Be present or have an authorized representative present during the service</li>
            <li>Pay all agreed-upon fees in a timely manner</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            In no event shall THE MOVING MAVERICKS & JUNK REMOVAL or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption) arising out of the
            use or inability to use the materials on THE MOVING MAVERICKS & JUNK REMOVAL's website or services, even if
            THE MOVING MAVERICKS & JUNK REMOVAL or a THE MOVING MAVERICKS & JUNK REMOVAL authorized representative has
            been notified orally or in writing of the possibility of such damage.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">6. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of the State of
            Florida, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">7. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Use, please contact us at:
          </p>
          <p className="text-gray-700 mb-4">
            THE MOVING MAVERICKS & JUNK REMOVAL
            <br />
            Email: legal@themovingmavericks.com
            <br />
            Phone: (239) 722-0000
          </p>
        </div>
      </div>
    </div>
  )
}
