"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BookingData } from "./BookingWizard";

interface PriceBreakdownProps {
  bookingData: BookingData;
  className?: string;
}

export function PriceBreakdown({ bookingData, className }: PriceBreakdownProps) {
  const baseFare = bookingData.flightDetails?.price || 0;
  const seatPrice = bookingData.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  const addonPrice = bookingData.addons.reduce((total, addon) => total + addon.price, 0);
  
  // Fixed fees
  const taxes = Math.round(baseFare * 0.12 * 100) / 100;
  const airportFee = 24.99;
  const securityFee = 5.60 * bookingData.passengers.length;
  
  const totalPrice = baseFare + seatPrice + addonPrice + taxes + airportFee + securityFee;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Price Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Base Fare */}
          <div className="flex justify-between">
            <div>
              <span className="font-medium">Base Fare</span>
              <div className="text-sm text-muted-foreground">
                {bookingData.passengers.length} {bookingData.passengers.length === 1 ? 'passenger' : 'passengers'}
              </div>
            </div>
            <div className="font-medium">
              ${baseFare.toFixed(2)}
            </div>
          </div>
          
          {/* Seats */}
          {seatPrice > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">Seat Selection</span>
                <div className="text-sm text-muted-foreground">
                  {bookingData.selectedSeats.map((seat, index) => (
                    <div key={index}>
                      {seat.seatNumber} ({seat.seatClass}) - ${seat.price.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="font-medium">
                ${seatPrice.toFixed(2)}
              </div>
            </div>
          )}
          
          {/* Add-ons */}
          {addonPrice > 0 && (
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">Add-ons</span>
                <div className="text-sm text-muted-foreground">
                  {bookingData.addons.filter(addon => addon.selected).map((addon, index) => (
                    <div key={index}>
                      {addon.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - ${addon.price.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="font-medium">
                ${addonPrice.toFixed(2)}
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Taxes and Fees */}
          <div className="flex justify-between">
            <div>
              <span className="font-medium">Taxes</span>
            </div>
            <div className="font-medium">
              ${taxes.toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="font-medium">Airport Fees</span>
            </div>
            <div className="font-medium">
              ${airportFee.toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <span className="font-medium">Security Fee</span>
              <div className="text-sm text-muted-foreground">
                $5.60 per passenger
              </div>
            </div>
            <div className="font-medium">
              ${securityFee.toFixed(2)}
            </div>
          </div>
          
          <Separator />
          
          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <div className="font-bold text-lg">Total</div>
            <Badge variant="success" className="font-bold text-lg px-3 py-1">
              ${totalPrice.toFixed(2)}
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2">
            All prices are in USD. Payment will be processed securely.
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 