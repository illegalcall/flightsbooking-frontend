"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BookingData } from "./booking-form";
import { format } from "date-fns";

interface ConfirmationStepProps {
  bookingData: BookingData;
}

export function ConfirmationStep({ bookingData }: ConfirmationStepProps) {
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEE, MMM d, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };
  
  const handleSendEmail = () => {
    // In a real app, this would send an email with the booking details
    setIsEmailSent(true);
    setTimeout(() => {
      setIsEmailSent(false);
    }, 3000);
  };
  
  const getPassengerNames = () => {
    return bookingData.passengers.map(passenger => 
      `${passenger.title.toUpperCase()}. ${passenger.firstName} ${passenger.lastName}`
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your booking has been successfully confirmed. A confirmation email has been sent to you.
        </p>
        <div className="mt-4">
          <Badge className="text-lg px-4 py-2" variant="outline">
            <p className="font-medium text-lg">Booking Reference</p>
            <div className="bg-secondary p-3 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-mono font-bold tracking-wider" data-testid="booking-reference">
                {bookingData.bookingReference || 'ABC123'}
              </span>
            </div>
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Flight Details</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Airline</div>
                <div className="font-medium">{bookingData.flightDetails?.airline}</div>
                <div>{bookingData.flightDetails?.flightNumber}</div>
              </div>
              <Badge>{bookingData.flightDetails?.cabinClass}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-muted-foreground text-sm">From</div>
                <div className="font-medium">{bookingData.flightDetails?.origin.code}</div>
                <div>{bookingData.flightDetails?.origin.city}</div>
              </div>
              
              <div className="text-center">
                <div className="text-muted-foreground text-sm">Date</div>
                <div>{formatDate(bookingData.flightDetails?.departureTime).split('at')[0]}</div>
              </div>
              
              <div className="text-right">
                <div className="text-muted-foreground text-sm">To</div>
                <div className="font-medium">{bookingData.flightDetails?.destination.code}</div>
                <div>{bookingData.flightDetails?.destination.city}</div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <div className="text-muted-foreground text-sm">Departure</div>
                <div className="font-medium">{formatDate(bookingData.flightDetails?.departureTime)}</div>
              </div>
              
              <div className="text-right">
                <div className="text-muted-foreground text-sm">Arrival</div>
                <div className="font-medium">{formatDate(bookingData.flightDetails?.arrivalTime)}</div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-semibold mb-4">Passengers</h3>
          
          <div className="space-y-2">
            {getPassengerNames().map((name, index) => (
              <div key={index} className="flex justify-between">
                <div>{name}</div>
                <div className="text-muted-foreground">
                  Seat: {bookingData.selectedSeats?.[index]?.seatNumber || "Not assigned"}
                </div>
              </div>
            ))}
          </div>
          
          {bookingData.addons && bookingData.addons.length > 0 && (
            <>
              <Separator className="my-6" />
              
              <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
              
              <div className="space-y-2">
                {bookingData.addons.map((addon, index) => (
                  <div key={index} className="flex justify-between">
                    <div>{addon.id.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>
                    <div>${addon.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="text-muted-foreground">Email:</div>
              <div>{bookingData.contactInfo?.email}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-muted-foreground">Phone:</div>
              <div>+{bookingData.contactInfo?.phoneCountryCode} {bookingData.contactInfo?.phoneNumber}</div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center font-bold">
              <span>Total Paid:</span>
              <span>${bookingData.payment?.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
              <span>Payment Method:</span>
              <span>
                {bookingData.payment?.method === "credit-card" 
                  ? "Credit Card" 
                  : bookingData.payment?.method === "paypal"
                    ? "PayPal"
                    : "Apple Pay"}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="flex w-full mt-6 gap-4">
            <Button className="flex-1" onClick={handleSendEmail} disabled={isEmailSent}>
              {isEmailSent ? "Email Sent!" : "Email Itinerary"}
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => window.print()}>
              Print Itinerary
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            If you need to make changes to your booking, please contact our customer service at support@skywings.example.com.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 