"use client"
import { AirportAutocomplete } from "@/components/airports/AirportAutocomplete";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useFlightSearch from "@/hooks/useFlightSearch";
import useIndexedDB from "@/hooks/useIndexedDB";
import { CabinClass, FlightSearchFormData } from "@/lib/services/flights/flightSearchService";
import { useEffect, useState } from "react";
import FlightResultsList from "./FlightResultsList";

export default function FlightSearchForm() {
  // Default form state
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: "one-way",
    originCode: "",
    destinationCode: "",
    departureDate: "",
    passengers: 1, // Just adults
    cabinClass: CabinClass.Economy,
    priceRange: {
      min: 0,
      max: 10000,
    },
    directFlightsOnly: false,
  });

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Use our custom hooks
  const { search, results, isLoading, error, updateFilters } = useFlightSearch();
  const { isSupported: isIndexedDBSupported, cacheFlightResults, getCachedFlightResults } = useIndexedDB();

  // Check online status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };

    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    
    try {
      // Try to get cached results first
      if (isIndexedDBSupported && !isOffline) {
        const cachedResults = await getCachedFlightResults(formData);
        
        if (cachedResults) {
          // If we have cached results, use them immediately
          // The search function will still be called to update the cache
          console.log('Using cached flight results');
        }
      }
      
      // Search for flights (this will update the UI with results)
      await search(formData);
      
      // If the search was successful and we're online, cache the results
      if (!isOffline && isIndexedDBSupported && results.length > 0) {
        await cacheFlightResults(formData, results);
      }
    } catch (error) {
      console.error("Error during flight search:", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle trip type selection
  const handleTripTypeChange = (value: "one-way" | "round-trip" | "multi-city") => {
    setFormData((prev) => ({
      ...prev,
      tripType: value,
      // Reset return date if one-way is selected
      ...(value === "one-way" && { returnDate: undefined }),
    }));
  };

  // Handle cabin class selection
  const handleCabinClassChange = (value: CabinClass) => {
    setFormData((prev) => ({
      ...prev,
      cabinClass: value,
    }));
  };

  // Handle origin code change
  const handleOriginChange = (code: string) => {
    setFormData(prev => ({
      ...prev,
      originCode: code
    }));
  };

  // Handle destination code change
  const handleDestinationChange = (code: string) => {
    setFormData(prev => ({
      ...prev,
      destinationCode: code
    }));
  };

  // Handle direct flights toggle
  const handleDirectFlightsToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      directFlightsOnly: checked,
    }));
    
    // Also update the filter
    updateFilters({ directOnly: checked });
  };

  // Calculate total passengers
  // const totalPassengers = formData.passengers;

  return (
    <div className="space-y-6">
      {isOffline && (
        <Alert className="mb-4">
          <AlertDescription>
            You are currently offline. Search results may be limited to cached data.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Flights</CardTitle>
          <CardDescription>
            Find the best flights for your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Trip Type Selection */}
            <div className="mb-6">
              <RadioGroup
                value={formData.tripType}
                onValueChange={(value: "one-way" | "round-trip" | "multi-city") => handleTripTypeChange(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-way" id="one-way" />
                  <Label htmlFor="one-way">One Way</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="round-trip" id="round-trip" />
                  <Label htmlFor="round-trip">Round Trip</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multi-city" id="multi-city" />
                  <Label htmlFor="multi-city">Multi-City</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <AirportAutocomplete
                  id="origin"
                  name="originCode"
                  placeholder="City or Airport"
                  value={formData.originCode}
                  onChange={handleOriginChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <AirportAutocomplete
                  id="destination"
                  name="destinationCode"
                  placeholder="City or Airport"
                  value={formData.destinationCode}
                  onChange={handleDestinationChange}
                  required
                />
              </div>
            </div>

            {/* Dates, Passengers and Cabin Class in one row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="departDate">Departure Date</Label>
                <Input
                  id="departDate"
                  name="departureDate"
                  type="date"
                  value={formData.departureDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {formData.tripType === "round-trip" && (
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date</Label>
                  <Input
                    id="returnDate"
                    name="returnDate"
                    type="date"
                    value={formData.returnDate || ""}
                    onChange={handleInputChange}
                    required={formData.tripType === "round-trip"}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Passengers</Label>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={formData.passengers.toString()}
                    onValueChange={(value) => 
                      setFormData((prev) => ({
                        ...prev,
                        passengers: parseInt(value)
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Adults" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Adult" : "Adults"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* <Badge>{totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}</Badge> */}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cabin Class</Label>
                <Select 
                  value={formData.cabinClass}
                  onValueChange={(value: CabinClass) => handleCabinClassChange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CabinClass.Economy}>Economy</SelectItem>
                    <SelectItem value={CabinClass.PremiumEconomy}>Premium Economy</SelectItem>
                    <SelectItem value={CabinClass.Business}>Business</SelectItem>
                    <SelectItem value={CabinClass.First}>First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Options */}
            <Collapsible
              open={showAdvancedOptions}
              onOpenChange={setShowAdvancedOptions}
              className="mb-6 space-y-4 border p-4 rounded-md"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" type="button" className="flex items-center w-full justify-between">
                  <span>Advanced Options</span>
                  <span>{showAdvancedOptions ? "Hide" : "Show"}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                {/* Direct Flights Only */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="directFlightsOnly"
                    checked={formData.directFlightsOnly}
                    onCheckedChange={handleDirectFlightsToggle}
                  />
                  <Label htmlFor="directFlightsOnly">Direct Flights Only</Label>
                </div>
                
                {/* More advanced options can be added here */}
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search Flights"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display error if any */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Display results */}
      {hasSearched && <FlightResultsList results={results || []} isLoading={isLoading} />}
    </div>
  );
} 