import { Metadata } from "next";
import FlightSearchForm from "@/components/flights/FlightSearchForm";

export const metadata: Metadata = {
  title: "Flight Search | FlightsBooking",
  description: "Search for flights to your destination",
};

export default function FlightSearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Flight</h1>
      <FlightSearchForm />
    </div>
  );
} 