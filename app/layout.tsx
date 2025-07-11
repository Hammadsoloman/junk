import type { Metadata } from 'next'
import './globals.css'
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { QuoteProvider } from "@/contexts/quote-context";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "THE MOVING MAVERICKS & JUNK REMOVAL - Stress-Free Moving & Junk Removal",
  description:
    "Professional moving, labor, and junk removal services in Southwest Florida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
       <body className={inter.className}>
        <QuoteProvider>
          <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </QuoteProvider>
        <div id="recaptcha-container"></div>
      </body>
    </html>
  )
}
