"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveBookingData } from "@/utils/localStorage";
import { seatsApi, SeatMapResponse } from "@/services/api";

// Define pricing for each cabin class
const cabinPricing = {
  "Economy": 0,
  "PremiumEconomy": 35,
  "Business": 120,
  "First": 250,
};


// Fetch seat map from API
const fetchSeatMap = async (flightId: string): Promise<SeatMapResponse> => {
  try {
    const response = await seatsApi.getSeatMap(flightId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch seat map");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching seat map:", error);
    throw error;
  }
};

// This would be replaced with actual seat data from an API
const seatClasses = [
  { id: "Economy", name: "Economy", price: 0, available: 0 },
  { id: "PremiumEconomy", name: "Premium Economy", price: 35, available: 0 },
  { id: "Business", name: "Business", price: 120, available: 0 },
  { id: "First", name: "First Class", price: 250, available: 0 },
];

interface FormattedSeat {
  id: string;
  number: string;
  class: string;
  available: boolean;
  price: number;
}

interface FormattedRow {
  rowNum: number;
  seats: FormattedSeat[];
}

interface PassengerData {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

interface SeatSelectionData {
  passengerId: number;
  seatNumber: string;
  seatClass: string;
  price: number;
}

interface SeatSelectionStepProps {
  flightId: string;
  passengers: PassengerData[];
  onComplete: (data: { selectedSeats: SeatSelectionData[] }) => void;
  onBack: () => void;
}

export function SeatSelectionStep({
  flightId,
  passengers,
  onComplete,
  onBack,
}: SeatSelectionStepProps) {
  const [selectedClass, setSelectedClass] = useState<string>("Economy");
  const [seatMap, setSeatMap] = useState<FormattedRow[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Record<number, string>>(
    {}
  );
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [availableSeatClasses, setAvailableSeatClasses] = useState(seatClasses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seat map data from API
  useEffect(() => {
    const getSeatMap = async () => {
      try {
        setLoading(true);
        const data = await fetchSeatMap(flightId);
        
        // Format the API response into the component's expected format
        const formattedRows: FormattedRow[] = [];
        const seatClassCount: Record<string, number> = {
          "Economy": 0,
          "PremiumEconomy": 0,
          "Business": 0,
          "First": 0,
        };
        
        // Process all seat maps from the API
        data.seatMaps.forEach(seatMap => {
          // Get all unique row numbers
          const uniqueRows = [...new Set(seatMap.seats.map(seat => seat.position.row))];
          
          // For each row, create a formatted row
          uniqueRows.forEach(rowNum => {
            const rowSeats = seatMap.seats.filter(seat => seat.position.row === rowNum);
            
            // Create a formatted seat for each seat in the row
            const formattedSeats: FormattedSeat[] = rowSeats.map(seat => {
              const available = !seat.isBlocked && !seat.isBooked && !seat.isLocked;
              
              // Count available seats per class
              if (available) {
                seatClassCount[seat.cabin] = (seatClassCount[seat.cabin] || 0) + 1;
              }
              
              return {
                id: seat.id,
                number: seat.seatNumber,
                class: seat.cabin,
                available,
                price: cabinPricing[seat.cabin as keyof typeof cabinPricing] || 0,
              };
            });
            
            formattedRows.push({
              rowNum,
              seats: formattedSeats,
            });
          });
        });
        
        // Sort rows by row number
        formattedRows.sort((a, b) => a.rowNum - b.rowNum);
        
        // Update seat classes with available counts
        const updatedSeatClasses = seatClasses.map(seatClass => ({
          ...seatClass,
          available: seatClassCount[seatClass.id] || 0,
        }));
        
        setSeatMap(formattedRows);
        setAvailableSeatClasses(updatedSeatClasses);
        setLoading(false);
      } catch (error) {
        console.error("Error loading seat map:", error);
        setError("Failed to load seat map. Please try again later.");
        setLoading(false);
      }
    };
    
    getSeatMap();
  }, [flightId]);

  const handleSeatSelect = (seatId: string) => {
    if (currentPassengerIndex < passengers.length) {
      // Update selected seats
      setSelectedSeats((prev) => ({
        ...prev,
        [currentPassengerIndex]: seatId,
      }));

      // Move to next passenger if available
      if (currentPassengerIndex < passengers.length - 1) {
        setCurrentPassengerIndex((prev) => prev + 1);
      }
    }
  };

  // Check if a seat is selected by any passenger
  const isSeatSelected = (seatId: string) => {
    return Object.values(selectedSeats).includes(seatId);
  };

  // Get passenger name who selected a seat
  const getPassengerForSeat = (seatId: string) => {
    const passengerIndex = Object.entries(selectedSeats).find(
      ([, seat]) => seat === seatId
    )?.[0];

    if (passengerIndex !== undefined) {
      const passenger = passengers[parseInt(passengerIndex)];
      return `${passenger.firstName} ${passenger.lastName}`;
    }
    return null;
  };

  const handleContinue = () => {
    // Convert selected seats to the format expected by onComplete
    const mappedSeats = Object.entries(selectedSeats).map(
      ([passengerIdx, seatId]) => {
        const seatRow = seatMap.find((row) =>
          row.seats.some((seat) => seat.id === seatId)
        );
        const seat = seatRow?.seats.find((s) => s.id === seatId);

        return {
          passengerId: parseInt(passengerIdx),
          seatNumber: seat?.number || "",
          seatClass: seat?.class || selectedClass,
          price: seat?.price || 0,
        };
      }
    );

    // Save the selected seats to localStorage
    saveBookingData({ selectedSeats: mappedSeats });

    // Continue to next step
    onComplete({ selectedSeats: mappedSeats });
  };

  // Filter seats to show only the selected class
  const filteredSeatMap = seatMap.filter((row) =>
    row.seats.some((seat) => seat.class === selectedClass)
  );

  const currentPassenger = passengers[currentPassengerIndex];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Seat Selection</h2>
        <p className="text-center py-10">Loading seat map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Seat Selection</h2>
        <div className="text-center py-10 text-red-500">{error}</div>
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Seat Selection</h2>
      <p className="text-muted-foreground">
        Select your preferred seat class, and choose seats for each passenger.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableSeatClasses.map((seatClass) => (
          <Card
            key={seatClass.id}
            className={`cursor-pointer transition-all ${
              selectedClass === seatClass.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedClass(seatClass.id)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{seatClass.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {seatClass.available} seats available
                </p>
              </div>
              <div className="text-right">
                {seatClass.price > 0 ? (
                  <Badge variant="outline">+${seatClass.price}</Badge>
                ) : (
                  <Badge variant="outline">Included</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6">
        <div className="mb-4">
          <h3 className="font-medium mb-2">
            Select a seat for: {currentPassenger?.firstName}{" "}
            {currentPassenger?.lastName}
          </h3>
          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-100 border border-blue-200 mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 border border-gray-300 mr-2"></div>
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-600 border border-blue-700 mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-lg shadow-sm p-4 overflow-x-auto bg-white">
          {/* Aircraft container with background silhouette */}
          <div className="relative flex flex-col items-center mx-auto max-w-xs">
            {/* Full aircraft background image */}
            <div className="relative w-full h-auto">
              {/* Aircraft silhouette background */}
              <div className="absolute inset-0 bg-blue-50 opacity-30 z-0">
                <div className="relative w-full h-full">
                  {/* Nose */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-[15%] bg-blue-50 rounded-t-full border-t border-l border-r border-blue-100"></div>

                  {/* Body */}
                  <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 w-[40%] h-[65%] bg-blue-50 border-l border-r border-blue-100"></div>

                  {/* Wings */}
                  <div className="absolute top-[30%] left-0 w-full h-[20%]">
                    <div className="relative w-full h-full">
                      <div className="absolute left-0 w-[30%] h-full bg-blue-50 border border-blue-100 rounded-l-lg"></div>
                      <div className="absolute right-0 w-[30%] h-full bg-blue-50 border border-blue-100 rounded-r-lg"></div>
                    </div>
                  </div>

                  {/* Tail */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[40%] h-[10%] bg-blue-50 rounded-b-lg border-b border-l border-r border-blue-100"></div>
                </div>
              </div>

              {/* Seat map overlay */}
              <div className="relative z-10 pt-8 pb-8">
                <div className="bg-white bg-opacity-90 rounded-lg border border-blue-100 p-3 mx-auto max-w-[200px]">
                  {filteredSeatMap.map((row) => (
                    <div
                      key={row.rowNum}
                      className="flex justify-center items-center mb-1"
                    >
                      <div className="grid grid-cols-3 gap-1 mr-2">
                        {row.seats.slice(0, 3).map((seat) => (
                          <button
                            key={seat.id}
                            className={`
                              w-6 h-6 flex items-center justify-center text-[10px] font-medium
                              transition-all duration-150
                              ${
                                !seat.available
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : isSeatSelected(seat.id)
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : seat.class === "First"
                                      ? "bg-blue-800 text-white hover:bg-blue-900"
                                      : seat.class === "Business"
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : seat.class === "PremiumEconomy"
                                          ? "bg-blue-400 text-white hover:bg-blue-500"
                                          : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                              }
                            `}
                            disabled={
                              !seat.available ||
                              (isSeatSelected(seat.id) &&
                                !getPassengerForSeat(seat.id)?.includes(
                                  currentPassenger?.firstName || ""
                                ))
                            }
                            onClick={() =>
                              seat.available && handleSeatSelect(seat.id)
                            }
                            title={`${seat.number} - ${seat.class}${isSeatSelected(seat.id) ? ` - Selected by ${getPassengerForSeat(seat.id)}` : ""}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mx-1"></div>
                      <div className="grid grid-cols-3 gap-1">
                        {row.seats.slice(3, 6).map((seat) => (
                          <button
                            key={seat.id}
                            className={`
                              w-6 h-6 flex items-center justify-center text-[10px] font-medium
                              transition-all duration-150
                              ${
                                !seat.available
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : isSeatSelected(seat.id)
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : seat.class === "First"
                                      ? "bg-blue-800 text-white hover:bg-blue-900"
                                      : seat.class === "Business"
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : seat.class === "PremiumEconomy"
                                          ? "bg-blue-400 text-white hover:bg-blue-500"
                                          : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                              }
                            `}
                            disabled={
                              !seat.available ||
                              (isSeatSelected(seat.id) &&
                                !getPassengerForSeat(seat.id)?.includes(
                                  currentPassenger?.firstName || ""
                                ))
                            }
                            onClick={() =>
                              seat.available && handleSeatSelect(seat.id)
                            }
                            title={`${seat.number} - ${seat.class}${isSeatSelected(seat.id) ? ` - Selected by ${getPassengerForSeat(seat.id)}` : ""}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Class legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-800 mr-2"></div>
              <span className="text-xs">First Class</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-600 mr-2"></div>
              <span className="text-xs">Business</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-400 mr-2"></div>
              <span className="text-xs">Premium Economy</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 mr-2"></div>
              <span className="text-xs">Economy</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-3">Selected Seats:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {passengers.map((passenger, index) => {
              const seatId = selectedSeats[index];
              const seat = seatMap
                .flatMap((row) => row.seats)
                .find((s) => s.id === seatId);

              const seatNumber = seat?.number || "Not selected";
              const seatClass = seat?.class || "";
              const seatPrice = seat?.price || 0;

              return (
                <div
                  key={index}
                  className={`p-3 border rounded-lg transition-all ${seatId ? "bg-white shadow-sm" : "bg-gray-50"}`}
                >
                  <div className="font-medium">
                    {passenger.firstName} {passenger.lastName}
                  </div>
                  <div className="text-sm mt-1 flex justify-between">
                    <span>
                      Seat:{" "}
                      <span
                        className={`font-medium ${seatId ? "text-blue-600" : "text-gray-500"}`}
                      >
                        {seatNumber}
                      </span>
                    </span>
                    {seatId && seatPrice > 0 && (
                      <span className="text-gray-500">+${seatPrice}</span>
                    )}
                  </div>
                  {seatId && (
                    <div className="text-xs text-gray-500 mt-1">
                      {seatClass}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={Object.keys(selectedSeats).length < passengers.length}
        >
          Continue to Add-ons
        </Button>
      </div>
    </div>
  );
}
