import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from "@/components/ui/timeline";
import { Booking } from "@/lib/store/useBookingStore";
import { formatCurrency, formatDateLong, formatTime } from "@/lib/utils";
import { ArrowRightIcon, CheckIcon, ClockIcon, CreditCardIcon, DownloadIcon, PlaneTakeoffIcon, RefreshCcwIcon, UserIcon } from "lucide-react";

interface BookingDetailsProps {
  booking: Booking;
}

export default function BookingDetails({ booking }: BookingDetailsProps) {
  const hasReturnFlight = !!booking.returnDate;
  
  return (
    <div className="space-y-6 py-4">
      <Tabs defaultValue="flight" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flight">
            <PlaneTakeoffIcon className="h-4 w-4 mr-2" />
            Flight
          </TabsTrigger>
          <TabsTrigger value="passengers">
            <UserIcon className="h-4 w-4 mr-2" />
            Passengers
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="flight" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flight details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PlaneTakeoffIcon className="h-5 w-5 mr-2 text-primary" />
                  Outbound Flight
                </CardTitle>
                <CardDescription>
                  {formatDateLong(booking.departureDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-2xl">{booking.flightDetails.departureAirport}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(booking.flightDetails.departureTime)}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xs text-muted-foreground border-b pb-1">
                        {booking.flightDetails.duration}
                      </p>
                      <ArrowRightIcon className="h-4 w-10 mx-auto my-1" />
                      <p className="text-xs">Direct</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-2xl">{booking.flightDetails.arrivalAirport}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(booking.flightDetails.arrivalTime)}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Airline</p>
                      <p className="font-medium">{booking.flightDetails.airline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Flight Number</p>
                      <p className="font-medium">{booking.flightDetails.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Aircraft</p>
                      <p className="font-medium">{booking.flightDetails.aircraft}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'completed' ? 'success' : 'destructive'}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Return flight if there is one */}
            {hasReturnFlight && booking.flightDetails.returnFlightNumber && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <PlaneTakeoffIcon className="h-5 w-5 mr-2 text-primary rotate-180" />
                    Return Flight
                  </CardTitle>
                  <CardDescription>
                    {formatDateLong(booking.returnDate!)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-2xl">{booking.flightDetails.arrivalAirport}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(booking.flightDetails.returnDepartureTime || '')}
                        </p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-xs text-muted-foreground border-b pb-1">
                          {booking.flightDetails.returnDuration || booking.flightDetails.duration}
                        </p>
                        <ArrowRightIcon className="h-4 w-10 mx-auto my-1" />
                        <p className="text-xs">Direct</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-2xl">{booking.flightDetails.departureAirport}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(booking.flightDetails.returnArrivalTime || '')}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Airline</p>
                        <p className="font-medium">{booking.flightDetails.airline}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Flight Number</p>
                        <p className="font-medium">{booking.flightDetails.returnFlightNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Aircraft</p>
                        <p className="font-medium">{booking.flightDetails.aircraft}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'completed' ? 'success' : 'destructive'}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Timeline */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Flight Timeline</h3>
            <Timeline>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <h4 className="font-medium">Booking Confirmed</h4>
                  <p className="text-sm text-muted-foreground">{formatDateLong(booking.bookingDate)}</p>
                </TimelineContent>
              </TimelineItem>
              
              {booking.status !== 'cancelled' && (
                <>
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color={booking.status === 'completed' || booking.checkedIn ? 'success' : 'gray'} />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <h4 className="font-medium">Check-in {booking.checkedIn ? 'Completed' : 'Available'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.checkedIn 
                          ? 'You have already checked in'
                          : `Available from ${formatDateLong(new Date(new Date(booking.departureDate).getTime() - 24 * 60 * 60 * 1000).toISOString())}`
                        }
                      </p>
                    </TimelineContent>
                  </TimelineItem>
                  
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color={booking.status === 'completed' ? 'success' : 'gray'} />
                      {booking.returnDate && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <h4 className="font-medium">Departure</h4>
                      <p className="text-sm text-muted-foreground">{formatDateLong(booking.departureDate)}</p>
                    </TimelineContent>
                  </TimelineItem>
                  
                  {booking.returnDate && (
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color={booking.status === 'completed' ? 'success' : 'gray'} />
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4 className="font-medium">Return</h4>
                        <p className="text-sm text-muted-foreground">{formatDateLong(booking.returnDate)}</p>
                      </TimelineContent>
                    </TimelineItem>
                  )}
                </>
              )}
            </Timeline>
          </div>
        </TabsContent>
        
        <TabsContent value="passengers" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Passenger Information</CardTitle>
              <CardDescription>
                {booking.passengers.length} {booking.passengers.length === 1 ? 'passenger' : 'passengers'} on this booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Cabin</TableHead>
                    <TableHead>Check-in Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booking.passengers.map((passenger) => {
                    const seatSelection = booking.seatSelections.find(
                      (seat) => seat.passengerId === passenger.id && seat.legType === 'outbound'
                    );
                    
                    return (
                      <TableRow key={passenger.id}>
                        <TableCell className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                        </TableCell>
                        <TableCell>
                          {seatSelection ? seatSelection.seatNumber : 'Not selected'}
                        </TableCell>
                        <TableCell>
                          {seatSelection ? (
                            <Badge variant="outline" className="capitalize">
                              {seatSelection.cabin}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.checkedIn ? (
                            <Badge variant="success" className="gap-1">
                              <CheckIcon className="h-3 w-3" />
                              Checked in
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <ClockIcon className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {booking.status === 'confirmed' && !booking.checkedIn && (
                <Button>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Check in now
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {booking.addOns.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Add-ons</CardTitle>
                <CardDescription>
                  Additional services purchased with this booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.addOns.map((addon) => (
                      <TableRow key={addon.id}>
                        <TableCell className="font-medium">
                          {addon.name}
                        </TableCell>
                        <TableCell>{addon.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(addon.price * addon.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="payment" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Booking reference: {booking.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <Badge 
                      variant={
                        booking.paymentStatus === 'paid' 
                          ? 'success' 
                          : booking.paymentStatus === 'pending' 
                          ? 'warning' 
                          : 'destructive'
                      }
                      className="mt-1"
                    >
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Date</p>
                    <p className="font-medium">{formatDateLong(booking.bookingDate)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-base mb-3">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Base fare</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(booking.totalPrice - booking.addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0))}
                      </p>
                    </div>
                    
                    {booking.addOns.map((addon) => (
                      <div key={addon.id} className="flex justify-between">
                        <p className="text-sm">
                          {addon.name} {addon.quantity > 1 && `(x${addon.quantity})`}
                        </p>
                        <p className="text-sm font-medium">
                          {formatCurrency(addon.price * addon.quantity)}
                        </p>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold">
                      <p>Total</p>
                      <p>{formatCurrency(booking.totalPrice)}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-base mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{booking.contactInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{booking.contactInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">
                <RefreshCcwIcon className="h-4 w-4 mr-2" />
                Request Invoice
              </Button>
              <Button>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download E-Ticket
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 