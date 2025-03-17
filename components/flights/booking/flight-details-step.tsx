"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { saveBookingData } from "@/utils/localStorage";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface FlightDetailsStepProps {
  flightId: string;
  onComplete: (data: { flightDetails: FlightDetails }) => void;
}

interface Airport {
  code: string;
  city: string;
  name: string;
}

interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  basePrice: number;
  cabinClass: string;
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

// UI Components
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Flight Details</h2>
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-16" />
          </div>
          <Skeleton className="h-6 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Flight Details</h2>
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-muted-foreground">Please go back and try again.</p>
      </CardContent>
    </Card>
  </div>
);

const FlightInfo = ({ flightDetails, onContinue }: { flightDetails: FlightDetails, onContinue: () => void }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Review Flight Details</h2>
    
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Airline</p>
            <p className="font-medium">{flightDetails.airline}</p>
            <p className="text-sm">{flightDetails.flightNumber}</p>
          </div>
          <Badge>{flightDetails.cabinClass}</Badge>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{flightDetails.origin.code}</p>
            <p className="text-sm text-muted-foreground">{flightDetails.origin.city}</p>
          </div>
          
          <div className="flex-1 mx-4 px-6">
            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full" />
              <div className="relative bg-white dark:bg-gray-950 px-2 text-xs text-muted-foreground">
                {flightDetails.duration}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold">{flightDetails.destination.code}</p>
            <p className="text-sm text-muted-foreground">{flightDetails.destination.city}</p>
          </div>
        </div>
        
        <div className="flex justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Departure</p>
            <p className="font-medium">{formatDate(flightDetails.departureTime)}</p>
            <p className="text-sm text-muted-foreground">{flightDetails.origin.name}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Arrival</p>
            <p className="font-medium">{formatDate(flightDetails.arrivalTime)}</p>
            <p className="text-sm text-muted-foreground">{flightDetails.destination.name}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Aircraft</p>
            <p>{flightDetails.aircraft}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-xl font-bold">${flightDetails.basePrice.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <div className="flex justify-end">
      <Button onClick={onContinue}>
        Continue to Passenger Information
      </Button>
    </div>
  </div>
);

// Main component
export function FlightDetailsStep({ flightId, onComplete }: FlightDetailsStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flightDetails, setFlightDetails] = useState<FlightDetails | null>(null);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        let token = session?.access_token || '';
        
        // Fallback to localStorage if needed
        if (!token) {
          const authData = localStorage.getItem('sb-auth-token');
          if (authData) {
            try {
              const parsedAuthData = JSON.parse(authData);
              token = parsedAuthData.access_token;
            } catch {
              throw new Error("Authentication error: Invalid token format");
            }
          } else {
            throw new Error("Authentication error: No token found");
          }
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/flights/${flightId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || 
            `Failed to fetch flight details: ${response.status} ${response.statusText}`
          );
        }
        
        const data = await response.json();
        setFlightDetails(data);
        
        // Save flight details to localStorage
        saveBookingData({ flightDetails: data });
      } catch (error) {
        console.error("Error fetching flight details:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (flightId) {
      fetchFlightDetails();
    } else {
      setError("No flight ID provided");
      setIsLoading(false);
    }
  }, [flightId]);

  const handleContinue = () => {
    if (flightDetails) {
      // Save flight details to localStorage when continuing to next step
      saveBookingData({ flightDetails });
      onComplete({ flightDetails });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!flightDetails) {
    return <ErrorMessage message="Flight details not found" />;
  }

  return <FlightInfo flightDetails={flightDetails} onContinue={handleContinue} />;
} 