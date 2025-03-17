"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plane, Loader } from "lucide-react";
import { useBookingStore } from "@/lib/store/useBookingStore";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function BookingHistory() {
  const { bookings, isLoading, fetchBookings } = useBookingStore();

  useEffect(() => {
    fetchBookings().catch(error => {
      console.error("Error fetching bookings:", error);
    });
  }, [fetchBookings]);

  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      confirmed: "bg-blue-100 text-blue-800",
      pending: "bg-amber-100 text-amber-800"
    };
    return variants[status as keyof typeof variants] || "";
  };

  // Map store status to display status
  const mapStatusToDisplay = (status: string): string => {
    const displayMap: Record<string, string> = {
      confirmed: "upcoming",
      completed: "completed",
      cancelled: "cancelled",
      pending: "pending"
    };
    return displayMap[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading bookings...</span>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground mb-4">You don&apos;t have any bookings yet.</p>
          <Button asChild>
            <Link href="/flights">Book a Flight</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 rotate-45" />
                      <span>{booking.flightDetails.departureAirport}</span>
                      <span>→</span>
                      <span>{booking.flightDetails.arrivalAirport}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(booking.departureDate)}</TableCell>
                  <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(booking.status)}>
                      {mapStatusToDisplay(booking.status).charAt(0).toUpperCase() + mapStatusToDisplay(booking.status).slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/bookings/${booking.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 