"use client";

import React from "react";
import { BookingForm } from "@/components/flights/booking/booking-form";
import { use } from "react";

export default function BookingPage({ 
  params 
}: { 
  params: Promise<{ flightId: string }> 
}) {
  const { flightId } = use(params);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
      <BookingForm flightId={flightId} />
    </div>
  );
} 