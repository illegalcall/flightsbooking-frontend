"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FlightPageProps {
  flightId: string;
}

export default function FlightPageContent({ flightId }: FlightPageProps) {
  return (
    <div className="container py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Flight Details: {flightId}</h1>
          <p className="mb-6 text-muted-foreground">
            This is a placeholder page. In a real application, this would show detailed information about the selected flight.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Airline</div>
                <div>SkyWings Airways</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-muted-foreground text-sm">Flight</div>
                <div>SW 1234</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">From</div>
                <div className="font-medium">New York (JFK)</div>
                <div>08:30 AM, Apr 15</div>
              </div>
              
              <div className="text-center">
                <div className="text-muted-foreground text-sm">Duration</div>
                <div>7h 15m</div>
              </div>
              
              <div className="space-y-1 text-right">
                <div className="text-muted-foreground text-sm">To</div>
                <div className="font-medium">London (LHR)</div>
                <div>8:45 PM, Apr 15</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Aircraft</div>
                <div>Boeing 787-9</div>
              </div>
              
              <div className="space-y-1 text-right">
                <div className="text-muted-foreground text-sm">Price</div>
                <div className="text-xl font-bold">$649.99</div>
              </div>
            </div>
          </div>
          
          <Link href={`/flights/booking/${flightId}`}>
            <Button size="lg">
              Book This Flight
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 