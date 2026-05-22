'use client'

import { useEffect, useRef, useState } from 'react'

interface Activity {
  name: string
  lat?: number
  lng?: number
  time?: string
  isMeal?: boolean
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

  const [mapLoaded, setMapLoaded] =
    useState(false)

  const [apiError, setApiError] =
    useState(false)

  const points = activities.filter(
    (act) =>
      act.lat !== undefined &&
      act.lng !== undefined &&
      act.lat !== 0 &&
      act.lng !== 0
  ) as Required<
    Pick<
      Activity,
      'name' | 'lat' | 'lng' | 'time' | 'isMeal'
    >
  >[]

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

    let script =
      document.getElementById(
        scriptId
      ) as HTMLScriptElement | null

    const handleLoad = () => {
      setMapLoaded(true)
      setApiError(false)
    }

    const handleError = () => {
      console.error(
        'Google Maps script failed to load'
      )

      setApiError(true)
    }

    if (!script) {

      script = document.createElement('script')

      script.id = scriptId

      script.src =
        `https://maps.googleapis.com/maps/api/js` +
        `?key=${apiKey}` +
        `&libraries=places`

      script.async = true
      script.defer = true

      script.onload = handleLoad
      script.onerror = handleError

      document.head.appendChild(script)

    } else {

      script.addEventListener(
        'load',
        handleLoad
      )

      script.addEventListener(
        'error',
        handleError
      )
    }

    return () => {

      script?.removeEventListener(
        'load',
        handleLoad
      )

      script?.removeEventListener(
        'error',
        handleError
      )
    }

  }, [apiKey])

  // INITIALIZE MAP
  useEffect(() => {

    if (
      !mapLoaded ||
      !mapRef.current ||
      points.length === 0
    ) {
      return
    }

    try {

      const google =
        (window as any).google

      if (!google?.maps) {
        setApiError(true)
        return
      }

      const map = new google.maps.Map(
        mapRef.current,
        {
          center: {
            lat: points[0].lat,
            lng: points[0].lng
          },

          zoom: 12,

          disableDefaultUI: true,

          zoomControl: true,

          styles: [
            {
              elementType: 'geometry',
              stylers: [
                { color: '#18181b' }
              ]
            },
            {
              elementType:
                'labels.text.fill',
              stylers: [
                { color: '#71717a' }
              ]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [
                { color: '#27272a' }
              ]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [
                { color: '#09090b' }
              ]
            }
          ]
        }
      )

      const bounds =
        new google.maps.LatLngBounds()

      const pathCoordinates: any[] = []

      points.forEach((point, idx) => {

        const position = {
          lat: point.lat,
          lng: point.lng
        }

        bounds.extend(position)

        pathCoordinates.push(position)

        const marker =
          new google.maps.Marker({

            position,

            map,

            title: point.name,

            label: {
              text: (idx + 1).toString(),
              color: 'white',
              fontWeight: 'bold'
            },

            icon: {
              path:
                google.maps.SymbolPath.CIRCLE,

              fillColor: point.isMeal
                ? '#a78bfa'
                : '#6366f1',

              fillOpacity: 0.9,

              strokeColor: '#ffffff',

              strokeWeight: 2,

              scale: 14
            }
          })

        const infoWindow =
          new google.maps.InfoWindow({

            content: `
              <div style="
                color:#111827;
                padding:8px;
                font-family:sans-serif;
              ">
                <div style="
                  font-size:10px;
                  font-weight:800;
                  color:#4f46e5;
                  text-transform:uppercase;
                ">
                  ${point.time || ''}
                </div>

                <div style="
                  font-size:13px;
                  font-weight:700;
                  margin-top:4px;
                ">
                  ${point.name}
                </div>
              </div>
            `
          })

        marker.addListener(
          'click',
          () => {
            infoWindow.open({
              anchor: marker,
              map
            })
          }
        )
      })

      if (points.length > 1) {
        map.fitBounds(bounds)
      }

      const routeLine =
        new google.maps.Polyline({

          path: pathCoordinates,

          geodesic: true,

          strokeColor: '#6366f1',

          strokeOpacity: 0.7,

          strokeWeight: 4
        })

      routeLine.setMap(map)

    } catch (error) {

      console.error(
        'Error rendering Google Map:',
        error
      )

      setApiError(true)
    }

  }, [mapLoaded, points])

  // FALLBACK UI
  if (apiError || points.length === 0) {

    return (
      <div className="
        w-full
        h-80
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
        flex
        items-center
        justify-center
        text-zinc-500
        text-sm
      ">
        Google Maps unavailable
      </div>
    )
  }

  return (
    <div className="
      relative
      w-full
      h-80
      rounded-3xl
      overflow-hidden
      border
      border-zinc-800
      bg-zinc-950
    ">
      <div
        ref={mapRef}
        className="w-full h-full"
      />
    </div>
  )
}