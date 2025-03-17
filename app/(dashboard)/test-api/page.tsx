"use client";

import { useState, useEffect, useCallback } from "react";
import { bookingApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function TestBookingsAPI() {
  // Define interface to match the API response structure
  interface ApiBooking {
    id: string;
    bookingReference: string;
    flightId: string;
    selectedCabin: string;
    totalAmount: number;
    bookedSeats: string[];
    createdAt: string;
    status: string;
    passengerDetails: {
      fullName: string;
      age: number;
      documentNumber?: string;
      specialRequests?: string;
    }[];
  }

  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await bookingApi.getUserBookings();
      console.log("API Response:", response);
      
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.error || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">API Test - Bookings</h1>
      
      <div className="mb-6">
        <Button 
          onClick={fetchBookings}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>Fetch Bookings</>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid gap-6">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Booking: {booking.bookingReference}</span>
                  <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {booking.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <p><strong>Flight ID:</strong> {booking.flightId}</p>
                  <p><strong>Cabin:</strong> {booking.selectedCabin}</p>
                  <p><strong>Total Amount:</strong> ${booking.totalAmount}</p>
                  <p><strong>Booked Seats:</strong> {booking.bookedSeats.join(", ")}</p>
                  <p><strong>Created:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                  
                  <div className="mt-2">
                    <h3 className="font-semibold mb-1">Passengers:</h3>
                    <ul className="list-disc pl-5">
                      {booking.passengerDetails.map((passenger, index) => (
                        <li key={index}>
                          {passenger.fullName} (Age: {passenger.age})
                          {passenger.documentNumber && `, Doc: ${passenger.documentNumber}`}
                          {passenger.specialRequests && `, Special Requests: ${passenger.specialRequests}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No bookings found. Click &quot;Fetch Bookings&quot; to load data.
          </div>
        )}
      </div>
    </div>
  );
} 