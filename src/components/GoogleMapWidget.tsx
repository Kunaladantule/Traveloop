// components/GoogleMapWidget.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Shared Neumorphic tokens
const NEU = {
  raised:  '8px 8px 18px rgba(139,120,112,.18), -8px -8px 18px rgba(255,255,255,.9)',
  pressed: 'inset 4px 4px 8px rgba(139,120,112,.2), inset -4px -4px 8px rgba(255,255,255,.9)',
}

export interface Activity {
  name: string
  lat?: number
  lng?: number
  time?: string
  isMeal?: boolean
  expense?: number
}

interface Props {
  activities: Activity[] // Global list of activities (all days)
  apiKey?: string
  mapMode?: 'clean' | 'day' | 'single' | 'nearby'
  focusedActivities?: Activity[] // Passed in when mode is day, single, or nearby
}

export function GoogleMapWidget({
  activities,
  apiKey,
  mapMode = 'clean',
  focusedActivities = []
}: Props) {

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [apiError, setApiError] = useState(false)

  // Filter valid global points (just to determine if we have data)
  const allPoints = useMemo(
    () => activities.filter(
      (act) => act.lat !== undefined && act.lng !== undefined && act.lat !== 0 && act.lng !== 0
    ) as (Activity & { lat: number; lng: number })[],
    [activities]
  )

  // Filter valid points to render based on the mode
  const renderPoints = useMemo(() => {
    if (mapMode === 'clean') return []
    return focusedActivities.filter(
      (act) => act.lat !== undefined && act.lng !== undefined && act.lat !== 0 && act.lng !== 0
    ) as (Activity & { lat: number; lng: number })[]
  }, [mapMode, focusedActivities])

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

  // INITIALIZE MAP & UPDATE MARKERS
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    try {
      const google = (window as any).google
      if (!google?.maps) {
        setApiError(true)
        return
      }

      // 1. Create Map Instance if it doesn't exist
      if (!mapInstanceRef.current) {
        const centerLat = allPoints.length > 0 ? allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length : 20
        const centerLng = allPoints.length > 0 ? allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length : 0

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#2E2523' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }, { weight: 1.5 }] },
            { featureType: 'road', elementType: 'labels.text', stylers: [{ color: '#64748b' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbeafe' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] }
          ]
        })
        mapInstanceRef.current = map
      }

      const map = mapInstanceRef.current

      // 2. Clear previous markers and polyline
      markersRef.current.forEach(m => m.setMap(null))
      markersRef.current = []
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
        polylineRef.current = null
      }

      // 3. If clean mode or no render points, just fit to global points (or keep centered)
      if (renderPoints.length === 0) {
        if (allPoints.length > 0) {
           const bounds = new google.maps.LatLngBounds()
           allPoints.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
           map.fitBounds(bounds)
        }
        return
      }

      // 4. Create new markers
      const bounds = new google.maps.LatLngBounds()
      const pathCoordinates: any[] = []

      renderPoints.forEach((point, idx) => {
        const position = { lat: point.lat, lng: point.lng }
        bounds.extend(position)
        pathCoordinates.push(position)

        let markerColor = point.isMeal ? '#F59E0B' : '#810100'
        let labelText = ''
        
        // Use letters (A, B, C) if day mode, otherwise just a solid circle
        if (mapMode === 'day') {
           labelText = String.fromCharCode(65 + (idx % 26))
        } else if (mapMode === 'nearby' && idx > 0) {
           markerColor = '#9B8E8C' // nearby mocked spots
        }

        const marker = new google.maps.Marker({
          position,
          map,
          title: point.name,
          label: labelText ? { text: labelText, color: 'white', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Inter, sans-serif' } : null,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
            scale: labelText ? 14 : 10
          },
          animation: google.maps.Animation.DROP
        })

        // Info window content
        const infoContent = `
          <div style="font-family: 'Inter', sans-serif; padding: 10px; max-width: 220px;">
            ${point.time ? `<div style="font-size: 11px; font-weight: 800; color: #810100; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">${point.time}</div>` : ''}
            <div style="font-size: 14px; font-weight: 700; color: #1B1716; line-height: 1.4; margin-bottom: 8px;">${point.name}</div>
          </div>
        `
        const infoWindow = new google.maps.InfoWindow({ content: infoContent, maxWidth: 250 })

        marker.addListener('click', () => {
          markersRef.current.forEach(m => m.infoWindow?.close())
          infoWindow.open({ anchor: marker, map })
        })
        ;(marker as any).infoWindow = infoWindow
        markersRef.current.push(marker)
      })

      // 5. Draw route line ONLY if mode is 'day'
      if (mapMode === 'day' && renderPoints.length > 1) {
        polylineRef.current = new google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: '#810100',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map
        })
      }

      // 6. Adjust viewport
      if (renderPoints.length === 1 && mapMode === 'single') {
        map.setCenter({ lat: renderPoints[0].lat, lng: renderPoints[0].lng })
        map.setZoom(16)
      } else {
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
  }, [mapLoaded, renderPoints, mapMode, allPoints])

  // Loading state
  if (!mapLoaded && !apiError) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: 400, background: '#FFFFFF', borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid rgba(129,1,0,.2)', borderTop: '4px solid #810100', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9B8E8C', fontFamily: 'Inter, sans-serif' }}>Loading map...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Error state
  if (apiError) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: 400, background: '#FFFFFF', borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F5F3EA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg style={{ width: 32, height: 32, color: '#810100' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>Map unavailable</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, background: '#FFFFFF', borderRadius: 28, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />
      
      {/* Legend overlay ONLY in day mode */}
      {mapMode === 'day' && (
        <div style={{
          position: 'absolute', bottom: 20, left: 20,
          background: '#F5F3EA', borderRadius: 20, padding: '12px 16px',
          boxShadow: NEU.raised, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B5E5C', fontFamily: 'Inter, sans-serif' }}>Route Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#810100', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,.1)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>Activity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,.1)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1B1716', fontFamily: 'Inter, sans-serif' }}>Meal</span>
            </div>
          </div>
        </div>
      )}

      {/* Info badge */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        background: '#F5F3EA', borderRadius: 16, padding: '8px 14px',
        boxShadow: NEU.raised, fontSize: '0.8rem', fontWeight: 700, color: '#810100', fontFamily: 'Inter, sans-serif'
      }}>
        {mapMode === 'clean' ? 'Map View' : mapMode === 'day' ? `${renderPoints.length} Stops Today` : 'Location Selected'}
      </div>
    </div>
  )
}