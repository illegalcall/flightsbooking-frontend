'use client';

import { useEffect, useState } from 'react';
import { useBookingStore, Booking } from '@/lib/store/useBookingStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftIcon, CheckIcon, DownloadIcon, PrinterIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BookingDetails from '@/components/booking/BookingDetails';
import { toast } from '@/components/ui/use-toast';

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { bookings, isLoading, fetchBookings, downloadETicket } = useBookingStore();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      // If we don't have bookings yet, fetch them
      if (bookings.length === 0) {
        await fetchBookings();
      }
      
      // Find the booking with the given ID
      const found = bookings.find(b => b.id === params.id);
      if (found) {
        setBooking(found);
      } else {
        // Booking not found, show error and redirect
        toast({
          title: 'Booking Not Found',
          description: `We couldn't find a booking with the ID ${params.id}`,
          variant: 'destructive',
        });
        
        // Redirect back to bookings list after a short delay
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      }
    };

    loadBookings();
  }, [bookings, fetchBookings, params.id, router]);

  const handleDownloadTicket = async () => {
    if (!booking) return;
    
    const success = await downloadETicket(booking.id);
    if (success) {
      toast({
        title: 'E-Ticket Downloaded',
        description: 'Your e-ticket has been downloaded successfully.',
      });
    } else {
      toast({
        title: 'Download Failed',
        description: 'Failed to download your e-ticket. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !booking) {
    return <BookingPageSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to all bookings
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">
            Booking #{booking.id}
          </h1>
          <p className="text-muted-foreground">
            Booked on {new Date(booking.bookingDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {booking.status === 'confirmed' && !booking.checkedIn && (
            <Button>
              <CheckIcon className="h-4 w-4 mr-2" />
              Check-in Now
            </Button>
          )}
          
          <Button variant="outline" onClick={handleDownloadTicket}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download E-Ticket
          </Button>
          
          <Button variant="outline">
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Details
          </Button>
        </div>
      </div>
      
      {booking && <BookingDetails booking={booking} />}
    </div>
  );
}

function BookingPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-64 mt-2" />
          <Skeleton className="h-5 w-48 mt-1" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="mt-6">
        <Skeleton className="h-12 w-full mb-4" />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
} 