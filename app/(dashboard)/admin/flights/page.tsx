"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  capacity: {
    economy: number;
    business: number;
    first: number;
  };
  bookedSeats: number;
}

export default function FlightsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  useEffect(() => {
    // In a real app, you would fetch this data from the API
    // For now, we'll simulate loading with a timeout
    const timer = setTimeout(() => {
      // Mock data
      const mockFlights: Flight[] = [
        {
          id: "flt_123456",
          flightNumber: "BA456",
          airline: "British Airways",
          origin: "LHR",
          destination: "JFK",
          departureTime: "2023-06-15T08:30:00Z",
          arrivalTime: "2023-06-15T11:45:00Z",
          status: "scheduled",
          capacity: {
            economy: 150,
            business: 30,
            first: 10,
          },
          bookedSeats: 120,
        },
        {
          id: "flt_234567",
          flightNumber: "LH731",
          airline: "Lufthansa",
          origin: "FRA",
          destination: "SIN",
          departureTime: "2023-06-16T22:15:00Z",
          arrivalTime: "2023-06-17T16:30:00Z",
          status: "delayed",
          capacity: {
            economy: 200,
            business: 40,
            first: 8,
          },
          bookedSeats: 180,
        },
        {
          id: "flt_345678",
          flightNumber: "EK502",
          airline: "Emirates",
          origin: "DXB",
          destination: "SYD",
          departureTime: "2023-06-15T02:00:00Z",
          arrivalTime: "2023-06-15T22:30:00Z",
          status: "in-air",
          capacity: {
            economy: 300,
            business: 60,
            first: 14,
          },
          bookedSeats: 320,
        },
        {
          id: "flt_456789",
          flightNumber: "AA189",
          airline: "American Airlines",
          origin: "LAX",
          destination: "ORD",
          departureTime: "2023-06-14T14:20:00Z",
          arrivalTime: "2023-06-14T20:35:00Z",
          status: "completed",
          capacity: {
            economy: 180,
            business: 24,
            first: 0,
          },
          bookedSeats: 150,
        },
        {
          id: "flt_567890",
          flightNumber: "QF8",
          airline: "Qantas",
          origin: "SYD",
          destination: "DFW",
          departureTime: "2023-06-17T09:40:00Z",
          arrivalTime: "2023-06-18T08:25:00Z",
          status: "cancelled",
          capacity: {
            economy: 280,
            business: 50,
            first: 12,
          },
          bookedSeats: 0,
        },
      ];

      setFlights(mockFlights);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter flights based on search query and filters
  const filteredFlights = flights.filter((flight) => {
    const matchesSearch =
      flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || flight.status === statusFilter;
    const matchesAirline =
      airlineFilter === "all" || flight.airline === airlineFilter;

    return matchesSearch && matchesStatus && matchesAirline;
  });

  const handleViewDetails = (flightId: string) => {
    router.push(`/dashboard/admin/flights/${flightId}`);
  };

  const handleEditFlight = (flightId: string) => {
    router.push(`/dashboard/admin/flights/${flightId}/edit`);
  };

  const handleCancelFlight = (flightId: string) => {
    // In a real app, you would call an API to cancel the flight
    alert(`Cancel flight ${flightId}`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-air":
        return "bg-green-100 text-green-800";
      case "delayed":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getAirlineList = () => {
    const airlines = [...new Set(flights.map((flight) => flight.airline))];
    return airlines;
  };

  const calculateOccupancy = (flight: Flight) => {
    const totalCapacity =
      flight.capacity.economy +
      flight.capacity.business +
      flight.capacity.first;
    const occupancyRate = (flight.bookedSeats / totalCapacity) * 100;
    return Math.round(occupancyRate);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Flight Management</h1>
          <p className="text-muted-foreground">
            View, edit, and manage flights
          </p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Flight
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Flight</DialogTitle>
              <DialogDescription>
                Add a new flight to the system. Fill in all the required fields.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Flight creation form would go here */}
              <p>Create flight form would be implemented here</p>
            </div>
            <DialogFooter>
              <Button type="submit">Create Flight</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Flights</CardTitle>
          <CardDescription>Search and filter the flights list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by flight number, airline, or airports"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-air">In Air</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={airlineFilter} onValueChange={setAirlineFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by airline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Airlines</SelectItem>
                {getAirlineList().map((airline) => (
                  <SelectItem key={airline} value={airline}>
                    {airline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setAirlineFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flights</CardTitle>
          <CardDescription>
            Showing {filteredFlights.length} of {flights.length} flights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading flights...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight Number</TableHead>
                    <TableHead>Airline</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlights.map((flight) => (
                    <TableRow key={flight.id}>
                      <TableCell className="font-medium">
                        {flight.flightNumber}
                      </TableCell>
                      <TableCell>{flight.airline}</TableCell>
                      <TableCell>
                        {flight.origin} → {flight.destination}
                      </TableCell>
                      <TableCell>{formatDate(flight.departureTime)}</TableCell>
                      <TableCell>{formatDate(flight.arrivalTime)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(flight.status)}
                        >
                          {flight.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{calculateOccupancy(flight)}%</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <button
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleViewDetails(flight.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View details</span>
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <button
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleEditFlight(flight.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit flight</span>
                              </button>
                            </DropdownMenuItem>
                            {flight.status !== "cancelled" &&
                              flight.status !== "completed" && (
                                <DropdownMenuItem asChild>
                                  <button
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-600 hover:bg-accent hover:text-red-600"
                                    onClick={() =>
                                      handleCancelFlight(flight.id)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Cancel flight</span>
                                  </button>
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
