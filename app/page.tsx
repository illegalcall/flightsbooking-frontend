"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Book Your Next Adventure
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Find and book flights to destinations worldwide with our easy-to-use platform.
          Enjoy competitive prices and a seamless booking experience.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/search">Search Flights</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/bookings">View My Bookings</Link>
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book your flights in just a few clicks with our intuitive interface.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Best Prices</h3>
            <p className="text-gray-600">
              We compare prices across airlines to get you the best deals.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Our customer support team is available around the clock to assist you.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
