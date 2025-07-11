import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | THE MOVING MAVERICKS & JUNK REMOVAL",
  description:
    "Learn about how THE MOVING MAVERICKS & JUNK REMOVAL collects, uses, and protects your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#064c3b] mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">Last Updated: May 20, 2025</p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            THE MOVING MAVERICKS & JUNK REMOVAL ("we," "our," or "us") respects your privacy and is committed to
            protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our website or use our moving and junk removal services.
          </p>
          <p className="text-gray-700 mb-4">
            Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have
            read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">2. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Request a quote for our services</li>
            <li>Create an account on our website</li>
            <li>Sign up for our newsletter</li>
            <li>Contact our customer service team</li>
            <li>Participate in promotions or surveys</li>
          </ul>
          <p className="text-gray-700 mb-4">
            The personal information we may collect includes your name, email address, phone number, mailing address,
            move details, payment information, and any other information you choose to provide.
          </p>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We may use the information we collect for various purposes, including to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Communicate with you about products, services, offers, and events</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize your experience on our website</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">4. Sharing Your Information</h2>
          <p className="text-gray-700 mb-4">We may share your personal information with:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Service providers who perform services on our behalf</li>
            <li>Professional advisors, such as lawyers, auditors, and insurers</li>
            <li>Government bodies when required by law</li>
            <li>Business partners with your consent</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">5. Your Choices</h2>
          <p className="text-gray-700 mb-4">You have certain choices about how we use your information:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>You can opt out of receiving promotional emails by following the instructions in those emails</li>
            <li>You can update your account information by logging into your account</li>
            <li>You can request access to, correction of, or deletion of your personal information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[#064c3b] mt-8 mb-4">6. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700 mb-4">
            THE MOVING MAVERICKS & JUNK REMOVAL
            <br />
            Email: privacy@themovingmavericks.com
            <br />
            Phone: (239) 722-0000
          </p>
        </div>
      </div>
    </div>
  )
}
