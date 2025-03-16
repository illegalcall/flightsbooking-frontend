"use client"

import { FlightSearchResult } from "@/lib/services/flights/flightSearchService";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FlightResultsListProps {
  results: FlightSearchResult[];
  isLoading: boolean;
}

export default function FlightResultsList({ results, isLoading }: FlightResultsListProps) {
  console.log("🚀 ~ FlightResultsList ~ results:", results)
  // Sort options state
  const [sortOption, setSortOption] = useState<'price' | 'duration' | 'departure'>('price');
  
  // No results state
  if (results.length === 0 && !isLoading) {
    return (
      <Card className="w-full mt-6">
        <CardContent className="pt-6 text-center">
          <p className="text-lg text-muted-foreground">No flights found for your search criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search parameters.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-6 bg-muted rounded animate-pulse w-1/3"></div>
                <div className="h-12 bg-muted rounded animate-pulse w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Sort the results based on the selected option
  const sortedResults = [...results].sort((a, b) => {
    switch (sortOption) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        // Convert duration to string if it's a number
        const durationA = typeof a.duration === 'number' ? String(a.duration) : a.duration;
        const durationB = typeof b.duration === 'number' ? String(b.duration) : b.duration;
        return durationA.localeCompare(durationB);
      case 'departure':
        return a.departureTime.localeCompare(b.departureTime);
      default:
        return 0;
    }
  });

  return (
    <div className="mt-6 space-y-6">
      {/* Sorting options */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Flight Results ({results.length})</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Sort by:</span>
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={sortOption === 'price' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSortOption('price')}
              data-state={sortOption === 'price' ? 'active' : 'inactive'}
            >
              Price
            </Button>
            <Button 
              variant={sortOption === 'duration' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSortOption('duration')}
              data-state={sortOption === 'duration' ? 'active' : 'inactive'}
            >
              Duration
            </Button>
            <Button 
              variant={sortOption === 'departure' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setSortOption('departure')}
              data-state={sortOption === 'departure' ? 'active' : 'inactive'}
            >
              Departure
            </Button>
          </div>
        </div>
      </div>
      
      {/* Flight results */}
      <div className="space-y-4">
        {sortedResults.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}

function FlightCard({ flight }: { flight: FlightSearchResult }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const router = useRouter();
  
  const handleSelectFlight = () => {
    router.push(`/flights/booking/${flight.id}`);
  };
  
  // Format origin and destination to handle objects
  const formatLocation = (location: unknown): string => {
    if (typeof location === 'string') {
      return location;
    }
    
    // Handle case where location is an object
    if (location && typeof location === 'object') {
      // Check if it has a code or name property (common for airport objects)
      const locationObj = location as Record<string, unknown>;
      if ('name' in locationObj && typeof locationObj.name === 'string') {
        return locationObj.name;
      } else if ('code' in locationObj && typeof locationObj.code === 'string') {
        return locationObj.code;
      } else {
        console.warn('Invalid location object:', location);
        return 'Unknown';
      }
    }
    
    return 'Unknown';
  };
  
  // Format date for display (e.g., "09:45 AM")
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return dateString;
    }
  };
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    const hours = Math.trunc(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const originText = formatLocation(flight.origin);
  const destinationText = formatLocation(flight.destination);
  
  // Default values for missing properties
  const stops = typeof flight.stops === 'number' ? flight.stops : 0;
  const price = typeof flight.price === 'number' ? flight.price : 0;
  const duration = typeof flight.duration === 'number' 
    ? formatDuration(flight.duration) 
    : (typeof flight.duration === 'string' ? flight.duration : '');
  
  return (
    <Card className="w-full" data-testid="flight-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{flight.airline}</span>
            <span className="text-sm text-muted-foreground">{flight.flightNumber}</span>
          </div>
          <Badge variant={stops === 0 ? "outline" : "secondary"}>
            {stops === 0 ? "Direct" : `${stops} Stop${stops > 1 ? 's' : ''}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">{formatTime(flight.departureTime)}</p>
            <p className="text-sm">{originText}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">{duration}</p>
            <div className="w-full h-px bg-muted my-1"></div>
            <p className="text-xs text-muted-foreground">
              {stops === 0 ? "Direct Flight" : `${stops} Stop${stops > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</p>
            <p className="text-sm">{destinationText}</p>
          </div>
        </div>
      </CardContent>
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <div className="px-6 pt-0 pb-2 flex justify-between items-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              {detailsOpen ? "Hide details" : "View details"}
            </Button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${price}</span>
            <Button size="sm" onClick={handleSelectFlight}>Select</Button>
          </div>
        </div>
        <CollapsibleContent className="px-6 pb-4">
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Flight Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Airline</p>
                <p>{flight.airline}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flight Number</p>
                <p>{flight.flightNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p>{duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aircraft</p>
                <p>Boeing 737</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 