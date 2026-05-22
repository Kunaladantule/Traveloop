// components/GoogleMapWidget.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface Activity {
  name: string
  lat?: number
  lng?: number
  time?: string
  isMeal?: boolean
  expense?: number
}

interface Props {
  activities: Activity[]
  apiKey?: string
}

export function GoogleMapWidget({
  activities,
  apiKey
}: Props) {

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [apiError, setApiError] = useState(false)

  // Filter valid points
  const points = useMemo(
    () => activities.filter(
      (act) =>
        act.lat !== undefined &&
        act.lng !== undefined &&
        act.lat !== 0 &&
        act.lng !== 0
    ) as Required<
      Pick<Activity, 'name' | 'lat' | 'lng' | 'time' | 'isMeal'>
    >[],
    [activities]
  )

  // LOAD GOOGLE MAPS SCRIPT
  useEffect(() => {
    if (!apiKey) {
      setApiError(true)
      return
    }

    if ((window as any).google?.maps) {
      setMapLoaded(true)
      return
    }

    const scriptId = 'google-maps-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    const handleLoad = () => {
      setMapLoaded(true)
      setApiError(false)
    }

    const handleError = () => {
      console.error('Google Maps script failed to load')
      setApiError(true)
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = handleLoad
      script.onerror = handleError
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', handleLoad)
      script.addEventListener('error', handleError)
    }

    return () => {
      script?.removeEventListener('load', handleLoad)
      script?.removeEventListener('error', handleError)
    }
  }, [apiKey])

  // INITIALIZE MAP
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || points.length === 0 || mapInstanceRef.current) {
      return
    }

    try {
      const google = (window as any).google
      if (!google?.maps) {
        setApiError(true)
        return
      }

      // Calculate center point
      const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
      const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length

      // Create map with LIGHT THEME
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 13,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          // Light, clean map style
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#334155' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f1f5f9' }, { weight: 1.5 }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text',
            stylers: [{ color: '#64748b' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#dbeafe' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f8fafc' }]
          }
        ]
      })

      mapInstanceRef.current = map

      const bounds = new google.maps.LatLngBounds()
      const pathCoordinates: any[] = []

      // Create custom markers
      points.forEach((point, idx) => {
        const position = { lat: point.lat, lng: point.lng }
        bounds.extend(position)
        pathCoordinates.push(position)

        // Custom marker icon with number
        const markerColor = point.isMeal ? '#f59e0b' : '#6366f1' // Amber for meals, Indigo for activities
        
        const marker = new google.maps.Marker({
          position,
          map,
          title: point.name,
          label: {
            text: (idx + 1).toString(),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
            scale: 18
          },
          animation: google.maps.Animation.DROP
        })

        // Enhanced info window
        const infoContent = `
          <div style="
            font-family: 'Inter', sans-serif;
            padding: 12px;
            max-width: 220px;
          ">
            <div style="
              font-size: 11px;
              font-weight: 700;
              color: #6366f1;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            ">
              ${point.time || 'Scheduled'}
            </div>
            <div style="
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              line-height: 1.4;
              margin-bottom: 8px;
            ">
              ${point.name}
            </div>
            ${point.expense ? `
              <div style="
                display: inline-block;
                background: #dcfce7;
                color: #166534;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
              ">
                💰 ${point.expense > 0 ? '$' + point.expense : 'Free'}
              </div>
            ` : ''}
          </div>
        `

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
          maxWidth: 250
        })

        marker.addListener('click', () => {
          // Close all other info windows
          markers.forEach(m => m.infoWindow.close())
          infoWindow.open({ anchor: marker, map })
        })

        // Store reference to close later
        ;(marker as any).infoWindow = infoWindow
      })

      // Store markers for closing
      const markers: any[] = []
      points.forEach((point, idx) => {
        const position = { lat: point.lat, lng: point.lng }
        const markerColor = point.isMeal ? '#f59e0b' : '#6366f1'
        
        const marker = new google.maps.Marker({
          position,
          map,
          title: point.name,
          label: {
            text: (idx + 1).toString(),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
            scale: 18
          }
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: sans-serif; padding: 10px; max-width: 200px;">
              <div style="font-size: 11px; color: #6366f1; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                ${point.time || ''}
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
                ${point.name}
              </div>
              ${point.expense ? `<div style="margin-top: 6px; font-size: 12px; color: #166534; font-weight: 600;">💰 ${point.expense > 0 ? '$' + point.expense : 'Free'}</div>` : ''}
            </div>
          `
        })

        marker.addListener('click', () => {
          markers.forEach(m => m.infoWindow.close())
          infoWindow.open({ anchor: marker, map })
        })

        ;(marker as any).infoWindow = infoWindow
        markers.push(marker)
      })

      // Draw route line with better visibility
      if (points.length > 1) {
        new google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: '#6366f1',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map
        })

        // Fit bounds with padding
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const padding = 60
          const ne = map.getBounds().getNorthEast()
          const sw = map.getBounds().getSouthWest()
          map.panToBounds(
            new google.maps.LatLngBounds(
              new google.maps.LatLng(
                sw.lat() + (ne.lat() - sw.lat()) * 0.1,
                sw.lng() + (ne.lng() - sw.lng()) * 0.1
              ),
              new google.maps.LatLng(
                ne.lat() - (ne.lat() - sw.lat()) * 0.1,
                ne.lng() - (ne.lng() - sw.lng()) * 0.1
              )
            ),
            padding
          )
        })

        map.fitBounds(bounds)
      }

    } catch (error) {
      console.error('Error rendering Google Map:', error)
      setApiError(true)
    }
  }, [mapLoaded, points])

  // Loading state
  if (!mapLoaded && !apiError) {
    return (
      <div className="w-full h-80 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium">Loading map...</span>
      </div>
    )
  }

  // Error or no points state
  if (apiError || points.length === 0) {
    return (
      <div className="w-full h-80 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-sm font-medium">
          {apiError ? 'Map unavailable' : 'No locations to display'}
        </span>
        {points.length === 0 && (
          <span className="text-xs text-slate-400 mt-1">Add activities with coordinates to see the route</span>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full h-80 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
        <div className="text-xs font-semibold text-slate-700 mb-2">Route Legend</div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
            <span className="text-slate-600">Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
            <span className="text-slate-600">Meal</span>
          </div>
        </div>
      </div>

      {/* Total points badge */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 shadow-lg">
        <div className="text-xs font-semibold text-slate-700">
          {points.length} Locations
        </div>
      </div>
    </div>
  )
}