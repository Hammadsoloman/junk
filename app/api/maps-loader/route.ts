import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the API key from environment variables (server-side only)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key is not defined in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Return the script URL with the API key
    return NextResponse.json({
      scriptUrl: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`,
    })
  } catch (error) {
    console.error("Error in maps-loader API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
