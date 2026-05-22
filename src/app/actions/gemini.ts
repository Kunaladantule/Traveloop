'use server'

import { getGooglePlacesForCity } from './googlePlaces'

export async function generateGeminiItinerary(params: {
  destination: string
  vibe: string
  companion: string
  days: number
  budget: number
  currencySymbol: string
}) {
  const { destination, vibe, companion, days, budget, currencySymbol } = params
  const apiKey = process.env.GEMINI_API_KEY

  // 1. Fetch real-time (or high-fidelity offline) Google Places for destination
  const places = await getGooglePlacesForCity(destination)
  const placesContext = places.map((p, idx) => 
    `${idx + 1}. Name: "${p.name}", Rating: ${p.rating}, Types: [${p.types.join(', ')}], Address: "${p.address}", Lat: ${p.lat}, Lng: ${p.lng}, isMeal: ${p.isMeal || false}`
  ).join('\n')

  if (apiKey) {
    try {
      const prompt = `You are Traveloop's TripO AI Planner. Create a detailed travel itinerary for ${destination} for a ${days}-day trip.
The traveler is traveling as a ${companion} with a travel vibe focused on ${vibe}.
The total budget is ${currencySymbol}${budget}.

CRITICAL REQUIREMENTS:
1. Do NOT invent new attractions, sightseeing spots, cafes, or restaurants.
2. You MUST select, organize, and sequence places ONLY from the following list of real places fetched from the Google Places API:
${placesContext}
3. If the list contains fewer items than needed, repeat them intelligently or schedule longer visits/relaxation blocks rather than creating new names.
4. Each day must include a chronological list of 3 activities (attractions/sightseeing) and 2 meals (Lunch and Dinner).
5. For every activity and meal, include the correct "lat" and "lng" coordinates exactly as provided in the list.

Return a JSON object conforming exactly to this structure:
{
  "destination": "${destination}",
  "country": "Country name here",
  "vibe": "${vibe}",
  "companion": "${companion}",
  "days": ${days},
  "budget": ${budget},
  "category": "Low, Moderate, or Premium",
  "tripIntensity": "Relaxed, Moderate, or High",
  "attractionsCount": ${days * 3},
  "dailyItinerary": [
    {
      "day": 1,
      "totalSpent": 1200,
      "activities": [
        {
          "name": "Exact Name of the Place from the list",
          "time": "09:00 AM",
          "rating": "4.8",
          "city": "${destination}",
          "expense": 250,
          "isMeal": false,
          "lat": 21.1272,
          "lng": 79.0682
        },
        {
          "name": "Exact Name of the Place from the list",
          "time": "11:30 AM",
          "rating": "4.6",
          "city": "${destination}",
          "expense": 0,
          "isMeal": false,
          "lat": 21.1478,
          "lng": 79.0435
        },
        {
          "name": "Lunch: Exact Restaurant/Cafe Name from the list",
          "time": "01:00 PM",
          "rating": "4.5",
          "city": "${destination}",
          "expense": 150,
          "isMeal": true,
          "lat": 21.1398,
          "lng": 79.0624
        }
      ]
    }
  ],
  "smartRecommendations": [
    {
      "name": "Name of a hidden gem attraction from the list above",
      "desc": "Short description of why it is a hidden gem",
      "rating": "4.9"
    }
  ],
  "coverImage": "An Unsplash image URL related to the destination"
}

Ensure there are exactly ${days} items in "dailyItinerary". Provide realistic expenses that sum up close to the daily average budget, but keep some activities free. Only respond with valid JSON.`

      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        }),
        cache: 'no-store'
      })

      if (response.ok) {
        const json = await response.json()
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          // Ensure it has required fields before returning
          if (parsed.dailyItinerary && parsed.dailyItinerary.length > 0) {
            return { success: true, itinerary: parsed, source: 'Gemini AI' }
          }
        }
      }
      console.warn('Gemini API call failed or returned empty. Falling back to offline engine.')
    } catch (error) {
      console.error('Error contacting Gemini API:', error)
    }
  }

  // Graceful offline fallback compiler using same Google Places dataset
  const attractions = places.filter(p => !p.isMeal)
  const meals = places.filter(p => p.isMeal)

  let countryName = 'Global'
  if (destination.includes(',')) {
    const parts = destination.split(',')
    countryName = parts[parts.length - 1].trim()
  }

  const costPerDay = budget / days
  let category = 'Moderate'
  if (costPerDay < 1500 && currencySymbol === '₹') category = 'Low'
  else if (costPerDay > 5000 && currencySymbol === '₹') category = 'Premium'
  else if (costPerDay < 150) category = 'Low'
  else if (costPerDay > 500) category = 'Premium'

  let tripIntensity = 'Moderate'
  if (vibe === 'Relaxation') tripIntensity = 'Relaxed'
  else if (vibe === 'Adventure' || vibe === 'Night Life') tripIntensity = 'High'

  const defaultAttraction = {
    name: `${destination} Highlight`,
    rating: 4.6,
    address: `${destination} Center`,
    lat: 0,
    lng: 0,
    types: ['tourist_attraction']
  }

  const defaultMeal = {
    name: `${destination} Dining Spot`,
    rating: 4.5,
    address: `${destination} Downtown`,
    lat: 0,
    lng: 0,
    types: ['restaurant'],
    isMeal: true
  }

  const dailyItinerary = Array.from({ length: days }).map((_, idx) => {
    const spentDay = Math.round(costPerDay * 0.7)
    
    // Pick from attractions/meals or fallback to custom defaults
    const dayAttraction1 = attractions[idx % attractions.length] || defaultAttraction
    const dayAttraction2 = attractions[(idx + 1) % attractions.length] || defaultAttraction
    const dayAttraction3 = attractions[(idx + 2) % attractions.length] || defaultAttraction

    const dayMeal1 = meals[idx % meals.length] || defaultMeal
    const dayMeal2 = meals[(idx + 1) % meals.length] || defaultMeal

    return {
      day: idx + 1,
      totalSpent: spentDay,
      activities: [
        {
          name: dayAttraction1.name,
          time: '09:00 AM',
          rating: dayAttraction1.rating.toFixed(1),
          city: destination,
          expense: Math.round(spentDay * 0.3),
          isMeal: false,
          lat: dayAttraction1.lat,
          lng: dayAttraction1.lng
        },
        {
          name: dayAttraction2.name,
          time: '11:30 AM',
          rating: dayAttraction2.rating.toFixed(1),
          city: destination,
          expense: 0,
          isMeal: false,
          lat: dayAttraction2.lat,
          lng: dayAttraction2.lng
        },
        {
          name: `Lunch: ${dayMeal1.name}`,
          time: '01:00 PM',
          rating: dayMeal1.rating.toFixed(1),
          city: destination,
          expense: Math.round(spentDay * 0.2),
          isMeal: true,
          lat: dayMeal1.lat,
          lng: dayMeal1.lng
        },
        {
          name: dayAttraction3.name,
          time: '03:30 PM',
          rating: dayAttraction3.rating.toFixed(1),
          city: destination,
          expense: Math.round(spentDay * 0.25),
          isMeal: false,
          lat: dayAttraction3.lat,
          lng: dayAttraction3.lng
        },
        {
          name: `Dinner: ${dayMeal2.name}`,
          time: '07:30 PM',
          rating: dayMeal2.rating.toFixed(1),
          city: destination,
          expense: Math.round(spentDay * 0.25),
          isMeal: true,
          lat: dayMeal2.lat,
          lng: dayMeal2.lng
        }
      ]
    }
  })

  // Cover image mapping: use photoUrl of first place with photo if available, else default
  const validPhoto = places.find(p => p.photoUrl)?.photoUrl
  const coverImage = validPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800'

  // Compile smartRecommendations from top offline spots or Google spots
  const smartRecommendations = (attractions.length > 0 ? attractions.slice(0, 3) : [defaultAttraction]).map(a => ({
    name: a.name,
    desc: `A highly recommended attraction located at ${a.address || 'destination area'}.`,
    rating: a.rating.toFixed(1)
  }))

  const generatedItinerary = {
    destination,
    country: countryName,
    vibe,
    companion,
    days,
    budget,
    category,
    tripIntensity,
    attractionsCount: days * 3,
    dailyItinerary,
    smartRecommendations,
    coverImage
  }

  return { success: true, itinerary: generatedItinerary, source: 'Traveloop Offline Grounding Engine' }
}

