"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import { Stepper } from "@/components/ui/stepper";
import { Card } from "@/components/ui/card";
import { FlightDetailsStep } from "./flight-details-step";
import { PassengerInfoStep } from "./passenger-info-step";
import { SeatSelectionStep } from "./seat-selection-step";
import { AddonsStep } from "./addons-step";
import { ContactInfoStep } from "./contact-info-step";
import { PaymentStep } from "./payment-step";
import { ConfirmationStep } from "./confirmation-step";
import { SeatLockTimer } from "./seat-lock-timer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  flightId: string;
}

const BOOKING_STEPS = [
  { id: "flight-details", label: "Flight Details", description: "Review your flight information" },
  { id: "passenger-info", label: "Passenger Info", description: "Enter passenger details" },
  { id: "seat-selection", label: "Seat Selection", description: "Choose your seats" },
  { id: "addons", label: "Add-ons", description: "Select additional services" },
  { id: "contact-info", label: "Contact Info", description: "Provide contact details" },
  { id: "payment", label: "Payment", description: "Complete your purchase" },
  { id: "confirmation", label: "Confirmation", description: "Booking complete" }
];

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
  price: number;
  cabinClass: string;
}

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

interface AddonData {
  id: string;
  selected: boolean;
  optionId?: string;
  price: number;
}

interface ContactInfo {
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneCountryCode: string;
    phoneNumber: string;
  };
  preferences: {
    receivePromotions: boolean;
    receiveFlightUpdates: boolean;
  };
}

interface PaymentData {
  method: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  timestamp: string;
}

export interface BookingData {
  flightDetails: FlightDetails | null;
  passengers: PassengerData[];
  selectedSeats: SeatData[];
  addons: AddonData[];
  contactInfo: ContactInfo | null;
  payment: PaymentData | null;
  bookingReference?: string;
}

export function BookingForm({ flightId }: BookingFormProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    flightDetails: null,
    passengers: [],
    selectedSeats: [],
    addons: [],
    contactInfo: null,
    payment: null,
  });
  const [showLockTimer, setShowLockTimer] = useState(false);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);

  const handleStepComplete = (stepData: Partial<BookingData>) => {
    // Update booking data with new step data
    setBookingData(prevData => ({
      ...prevData,
      ...stepData
    }));
    
    // Start showing the lock timer after seat selection
    if (activeStep === 2 && !showLockTimer) {
      setShowLockTimer(true);
    }
    
    // Generate booking reference when payment is completed
    if (stepData.payment && !bookingData.bookingReference) {
      const bookingReference = generateBookingReference();
      setBookingData(prevData => ({
        ...prevData,
        bookingReference
      }));
    }
    
    // Move to next step if not at the end
    if (activeStep < BOOKING_STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleStepNavigation = (index: number) => {
    // Only allow navigation to completed steps or the next available step
    // Prevent navigation to confirmation step unless payment is done
    if (index === BOOKING_STEPS.length - 1 && !bookingData.payment) {
      return;
    }
    
    if (index <= activeStep + 1) {
      setActiveStep(index);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Generate a unique booking reference
  const generateBookingReference = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    // Generate a 6-character booking reference
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  // Handle seat lock expiration
  const handleLockExpire = useCallback(() => {
    setShowExpiredDialog(true);
    // Clear selected seats when lock expires
    if (bookingData.selectedSeats.length > 0) {
      setBookingData(prevData => ({
        ...prevData,
        selectedSeats: []
      }));
    }
  }, [bookingData.selectedSeats.length]);
  
  // Handle selection of similar seats when lock expires
  const handleFindSimilarSeats = () => {
    setShowExpiredDialog(false);
    // Return to seat selection step
    setActiveStep(2);
  };
  
  // Handle start over after lock expiration
  const handleStartOver = () => {
    setShowExpiredDialog(false);
    router.push('/flights');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <FlightDetailsStep flightId={flightId} onComplete={handleStepComplete as any} />;
      case 1:
        return <PassengerInfoStep onComplete={handleStepComplete as any} onBack={handleBack} />;
      case 2:
        return <SeatSelectionStep 
          flightId={flightId} 
          passengers={bookingData.passengers} 
          onComplete={handleStepComplete as any} 
          onBack={handleBack} 
        />;
      case 3:
        return <AddonsStep onComplete={handleStepComplete as any} onBack={handleBack} />;
      case 4:
        return <ContactInfoStep onComplete={handleStepComplete as any} onBack={handleBack} />;
      case 5:
        return <PaymentStep 
          bookingData={bookingData} 
          onComplete={handleStepComplete as any} 
          onBack={handleBack}
        />;
      case 6:
        return <ConfirmationStep bookingData={bookingData} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Stepper 
          steps={BOOKING_STEPS} 
          activeStep={activeStep} 
          onStepClick={handleStepNavigation}
          className="flex-1"
        />
        
        {showLockTimer && activeStep > 2 && activeStep < 6 && (
          <SeatLockTimer 
            initialMinutes={15} 
            onExpire={handleLockExpire}
            className="ml-4"
          />
        )}
      </div>
      
      <Card className="p-6">
        {renderStepContent()}
      </Card>
      
      {/* Lock Expiration Dialog */}
      <Dialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Seat Reservation Expired</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Your seat reservation has expired. Unfortunately, the seats you selected are no longer guaranteed and may have been booked by another traveler.
            </p>
            <p className="mb-4">
              You can try to select similar seats or start a new booking.
            </p>
          </div>
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={handleFindSimilarSeats} className="w-full sm:w-auto">
              Select Similar Seats
            </Button>
            <Button variant="outline" onClick={handleStartOver} className="w-full sm:w-auto">
              Start Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 