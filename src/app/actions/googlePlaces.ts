'use server'

export interface PlacePrediction {
  description: string
  placeId: string
  mainText: string
  secondaryText: string
}

export interface GooglePlaceInfo {
  name: string
  rating: number
  address: string
  lat: number
  lng: number
  types: string[]
  isMeal?: boolean
  photoUrl?: string
  priceLevel?: number
  openNow?: boolean
  placeId?: string
}

export async function getGooglePlaceSuggestions(
  query: string
): Promise<{ success: boolean; predictions: PlacePrediction[] }> {

  // SERVER KEY ONLY
  const apiKey = process.env.GOOGLE_SERVER_API_KEY

  if (!apiKey) {
    console.warn(
      'Google Server API key is missing. Autocomplete disabled.'
    )

    return {
      success: false,
      predictions: []
    }
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(query)}` +
      `&types=(cities)` +
      `&key=${apiKey}`

    const res = await fetch(url, {
      cache: 'no-store'
    })

    const data = await res.json()

    if (data.status === 'OK' && data.predictions) {

      const mapped = data.predictions.map((p: any) => ({
        description: p.description,
        placeId: p.place_id,
        mainText:
          p.structured_formatting?.main_text ||
          p.description,

        secondaryText:
          p.structured_formatting?.secondary_text || ''
      }))

      return {
        success: true,
        predictions: mapped
      }
    }

    console.error('Autocomplete API Error:', data)

  } catch (error) {
    console.error(
      'Error fetching Google autocomplete:',
      error
    )
  }

  return {
    success: false,
    predictions: []
  }
}

export async function getGooglePlacesForCity(
  destination: string
): Promise<GooglePlaceInfo[]> {

  // SERVER KEY ONLY
  const apiKey = process.env.GOOGLE_SERVER_API_KEY

  if (!apiKey) {
    console.warn(
      'Google Server API key missing.'
    )

    return []
  }

  try {

    const fetchPlaces = async (
      query: string
    ): Promise<GooglePlaceInfo[]> => {

      const url =
        `https://maps.googleapis.com/maps/api/place/textsearch/json` +
        `?query=${encodeURIComponent(query)}` +
        `&key=${apiKey}`

      const res = await fetch(url, {
        cache: 'no-store'
      })

      const data = await res.json()

      if (
        data.status === 'OK' &&
        data.results
      ) {

        return data.results
          .slice(0, 10)
          .map((r: any) => ({

            name: r.name,

            rating: r.rating || 4.5,

            address:
              r.formatted_address || '',

            lat:
              r.geometry?.location?.lat || 0,

            lng:
              r.geometry?.location?.lng || 0,

            types: r.types || [],
            placeId: r.place_id,

            photoUrl:
              r.photos?.[0]?.photo_reference

                ? `https://maps.googleapis.com/maps/api/place/photo` +
                `?maxwidth=600` +
                `&photo_reference=${r.photos[0].photo_reference}` +
                `&key=${apiKey}`

                : undefined
          }))
      }

      console.error('Text Search API Error:', data)

      return []
    }

    const [attractions, meals] =
      await Promise.all([

        fetchPlaces(
          `tourist attractions and sightseeing points in ${destination}`
        ),

        fetchPlaces(
          `best cafes and restaurants food places in ${destination}`
        )
      ])

    const mealPlaces = meals.map(
      (m: GooglePlaceInfo) => ({
        ...m,
        isMeal: true
      })
    )

    return [
      ...attractions,
      ...mealPlaces
    ]

  } catch (error) {

    console.error(
      'Error querying Places API:',
      error
    )
  }

  return []
}

// FRONTEND MAP KEY ONLY
export async function getGoogleMapsApiKey(): Promise<string> {

  return (
    process.env
      .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  )
}

export async function getPlaceDetails(placeId: string): Promise<any> {
  // SERVER KEY ONLY
  const apiKey = process.env.GOOGLE_SERVER_API_KEY
  if (!apiKey) {
    console.warn('Google Server API key missing.')
    return null
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,photos,reviews,opening_hours,geometry,url,formatted_address&key=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    
    if (data.status === 'OK' && data.result) {
      if (data.result.photos) {
        data.result.photos = data.result.photos.map((p: any) => ({
          ...p,
          photoUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${apiKey}`
        }))
      }
      return data.result
    }
    console.error('Place Details API Error:', data)
  } catch (error) {
    console.error('Error fetching Place Details:', error)
  }
  return null
}