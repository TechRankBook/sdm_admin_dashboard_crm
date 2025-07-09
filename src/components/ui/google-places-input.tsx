import React, { useRef, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin } from 'lucide-react'

// Add Google Maps types
declare global {
  interface Window {
    google: any
  }
}

declare const google: any

interface GooglePlacesInputProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  id?: string
}

const GOOGLE_PLACES_API_KEY = 'AIzaSyA7sn0fs6f0vRDm3RIkRKn_R-haAgH4M0A'

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Enter location",
  className,
  id
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_PLACES_API_KEY,
          version: 'weekly',
          libraries: ['places']
        })

        await loader.load()
        setIsLoaded(true)

        if (inputRef.current && !autocompleteRef.current && window.google) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            fields: ['formatted_address', 'geometry.location', 'name'],
            types: ['establishment', 'geocode']
          })

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace()
            if (place?.formatted_address && place?.geometry?.location) {
              onChange(place.formatted_address, {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              })
            } else if (place?.name) {
              onChange(place.name)
            }
          })
        }
      } catch (error) {
        console.error('Error loading Google Places API:', error)
        setIsLoaded(false)
      }
    }

    initializeAutocomplete()

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <MapPin className="h-4 w-4" />
      </div>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}