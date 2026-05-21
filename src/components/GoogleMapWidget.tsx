'use client'

import { useEffect, useRef, useState } from 'react'

interface Activity {
  name: string
  lat?: number
  lng?: number
  time?: string
  isMeal?: boolean
}

export function GoogleMapWidget({ activities, apiKey }: { activities: Activity[]; apiKey?: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [apiError, setApiError] = useState(false)

  // Filter activities with valid coordinates
  const points = activities.filter(act => act.lat !== undefined && act.lng !== undefined && act.lat !== 0 && act.lng !== 0) as Required<Pick<Activity, 'name' | 'lat' | 'lng' | 'time' | 'isMeal'>>[]

  useEffect(() => {
    if (!apiKey) {
      setApiError(true)
      return
    }

    // Check if google maps script is already loaded
    if ((window as any).google?.maps) {
      setMapLoaded(true)
      return
    }

    const scriptId = 'google-maps-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      script.onerror = () => setApiError(true)
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', () => setMapLoaded(true))
      script.addEventListener('error', () => setApiError(true))
    }
  }, [apiKey])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || points.length === 0) return

    try {
      const google = (window as any).google
      const mapOptions = {
        center: { lat: points[0].lat, lng: points[0].lng },
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#18181b' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#18181b' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#a1a1aa' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6366f1' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#18181b' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#3f3f46' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#27272a' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#18181b' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#a1a1aa' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#3f3f46' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#18181b' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#e4e4e7' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#27272a' }]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#a1a1aa' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#09090b' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#3f3f46' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#09090b' }]
          }
        ],
        disableDefaultUI: true,
        zoomControl: true
      }

      const map = new google.maps.Map(mapRef.current, mapOptions)
      const bounds = new google.maps.LatLngBounds()

      const markers: any[] = []
      const pathCoordinates: any[] = []

      points.forEach((point, idx) => {
        const position = { lat: point.lat, lng: point.lng }
        bounds.extend(position)
        pathCoordinates.push(position)

        // Custom styled marker pin
        const marker = new google.maps.Marker({
          position,
          map,
          title: point.name,
          label: {
            text: (idx + 1).toString(),
            color: 'white',
            fontWeight: 'bold'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: point.isMeal ? '#a78bfa' : '#6366f1',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 14
          }
        })

        // Info Window on hover/click
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #111827; font-family: sans-serif; padding: 6px; max-width: 200px;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #4f46e5;">${point.time || ''}</div>
              <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">${point.name}</div>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        markers.push(marker)
      })

      // Adjust map bounds to fit all markers
      if (points.length > 1) {
        map.fitBounds(bounds)
      }

      // Draw polyline connecting stops
      const flightPath = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#6366f1',
        strokeOpacity: 0.6,
        strokeWeight: 3,
        icons: [
          {
            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2, strokeColor: '#818cf8' },
            offset: '50%',
            repeat: '100px'
          }
        ]
      })

      flightPath.setMap(map)
    } catch (err) {
      console.error('Error rendering google map:', err)
    }
  }, [mapLoaded, points])

  if (apiError || points.length === 0) {
    // Return simulated layout
    return (
      <div className="relative w-full h-80 rounded-3xl border border-zinc-800/80 bg-zinc-950/40 overflow-hidden flex flex-col justify-center items-center backdrop-blur-md shadow-inner group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
        <div className="absolute w-64 h-28 border-2 border-dashed border-indigo-500/25 rounded-full animate-pulse top-24 left-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 px-6 text-center flex-col">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-200 uppercase tracking-widest">Interactive Smart Route Map</h4>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
              Plotting {points.length} stops across custom coordinates. Add a GOOGLE_MAPS_API_KEY to see live maps.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            {points.map((pt, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:border-zinc-700 transition-colors">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-bold ${pt.isMeal ? 'bg-purple-650' : 'bg-indigo-650'}`}>
                  {idx + 1}
                </span>
                <span className="truncate max-w-[80px]">{pt.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-80 rounded-3xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-2xl">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
