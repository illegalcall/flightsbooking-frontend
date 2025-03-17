import { Booking } from "@/lib/store/useBookingStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon, CalendarIcon, DownloadIcon, InfoIcon, PlaneTakeoffIcon, TicketIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Use a simplified version of BookingDetails for now - to avoid circular dependencies
function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium">Flight Details</h3>
          <p className="text-sm text-muted-foreground">
            {booking.flightDetails.flightNumber} • {booking.flightDetails.airline}
          </p>
          <p className="text-sm mt-1">
            From {booking.flightDetails.departureAirport} to {booking.flightDetails.arrivalAirport}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(booking.departureDate)}
          </p>
        </div>
        <div>
          <h3 className="font-medium">Passengers</h3>
          <div className="space-y-1 mt-1">
            {booking.passengers.map((passenger) => (
              <p key={passenger.id} className="text-sm">
                {passenger.firstName} {passenger.lastName}
              </p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium">Payment</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(booking.totalPrice)}
          </p>
          <p className={cn(
            "text-sm mt-1",
            booking.paymentStatus === "paid" ? "text-green-600" :
            booking.paymentStatus === "pending" ? "text-amber-600" : "text-red-600"
          )}>
            {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm">
          View full details
        </Button>
        {booking.status === 'confirmed' && !booking.checkedIn && (
          <Button size="sm">
            Check in
          </Button>
        )}
      </div>
    </div>
  );
}

interface BookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
}

export default function BookingsList({ bookings, isLoading }: BookingsListProps) {
  if (isLoading) {
    return <BookingsListSkeleton />;
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TicketIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No bookings found</h3>
        <p className="text-muted-foreground mt-1 mb-4">
          You don&apos;t have any bookings matching your filters.
        </p>
        <Button asChild>
          <Link href="/flights">
            Book a flight
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/3 p-0">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PlaneTakeoffIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      {booking.flightDetails.departureAirport} to {booking.flightDetails.arrivalAirport}
                    </CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-1">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  {formatDate(booking.departureDate)} 
                  {booking.returnDate && (
                    <>
                      <span className="mx-1">–</span>
                      {formatDate(booking.returnDate)}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Flight</p>
                    <p className="font-medium">{booking.flightDetails.flightNumber}</p>
                    <p className="text-sm">{booking.flightDetails.airline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="font-medium">{booking.passengers.length}</p>
                    <p className="text-sm flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      {booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Price</p>
                    <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                    <p className="text-sm">
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
            
            <CardFooter className="flex flex-row md:flex-col justify-end md:items-end gap-2 md:border-l md:w-1/3 p-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <InfoIcon className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                      Booking reference: {booking.id}
                    </DialogDescription>
                  </DialogHeader>
                  <BookingDetails booking={booking} />
                </DialogContent>
              </Dialog>
              
              {booking.status === 'confirmed' && !booking.checkedIn && (
                <Button className="w-full md:w-auto">
                  <ArrowRightIcon className="h-4 w-4 mr-2" />
                  Check-in
                </Button>
              )}
              
              {(booking.status === 'confirmed' || booking.status === 'completed') && (
                <Button variant="secondary" className="w-full md:w-auto">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  E-Ticket
                </Button>
              )}
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BookingsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/3 p-0">
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-52 mt-2" />
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((col) => (
                    <div key={col}>
                      <Skeleton className="h-3 w-20 mb-2" />
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
            
            <CardFooter className="flex flex-row md:flex-col justify-end md:items-end gap-2 md:border-l md:w-1/3 p-6">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
} 