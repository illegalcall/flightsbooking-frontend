"use client"

import { AutoComplete, Option } from "@/components/ui/autocomplete"

// Airport data type
interface Airport {
  code: string
  name: string
  city: string
  country: string
}

// Sample airport data - in a real app, this would come from an API
const airports: Airport[] = [
  { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji International Airport", city: "Mumbai", country: "India" },
  { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India" },
  { code: "MAA", name: "Chennai International Airport", city: "Chennai", country: "India" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "India" },
  { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India" },
  { code: "COK", name: "Cochin International Airport", city: "Kochi", country: "India" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States" },
  { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States" },
  { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates" },
  { code: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan" },
  { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia" },
];

// Convert airports to option format
const airportOptions: Option[] = airports.map(airport => ({
  value: airport.code,
  label: `${airport.city} (${airport.code})`,
  city: airport.city,
  name: airport.name,
  country: airport.country
}));

interface AirportAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  name?: string
  required?: boolean
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Search airports...",
  id,
  name,
  required = false,
}: AirportAutocompleteProps) {
  // Find the currently selected airport option
  const selectedAirportOption = airportOptions.find(option => option.value === value);
  
  // Handle option selection
  const handleOptionChange = (option: Option) => {
    onChange(option.value);
  };

  return (
    <div className="w-full">
      <AutoComplete
        options={airportOptions}
        value={selectedAirportOption}
        onValueChange={handleOptionChange}
        placeholder={placeholder}
        disabled={false}
        isLoading={false}
        emptyMessage="No airports found"
      />
      {/* Hidden form field for form submission */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          id={id} 
          value={value} 
          required={required} 
        />
      )}
    </div>
  )
} 