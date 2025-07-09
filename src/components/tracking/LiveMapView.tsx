import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Navigation, MapPin, RotateCcw, Maximize, Car, Users, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const GOOGLE_MAPS_API_KEY = 'AIzaSyAejqe2t4TAptcLnkpoFTTNMhm0SFHFJgQ'

interface TrackingData {
  driver: {
    id: string
    full_name: string
    status: string
    current_latitude?: number
    current_longitude?: number
    phone_no: string
    rating?: number
  }
  booking?: {
    id: string
    pickup_address?: string
    dropoff_address?: string
    pickup_latitude?: number
    pickup_longitude?: number
    dropoff_latitude?: number
    dropoff_longitude?: number
    status: string
  }
  vehicle?: {
    make?: string
    model?: string
    type?: string
    license_plate?: string
  }
}

declare global {
  interface Window {
    google: any
  }
}

export const LiveMapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapLoaded) return

    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      })

      await loader.load()

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // Delhi center
        zoom: 11,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      mapInstanceRef.current = map
      directionsServiceRef.current = new window.google.maps.DirectionsService()
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
      directionsRendererRef.current.setMap(map)

      setMapLoaded(true)
    } catch (error) {
      console.error('Error loading Google Maps:', error)
    }
  }, [mapLoaded])

  // Fetch tracking data
  const fetchTrackingData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          id,
          full_name,
          status,
          current_latitude,
          current_longitude,
          phone_no,
          rating,
          bookings!inner (
            id,
            pickup_address,
            dropoff_address,
            pickup_latitude,
            pickup_longitude,
            dropoff_latitude,
            dropoff_longitude,
            status,
            vehicle:vehicles (
              make,
              model,
              type,
              license_plate
            )
          )
        `)
        .eq('status', 'active')
        .in('bookings.status', ['accepted', 'started'])

      if (error) throw error

      const formattedData: TrackingData[] = (data || []).map(driver => ({
        driver: {
          id: driver.id,
          full_name: driver.full_name,
          status: driver.status,
          current_latitude: driver.current_latitude,
          current_longitude: driver.current_longitude,
          phone_no: driver.phone_no,
          rating: driver.rating
        },
        booking: driver.bookings?.[0] ? {
          id: driver.bookings[0].id,
          pickup_address: driver.bookings[0].pickup_address,
          dropoff_address: driver.bookings[0].dropoff_address,
          pickup_latitude: driver.bookings[0].pickup_latitude,
          pickup_longitude: driver.bookings[0].pickup_longitude,
          dropoff_latitude: driver.bookings[0].dropoff_latitude,
          dropoff_longitude: driver.bookings[0].dropoff_longitude,
          status: driver.bookings[0].status
        } : undefined,
        vehicle: driver.bookings?.[0]?.vehicle ? {
          make: (driver.bookings[0].vehicle as any)?.make,
          model: (driver.bookings[0].vehicle as any)?.model,
          type: (driver.bookings[0].vehicle as any)?.type,
          license_plate: (driver.bookings[0].vehicle as any)?.license_plate
        } : undefined
      }))

      setTrackingData(formattedData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching tracking data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Custom marker icons
  const getMarkerIcon = (type: string, status: string) => {
    const colors = {
      driver: status === 'active' ? '#10B981' : '#3B82F6',
      pickup: '#F59E0B',
      dropoff: '#EF4444'
    }

    return {
      path: type === 'driver' ? 
        'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' :
        'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      fillColor: colors[type as keyof typeof colors] || '#6B7280',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: type === 'driver' ? 1.2 : 0.8,
      anchor: new window.google.maps.Point(12, 24)
    }
  }

  // Update map markers
  const updateMapMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current.clear()

    const bounds = new window.google.maps.LatLngBounds()
    let hasValidLocations = false

    const filteredData = selectedDriver === 'all' 
      ? trackingData 
      : trackingData.filter(data => data.driver.id === selectedDriver)

    filteredData.forEach(data => {
      const { driver, booking } = data

      // Driver marker
      if (driver.current_latitude && driver.current_longitude) {
        const driverMarker = new window.google.maps.Marker({
          position: { 
            lat: Number(driver.current_latitude), 
            lng: Number(driver.current_longitude) 
          },
          map: mapInstanceRef.current,
          icon: getMarkerIcon('driver', driver.status),
          title: `${driver.full_name} - ${driver.status}`,
          zIndex: 1000
        })

        const driverInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${driver.full_name}</h3>
              <p style="margin: 4px 0; color: #666;">Status: <span style="color: #10B981; font-weight: bold;">${driver.status}</span></p>
              <p style="margin: 4px 0; color: #666;">Phone: ${driver.phone_no}</p>
              ${driver.rating ? `<p style="margin: 4px 0; color: #666;">Rating: ⭐ ${driver.rating}/5</p>` : ''}
              ${data.vehicle ? `<p style="margin: 4px 0; color: #666;">Vehicle: ${data.vehicle.make} ${data.vehicle.model}</p>` : ''}
              ${booking ? `<p style="margin: 4px 0; color: #666;">Booking: ${booking.status}</p>` : ''}
            </div>
          `
        })

        driverMarker.addListener('click', () => {
          driverInfoWindow.open(mapInstanceRef.current, driverMarker)
        })

        markersRef.current.set(`driver-${driver.id}`, driverMarker)
        bounds.extend(driverMarker.getPosition()!)
        hasValidLocations = true
      }

      // Pickup marker
      if (booking?.pickup_latitude && booking?.pickup_longitude) {
        const pickupMarker = new window.google.maps.Marker({
          position: { 
            lat: Number(booking.pickup_latitude), 
            lng: Number(booking.pickup_longitude) 
          },
          map: mapInstanceRef.current,
          icon: getMarkerIcon('pickup', 'active'),
          title: `Pickup: ${booking.pickup_address}`,
          zIndex: 500
        })

        const pickupInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; color: #F59E0B;">📍 Pickup Location</h4>
              <p style="margin: 0; color: #666;">${booking.pickup_address}</p>
            </div>
          `
        })

        pickupMarker.addListener('click', () => {
          pickupInfoWindow.open(mapInstanceRef.current, pickupMarker)
        })

        markersRef.current.set(`pickup-${booking.id}`, pickupMarker)
        bounds.extend(pickupMarker.getPosition()!)
        hasValidLocations = true
      }

      // Dropoff marker
      if (booking?.dropoff_latitude && booking?.dropoff_longitude) {
        const dropoffMarker = new window.google.maps.Marker({
          position: { 
            lat: Number(booking.dropoff_latitude), 
            lng: Number(booking.dropoff_longitude) 
          },
          map: mapInstanceRef.current,
          icon: getMarkerIcon('dropoff', 'active'),
          title: `Dropoff: ${booking.dropoff_address}`,
          zIndex: 500
        })

        const dropoffInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; color: #EF4444;">🎯 Dropoff Location</h4>
              <p style="margin: 0; color: #666;">${booking.dropoff_address}</p>
            </div>
          `
        })

        dropoffMarker.addListener('click', () => {
          dropoffInfoWindow.open(mapInstanceRef.current, dropoffMarker)
        })

        markersRef.current.set(`dropoff-${booking.id}`, dropoffMarker)
        bounds.extend(dropoffMarker.getPosition()!)
        hasValidLocations = true
      }

      // Draw route if we have pickup, dropoff, and driver locations
      if (booking?.pickup_latitude && booking?.pickup_longitude && 
          booking?.dropoff_latitude && booking?.dropoff_longitude && 
          driver.current_latitude && driver.current_longitude) {
        
        const request = {
          origin: { lat: Number(booking.pickup_latitude), lng: Number(booking.pickup_longitude) },
          destination: { lat: Number(booking.dropoff_latitude), lng: Number(booking.dropoff_longitude) },
          waypoints: [{
            location: { lat: Number(driver.current_latitude), lng: Number(driver.current_longitude) },
            stopover: true
          }],
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true
        }

        directionsServiceRef.current?.route(request, (result: any, status: any) => {
          if (status === 'OK') {
            directionsRendererRef.current?.setDirections(result)
          }
        })
      }
    })

    // Fit bounds to show all markers
    if (hasValidLocations && !bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 })
    }
  }, [trackingData, selectedDriver])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchTrackingData()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, fetchTrackingData])

  // Initialize map and fetch data
  useEffect(() => {
    initializeMap()
    fetchTrackingData()
  }, [initializeMap, fetchTrackingData])

  // Update markers when data changes
  useEffect(() => {
    if (mapLoaded) {
      updateMapMarkers()
    }
  }, [mapLoaded, updateMapMarkers])

  const handleRefresh = () => {
    fetchTrackingData()
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Live Map Tracking
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {trackingData.map(data => (
                  <SelectItem key={data.driver.id} value={data.driver.id}>
                    {data.driver.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
              className={autoRefresh ? 'bg-green-50' : ''}
            >
              <RotateCcw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tracking {trackingData.length} active rides</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-b-lg"
          style={{ minHeight: '400px' }}
        />
      </CardContent>
    </Card>
  )
}