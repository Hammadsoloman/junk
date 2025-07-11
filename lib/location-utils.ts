// This is a simplified dataset for demonstration purposes
// In a real application, this would be fetched from an API or a larger database
const US_CITIES_SAMPLE = [
  { city: "New York", state: "NY", zipCode: "10001" },
  { city: "Los Angeles", state: "CA", zipCode: "90001" },
  { city: "Chicago", state: "IL", zipCode: "60601" },
  { city: "Houston", state: "TX", zipCode: "77001" },
  { city: "Phoenix", state: "AZ", zipCode: "85001" },
  { city: "Philadelphia", state: "PA", zipCode: "19101" },
  { city: "San Antonio", state: "TX", zipCode: "78201" },
  { city: "San Diego", state: "CA", zipCode: "92101" },
  { city: "Dallas", state: "TX", zipCode: "75201" },
  { city: "San Jose", state: "CA", zipCode: "95101" },
  { city: "Austin", state: "TX", zipCode: "73301" },
  { city: "Jacksonville", state: "FL", zipCode: "32099" },
  { city: "Fort Worth", state: "TX", zipCode: "76101" },
  { city: "Columbus", state: "OH", zipCode: "43085" },
  { city: "San Francisco", state: "CA", zipCode: "94101" },
  { city: "Charlotte", state: "NC", zipCode: "28201" },
  { city: "Indianapolis", state: "IN", zipCode: "46201" },
  { city: "Seattle", state: "WA", zipCode: "98101" },
  { city: "Denver", state: "CO", zipCode: "80201" },
  { city: "Washington", state: "DC", zipCode: "20001" },
  { city: "Boston", state: "MA", zipCode: "02101" },
  { city: "Nashville", state: "TN", zipCode: "37201" },
  { city: "Baltimore", state: "MD", zipCode: "21201" },
  { city: "Oklahoma City", state: "OK", zipCode: "73101" },
  { city: "Portland", state: "OR", zipCode: "97201" },
  { city: "Las Vegas", state: "NV", zipCode: "89101" },
  { city: "Milwaukee", state: "WI", zipCode: "53201" },
  { city: "Albuquerque", state: "NM", zipCode: "87101" },
  { city: "Tucson", state: "AZ", zipCode: "85701" },
  { city: "Fresno", state: "CA", zipCode: "93701" },
  { city: "Sacramento", state: "CA", zipCode: "94203" },
  { city: "Long Beach", state: "CA", zipCode: "90801" },
  { city: "Kansas City", state: "MO", zipCode: "64101" },
  { city: "Mesa", state: "AZ", zipCode: "85201" },
  { city: "Atlanta", state: "GA", zipCode: "30301" },
  { city: "Miami", state: "FL", zipCode: "33101" },
  { city: "Tampa", state: "FL", zipCode: "33601" },
  { city: "Orlando", state: "FL", zipCode: "32801" },
  { city: "Fort Lauderdale", state: "FL", zipCode: "33301" },
  { city: "Naples", state: "FL", zipCode: "34101" },
  { city: "Fort Myers", state: "FL", zipCode: "33901" },
  { city: "Sarasota", state: "FL", zipCode: "34230" },
  { city: "Bradenton", state: "FL", zipCode: "34201" },
  { city: "Cape Coral", state: "FL", zipCode: "33904" },
  { city: "Bonita Springs", state: "FL", zipCode: "34134" },
  { city: "Estero", state: "FL", zipCode: "33928" },
  { city: "Lehigh Acres", state: "FL", zipCode: "33936" },
  { city: "Port Charlotte", state: "FL", zipCode: "33952" },
  { city: "Punta Gorda", state: "FL", zipCode: "33950" },
  { city: "Venice", state: "FL", zipCode: "34284" },
]

export async function getCitySuggestions(query: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Normalize query for case-insensitive search
  const normalizedQuery = query.toLowerCase().trim()

  // First check if it's a zip code
  if (/^\d{5}$/.test(normalizedQuery)) {
    const cityByZip = US_CITIES_SAMPLE.find((city) => city.zipCode === normalizedQuery)
    return cityByZip ? [cityByZip] : []
  }

  // Search by city name
  return US_CITIES_SAMPLE.filter((city) => {
    const cityName = city.city.toLowerCase()
    const stateName = city.state.toLowerCase()

    return cityName.startsWith(normalizedQuery) || `${cityName}, ${stateName}`.includes(normalizedQuery)
  }).slice(0, 10) // Limit to 10 results
}

export function validateZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode)
}

export function getZipCodeFromCityState(city: string, state: string): string | null {
  const match = US_CITIES_SAMPLE.find(
    (item) => item.city.toLowerCase() === city.toLowerCase() && item.state.toLowerCase() === state.toLowerCase(),
  )
  return match ? match.zipCode : null
}
