"use client";

import { useState, useEffect } from "react";
import { bookingApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function TestBookingsAPI() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
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
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Bookings API Test</h1>
      
      <div className="mb-4">
        <Button onClick={fetchBookings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh Bookings"
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
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
                      {booking.passengerDetails.map((passenger: any, index: number) => (
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
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Raw API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(bookings, null, 2)}
        </pre>
      </div>
    </div>
  );
} 