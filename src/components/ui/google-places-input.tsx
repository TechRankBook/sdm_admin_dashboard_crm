import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface GooglePlacesInputProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  id?: string
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Enter location",
  className,
  id
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7))

  const searchPlaces = async (input: string) => {
    if (!input.trim() || input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('google-maps', {
        body: {
          action: 'places_autocomplete',
          input: input.trim(),
          sessionToken
        }
      })

      if (error) throw error

      if (data.predictions) {
        setSuggestions(data.predictions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error searching places:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceSelect = async (placeId: string, description: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps', {
        body: {
          action: 'place_details',
          placeId
        }
      })

      if (error) throw error

      if (data.result) {
        const { formatted_address, geometry } = data.result
        onChange(formatted_address, {
          lat: geometry.location.lat,
          lng: geometry.location.lng
        })
      } else {
        onChange(description)
      }
    } catch (error) {
      console.error('Error getting place details:', error)
      onChange(description)
    } finally {
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    searchPlaces(newValue)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 150)
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
        <MapPin className="h-4 w-4" />
      </div>
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => value.length >= 3 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
        autoComplete="off"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none text-sm"
              onClick={() => handlePlaceSelect(suggestion.place_id, suggestion.description)}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{suggestion.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}