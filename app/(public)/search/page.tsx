"use client";

import { MainLayout } from "@/components/layout/main-layout";
import FlightSearchForm from "@/components/flights/FlightSearchForm";

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Search Flights</h1>
        <FlightSearchForm />
      </div>
    </MainLayout>
  );
} 