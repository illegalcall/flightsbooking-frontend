"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveBookingData } from "@/utils/localStorage";

// This would be replaced with actual seat data from an API
const mockSeatClasses = [
  { id: "Economy", name: "Economy", price: 0, available: 42 },
  { id: "PremiumEconomy", name: "Premium Economy", price: 35, available: 18 },
  { id: "Business", name: "Business", price: 120, available: 12 },
  { id: "First", name: "First Class", price: 250, available: 6 },
];

interface PassengerData {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

interface SeatData {
  passengerId: number;
  seatNumber: string;
  seatClass: string;
  price: number;
}

interface SeatSelectionStepProps {
  flightId: string;
  passengers: PassengerData[];
  onComplete: (data: { selectedSeats: SeatData[] }) => void;
  onBack: () => void;
}

export function SeatSelectionStep({ passengers, onComplete, onBack }: SeatSelectionStepProps) {
  const [selectedClass, setSelectedClass] = useState<string>("Economy");

  // In a real implementation, this would fetch actual seat map data
  // and allow selection of individual seats
  const handleContinue = () => {
    // For now, we'll just mock some random seat assignments
    const mockSeats = passengers.map((passenger, index) => ({
      passengerId: index,
      seatNumber: '45B',
      seatClass: selectedClass,
      price: mockSeatClasses.find(sc => sc.id === selectedClass)?.price || 0
    }));

    // Save the selected seats to localStorage
    saveBookingData({ selectedSeats: mockSeats });

    // Continue to next step
    onComplete({ selectedSeats: mockSeats });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Seat Selection</h2>
      <p className="text-muted-foreground">
        Select your preferred seat class, and we&apos;ll assign the best available seats for you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockSeatClasses.map((seatClass) => (
          <Card 
            key={seatClass.id}
            className={`cursor-pointer transition-all ${
              selectedClass === seatClass.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedClass(seatClass.id)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{seatClass.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {seatClass.available} seats available
                </p>
              </div>
              <div className="text-right">
                {seatClass.price > 0 ? (
                  <Badge variant="outline">+${seatClass.price}</Badge>
                ) : (
                  <Badge variant="outline">Included</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6 text-center">
        <p className="text-muted-foreground mb-4">
          Note: This is a simplified version. In the full implementation, 
          you would be able to select specific seats on a seat map.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue to Add-ons
        </Button>
      </div>
    </div>
  );
} 