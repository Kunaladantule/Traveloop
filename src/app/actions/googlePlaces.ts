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
}

// Complete mock places database for offline execution / local testing
const OFFLINE_PLACES_DB: Record<string, GooglePlaceInfo[]> = {
  nagpur: [
    { name: 'Deekshabhoomi Stupa', rating: 4.8, address: 'South Ambazari Road, Nagpur', lat: 21.1272, lng: 79.0682, types: ['tourist_attraction', 'point_of_interest'] },
    { name: 'Futala Lake & Fountain Show', rating: 4.5, address: 'Jawaharlal Nehru Marg, Nagpur', lat: 21.1478, lng: 79.0435, types: ['tourist_attraction', 'park'] },
    { name: 'Sitabuldi Fort', rating: 4.3, address: 'Sitabuldi, Nagpur', lat: 21.1492, lng: 79.0881, types: ['tourist_attraction', 'landmark'] },
    { name: 'Zero Mile Stone Monument', rating: 4.2, address: 'Wardha Road, Civil Lines, Nagpur', lat: 21.1481, lng: 79.0805, types: ['tourist_attraction', 'historical_monument'] },
    { name: 'Ramtek Fort Temple', rating: 4.7, address: 'Ramtek Hills, Nagpur District', lat: 21.3986, lng: 79.3278, types: ['tourist_attraction', 'hindu_temple'] },
    { name: 'Maharajbagh Zoo', rating: 4.0, address: 'Amravati Road, Nagpur', lat: 21.1441, lng: 79.0734, types: ['tourist_attraction', 'zoo'] },
    { name: 'Jagdish Saoji Bhojanalay', rating: 4.6, address: 'Gandhibagh, Nagpur', lat: 21.1554, lng: 79.1085, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Veeraswami South Indian Cafe', rating: 4.4, address: 'Mount Road, Sadar, Nagpur', lat: 21.1625, lng: 79.0815, types: ['cafe', 'food'], isMeal: true },
    { name: 'The Breakfast Club Cafe', rating: 4.5, address: 'Dharampeth, Nagpur', lat: 21.1398, lng: 79.0624, types: ['cafe', 'food'], isMeal: true },
    { name: 'Barbeque Nation Nagpur', rating: 4.5, address: 'Eternity Mall, Sitabuldi, Nagpur', lat: 21.1418, lng: 79.0822, types: ['restaurant', 'food'], isMeal: true }
  ],
  nagasaki: [
    { name: 'Nagasaki Peace Park', rating: 4.7, address: 'Matsuyamamachi, Nagasaki', lat: 32.7745, lng: 129.8633, types: ['tourist_attraction', 'park'] },
    { name: 'Glover Garden', rating: 4.5, address: 'Minamiyamate-machi, Nagasaki', lat: 32.7323, lng: 129.8697, types: ['tourist_attraction', 'museum'] },
    { name: 'Mount Inasa Observatory', rating: 4.8, address: 'Inasayama, Nagasaki', lat: 32.7533, lng: 129.8497, types: ['tourist_attraction', 'viewpoint'] },
    { name: 'Nagasaki Chinatown (Shinchi)', rating: 4.1, address: 'Shinchimachi, Nagasaki', lat: 32.7422, lng: 129.8755, types: ['tourist_attraction', 'shopping'] },
    { name: 'Oura Church', rating: 4.4, address: 'Minamiyamate-machi, Nagasaki', lat: 32.7341, lng: 129.8702, types: ['tourist_attraction', 'church'] },
    { name: 'Megane Bridge (Spectacles Bridge)', rating: 4.3, address: 'Uonomachi, Nagasaki', lat: 32.7471, lng: 129.8801, types: ['tourist_attraction', 'landmark'] },
    { name: 'Shikairou Chinese Restaurant', rating: 4.3, address: 'Matsugaemachi, Nagasaki', lat: 32.7352, lng: 129.8691, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Yossou Champon Bistro', rating: 4.4, address: 'Hamamachi, Nagasaki', lat: 32.7441, lng: 129.8785, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Attic Coffee Shop', rating: 4.3, address: 'Dejimamachi, Nagasaki', lat: 32.7431, lng: 129.8688, types: ['cafe', 'food'], isMeal: true }
  ],
  mumbai: [
    { name: 'Gateway of India', rating: 4.7, address: 'Apollo Bandar, Colaba, Mumbai', lat: 18.9220, lng: 72.8347, types: ['tourist_attraction', 'historical_monument'] },
    { name: 'Marine Drive Promenade', rating: 4.8, address: 'Netaji Subhash Chandra Bose Road, Mumbai', lat: 18.9431, lng: 72.8230, types: ['tourist_attraction', 'park'] },
    { name: 'Chhatrapati Shivaji Maharaj Terminus (CST)', rating: 4.7, address: 'Fort, Mumbai', lat: 18.9400, lng: 72.8354, types: ['tourist_attraction', 'landmark'] },
    { name: 'Elephanta Caves', rating: 4.6, address: 'Gharapuri, Mumbai Harbour', lat: 18.9633, lng: 72.9315, types: ['tourist_attraction', 'cave_temple'] },
    { name: 'Haji Ali Dargah', rating: 4.6, address: 'Dargah Road, Lala Lajpat Rai Marg, Mumbai', lat: 18.9827, lng: 72.8089, types: ['tourist_attraction', 'mosque'] },
    { name: 'Traditional Vada Pav Stall', rating: 4.8, address: 'Near Mithibai College, Vile Parle, Mumbai', lat: 19.1028, lng: 72.8375, types: ['restaurant', 'street_food'], isMeal: true },
    { name: 'Sardar Refreshments Pav Bhaji', rating: 4.4, address: 'Tardeo Road, Junction, Mumbai', lat: 18.9712, lng: 72.8135, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Mahesh Lunch Home Seafood', rating: 4.5, address: 'Cawasji Patel Rd, Fort, Mumbai', lat: 18.9328, lng: 72.8331, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Bademiya Kebabs', rating: 4.0, address: 'Tulloch Road, Apollo Bandar, Mumbai', lat: 18.9225, lng: 72.8329, types: ['restaurant', 'food'], isMeal: true }
  ],
  delhi: [
    { name: 'Red Fort Complex', rating: 4.6, address: 'Netaji Subhash Marg, Chandni Chowk, Delhi', lat: 28.6562, lng: 77.2410, types: ['tourist_attraction', 'fort'] },
    { name: 'Qutub Minar Complex', rating: 4.7, address: 'Mehrauli, New Delhi', lat: 28.5244, lng: 77.1855, types: ['tourist_attraction', 'landmark'] },
    { name: 'India Gate', rating: 4.7, address: 'Rajpath, New Delhi', lat: 28.6129, lng: 77.2295, types: ['tourist_attraction', 'war_memorial'] },
    { name: 'Lotus Temple', rating: 4.5, address: 'Kalkaji, New Delhi', lat: 28.5535, lng: 77.2588, types: ['tourist_attraction', 'temple'] },
    { name: 'Humayuns Tomb Gardens', rating: 4.8, address: 'Nizamuddin East, New Delhi', lat: 28.5933, lng: 77.2507, types: ['tourist_attraction', 'tomb'] },
    { name: 'Gali Paranthe Wali', rating: 4.3, address: 'Chandni Chowk, Delhi', lat: 28.6558, lng: 77.2302, types: ['restaurant', 'street_food'], isMeal: true },
    { name: 'Karims Restaurant Mughlai', rating: 4.4, address: 'Gali Kababian, Jama Masjid, Delhi', lat: 28.6508, lng: 77.2335, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Moti Mahal Butter Chicken', rating: 4.2, address: 'Daryaganj, New Delhi', lat: 28.6482, lng: 77.2408, types: ['restaurant', 'food'], isMeal: true }
  ],
  goa: [
    { name: 'Basilica of Bom Jesus', rating: 4.7, address: 'Old Goa, Panaji', lat: 15.5009, lng: 73.9116, types: ['tourist_attraction', 'church'] },
    { name: 'Fort Aguada Overlook', rating: 4.5, address: 'Candolim, Goa', lat: 15.4925, lng: 73.7736, types: ['tourist_attraction', 'fort'] },
    { name: 'Calangute Beach Shacks', rating: 4.4, address: 'Calangute, North Goa', lat: 15.5494, lng: 73.7535, types: ['tourist_attraction', 'beach'] },
    { name: 'Latin Quarter of Fontainhas', rating: 4.6, address: 'Panaji, Goa', lat: 15.4989, lng: 73.8078, types: ['tourist_attraction', 'landmark'] },
    { name: 'Ritz Classic Fish Thali', rating: 4.5, address: '18th June Road, Panaji, Goa', lat: 15.4962, lng: 73.8072, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Brittos Beach Shack', rating: 4.3, address: 'Baga Beach, North Goa', lat: 15.5558, lng: 73.7517, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Mums Kitchen Portuguese Goan', rating: 4.4, address: 'Miramar, Panaji, Goa', lat: 15.4878, lng: 73.8095, types: ['restaurant', 'food'], isMeal: true }
  ],
  tokyo: [
    { name: 'Senso-ji Temple', rating: 4.7, address: 'Asakusa, Taito City, Tokyo', lat: 35.7148, lng: 139.7967, types: ['tourist_attraction', 'temple'] },
    { name: 'Shibuya Crossing', rating: 4.5, address: 'Dogenzaka, Shibuya City, Tokyo', lat: 35.6595, lng: 139.7005, types: ['tourist_attraction', 'landmark'] },
    { name: 'Meiji Jingu Shrine', rating: 4.6, address: 'Yoyogikamizonocho, Shibuya City, Tokyo', lat: 35.6764, lng: 139.6993, types: ['tourist_attraction', 'shrine'] },
    { name: 'Ichiran Ramen Shinjuku', rating: 4.5, address: 'Shinjuku City, Tokyo', lat: 35.6908, lng: 139.7032, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Tsukiji Sushizanmai Fish Market', rating: 4.3, address: 'Tsukiji, Chuo City, Tokyo', lat: 35.6655, lng: 139.7719, types: ['restaurant', 'food'], isMeal: true }
  ],
  paris: [
    { name: 'Eiffel Tower', rating: 4.7, address: 'Champ de Mars, Paris', lat: 48.8584, lng: 2.2945, types: ['tourist_attraction', 'landmark'] },
    { name: 'Louvre Museum', rating: 4.7, address: 'Rue de Rivoli, Paris', lat: 48.8606, lng: 2.3376, types: ['tourist_attraction', 'museum'] },
    { name: 'Arc de Triomphe', rating: 4.7, address: 'Place Charles de Gaulle, Paris', lat: 48.8738, lng: 2.2950, types: ['tourist_attraction', 'historical_monument'] },
    { name: 'Le Relais de l Entrecote', rating: 4.4, address: 'Rue Marbeuf, Paris', lat: 48.8698, lng: 2.3025, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Angelina Cafe Hot Chocolate', rating: 4.3, address: 'Rue de Rivoli, Paris', lat: 48.8631, lng: 2.3276, types: ['cafe', 'food'], isMeal: true }
  ],
  zurich: [
    { name: 'Grossmunster Church', rating: 4.6, address: 'Grossmunsterplatz, Zurich', lat: 47.3701, lng: 8.5440, types: ['tourist_attraction', 'church'] },
    { name: 'Lake Zurich Promenade', rating: 4.8, address: 'Mythenquai, Zurich', lat: 47.3631, lng: 8.5398, types: ['tourist_attraction', 'park'] },
    { name: 'Zeughauskeller traditional swiss', rating: 4.4, address: 'Bahnhofstrasse, Zurich', lat: 47.3703, lng: 8.5395, types: ['restaurant', 'food'], isMeal: true },
    { name: 'Cafe Sprungli Luxemburgerli', rating: 4.5, address: 'Paradeplatz, Zurich', lat: 47.3698, lng: 8.5392, types: ['cafe', 'food'], isMeal: true }
  ]
}

const GLOBAL_DEFAULT_PLACES: GooglePlaceInfo[] = [
  { name: 'City Historic Center', rating: 4.5, address: 'Downtown Square', lat: 0, lng: 0, types: ['tourist_attraction', 'landmark'] },
  { name: 'Central Museum of Art & History', rating: 4.6, address: 'Cultural Ave', lat: 0.005, lng: -0.005, types: ['tourist_attraction', 'museum'] },
  { name: 'Panoramic Botanical Gardens', rating: 4.7, address: 'Greenery Loop Road', lat: -0.008, lng: 0.008, types: ['tourist_attraction', 'park'] },
  { name: 'Local Food Market Hall', rating: 4.4, address: 'Market Street', lat: 0.002, lng: 0.004, types: ['tourist_attraction', 'shopping'] },
  { name: 'Traditional Old Town Bistro', rating: 4.5, address: 'Bistro Lane', lat: -0.003, lng: -0.002, types: ['restaurant', 'food'], isMeal: true },
  { name: 'Secret Courtyard Tea Room', rating: 4.7, address: 'Flower Alley', lat: 0.004, lng: -0.006, types: ['cafe', 'food'], isMeal: true },
  { name: 'Lakeside Grill & Barbecue', rating: 4.6, address: 'Shoreline Road', lat: 0.006, lng: 0.009, types: ['restaurant', 'food'], isMeal: true }
]

export async function getGooglePlaceSuggestions(query: string): Promise<{ success: boolean; predictions: PlacePrediction[] }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    // Return high-fidelity local suggestions for "Nag..." and other cities to keep autocomplete perfect
    const norm = query.toLowerCase()
    const allMatches = [
      { name: 'Nagpur', desc: 'Maharashtra, India' },
      { name: 'Nagaland', desc: 'State in Northeast India' },
      { name: 'Nagasaki', desc: 'Kyushu Island, Japan' },
      { name: 'Mumbai', desc: 'Maharashtra, India' },
      { name: 'Delhi', desc: 'National Capital Territory, India' },
      { name: 'Goa', desc: 'Coastal State, India' },
      { name: 'Tokyo', desc: 'Kanto Region, Japan' },
      { name: 'Paris', desc: 'Île-de-France, France' },
      { name: 'Zurich', desc: 'Zurich Canton, Switzerland' }
    ]

    const filtered = allMatches
      .filter(item => item.name.toLowerCase().includes(norm))
      .map((item, idx) => ({
        description: `${item.name}, ${item.desc}`,
        placeId: `mock_place_${item.name.toLowerCase()}_${idx}`,
        mainText: item.name,
        secondaryText: item.desc
      }))

    return { success: true, predictions: filtered }
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'OK' && data.predictions) {
        const mapped = data.predictions.map((p: any) => ({
          description: p.description,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || ''
        }))
        return { success: true, predictions: mapped }
      }
    }
  } catch (error) {
    console.error('Error fetching from Google Places API:', error)
  }

  return { success: false, predictions: [] }
}

export async function getGooglePlacesForCity(destination: string): Promise<GooglePlaceInfo[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const norm = destination.toLowerCase().trim()

  // 1. If no key, look up offline matching details
  if (!apiKey) {
    for (const key of Object.keys(OFFLINE_PLACES_DB)) {
      if (norm.includes(key)) {
        return OFFLINE_PLACES_DB[key]
      }
    }
    // Return default offline places with relative offset coordinate structures
    return GLOBAL_DEFAULT_PLACES
  }

  // 2. Fetch live data using Places Text Search API
  try {
    const fetchPlaces = async (query: string): Promise<GooglePlaceInfo[]> => {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'OK' && data.results) {
          return data.results.slice(0, 10).map((r: any) => ({
            name: r.name,
            rating: r.rating || 4.5,
            address: r.formatted_address || '',
            lat: r.geometry?.location?.lat || 0,
            lng: r.geometry?.location?.lng || 0,
            types: r.types || []
          }))
        }
      }
      return []
    }

    // Fire parallel requests for local attractions and meals
    const [attractions, meals] = await Promise.all([
      fetchPlaces(`tourist attractions and sightseeing points in ${destination}`),
      fetchPlaces(`best cafes and restaurants food places in ${destination}`)
    ])

    const mealPlaces = meals.map((m: GooglePlaceInfo) => ({ ...m, isMeal: true }))
    return [...attractions, ...mealPlaces]
  } catch (error) {
    console.error('Error querying Google Places TextSearch API:', error)
  }

  // Fallback to local db if API throws error
  for (const key of Object.keys(OFFLINE_PLACES_DB)) {
    if (norm.includes(key)) {
      return OFFLINE_PLACES_DB[key]
    }
  }
  return GLOBAL_DEFAULT_PLACES
}

export async function getGoogleMapsApiKey(): Promise<string> {
  return process.env.GOOGLE_MAPS_API_KEY || ''
}
