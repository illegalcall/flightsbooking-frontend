"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plane } from "lucide-react";

// Mock booking data
const bookings = [
  {
    id: "FL123",
    from: "New York (JFK)",
    to: "London (LHR)",
    date: "2024-03-20",
    status: "upcoming",
    price: "$450.00"
  },
  {
    id: "FL456",
    from: "London (LHR)",
    to: "Paris (CDG)",
    date: "2024-02-15",
    status: "completed",
    price: "$220.00"
  },
  {
    id: "FL789",
    from: "Paris (CDG)",
    to: "New York (JFK)",
    date: "2024-01-10",
    status: "completed",
    price: "$480.00"
  }
];

export function BookingHistory() {
  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "";
  };

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
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 rotate-45" />
                      <span>{booking.from}</span>
                      <span>→</span>
                      <span>{booking.to}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.price}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
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