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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Eye, FileText, MoreHorizontal, Search, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";

interface Booking {
  id: string;
  referenceNumber: string;
  userId: string;
  userEmail: string;
  flightId: string;
  flightNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  passengers: number;
  cabinClass: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);

  useEffect(() => {
    // In a real app, you would fetch this data from the API
    // For now, we'll simulate loading with a timeout
    const timer = setTimeout(() => {
      // Mock data
      const mockBookings: Booking[] = [
        {
          id: "bkg_123456",
          referenceNumber: "RX7YH2",
          userId: "usr_123456",
          userEmail: "john.doe@example.com",
          flightId: "flt_123456",
          flightNumber: "BA456",
          route: "LHR → JFK",
          departureTime: "2023-06-15T08:30:00Z",
          arrivalTime: "2023-06-15T11:45:00Z",
          passengers: 2,
          cabinClass: "economy",
          status: "confirmed",
          totalAmount: 450.99,
          createdAt: "2023-05-10T14:20:00Z",
        },
        {
          id: "bkg_234567",
          referenceNumber: "QT8P3S",
          userId: "usr_234567",
          userEmail: "jane.smith@example.com",
          flightId: "flt_234567",
          flightNumber: "LH731",
          route: "FRA → SIN",
          departureTime: "2023-06-16T22:15:00Z",
          arrivalTime: "2023-06-17T16:30:00Z",
          passengers: 1,
          cabinClass: "business",
          status: "pending",
          totalAmount: 2349.0,
          createdAt: "2023-05-12T09:15:00Z",
        },
        {
          id: "bkg_345678",
          referenceNumber: "ZX5YH9",
          userId: "usr_345678",
          userEmail: "alice.johnson@example.com",
          flightId: "flt_345678",
          flightNumber: "EK502",
          route: "DXB → SYD",
          departureTime: "2023-06-15T02:00:00Z",
          arrivalTime: "2023-06-15T22:30:00Z",
          passengers: 3,
          cabinClass: "first",
          status: "cancelled",
          totalAmount: 9750.5,
          createdAt: "2023-05-05T11:30:00Z",
        },
        {
          id: "bkg_456789",
          referenceNumber: "PL7F43",
          userId: "usr_456789",
          userEmail: "bob.brown@example.com",
          flightId: "flt_456789",
          flightNumber: "AA189",
          route: "LAX → ORD",
          departureTime: "2023-06-14T14:20:00Z",
          arrivalTime: "2023-06-14T20:35:00Z",
          passengers: 1,
          cabinClass: "economy",
          status: "completed",
          totalAmount: 299.99,
          createdAt: "2023-05-01T16:45:00Z",
        },
        {
          id: "bkg_567890",
          referenceNumber: "TY2WX7",
          userId: "usr_567890",
          userEmail: "carol.white@example.com",
          flightId: "flt_567890",
          flightNumber: "QF8",
          route: "SYD → DFW",
          departureTime: "2023-06-17T09:40:00Z",
          arrivalTime: "2023-06-18T08:25:00Z",
          passengers: 2,
          cabinClass: "business",
          status: "refunded",
          totalAmount: 4500.0,
          createdAt: "2023-04-28T13:10:00Z",
        },
      ];

      setBookings(mockBookings);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filter bookings based on search query, status, and date range
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.referenceNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    let matchesDateRange = true;
    if (dateRange && dateRange.from) {
      const bookingDate = new Date(booking.departureTime);
      const from = new Date(dateRange.from);
      matchesDateRange = bookingDate >= from;

      if (dateRange.to) {
        const to = new Date(dateRange.to);
        matchesDateRange = matchesDateRange && bookingDate <= to;
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const handleViewDetails = (bookingId: string) => {
    router.push(`/dashboard/admin/bookings/${bookingId}`);
  };

  const handleCancelBooking = (bookingId: string) => {
    // In a real app, you would call an API to cancel the booking
    alert(`Cancel booking ${bookingId}`);
  };

  const handleGenerateInvoice = (bookingId: string) => {
    // In a real app, you would generate and download an invoice
    alert(`Generate invoice for booking ${bookingId}`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "refunded":
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatCabinClass = (cabinClass: string) => {
    return cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground">View and manage all bookings</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
          <CardDescription>Search and filter the bookings list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, email, flight"
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Filter by departure date"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateRange(undefined);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            Showing {filteredBookings.length} of {bookings.length} bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading bookings...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Flight</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.referenceNumber}
                      </TableCell>
                      <TableCell>{booking.userEmail}</TableCell>
                      <TableCell>{booking.flightNumber}</TableCell>
                      <TableCell>{booking.route}</TableCell>
                      <TableCell>{formatDate(booking.departureTime)}</TableCell>
                      <TableCell>
                        {formatCabinClass(booking.cabinClass)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(booking.status)}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
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
                                onClick={() => handleViewDetails(booking.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View details</span>
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <button
                                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() =>
                                  handleGenerateInvoice(booking.id)
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Generate invoice</span>
                              </button>
                            </DropdownMenuItem>
                            {(booking.status === "confirmed" ||
                              booking.status === "pending") && (
                              <DropdownMenuItem asChild>
                                <button
                                  className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-600 hover:bg-accent hover:text-red-600"
                                  onClick={() =>
                                    handleCancelBooking(booking.id)
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Cancel booking</span>
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
