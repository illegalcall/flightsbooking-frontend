// Mock API client for bookings

// Define types
export interface ApiBooking {
  id: string;
  bookingReference: string;
  flightId: string;
  selectedCabin: string;
  totalAmount: number;
  bookedSeats: string[];
  createdAt: string;
  status: string;
  passengerDetails: {
    fullName: string;
    age: number;
    documentNumber?: string;
    specialRequests?: string;
  }[];
  confirmedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock data
const mockBookings: ApiBooking[] = [
  {
    id: "bkg_123456",
    bookingReference: "RX7YH2",
    flightId: "flt_123456",
    selectedCabin: "Economy",
    totalAmount: 450.99,
    bookedSeats: ["12A", "12B"],
    createdAt: "2023-05-10T14:20:00Z",
    status: "Confirmed",
    confirmedAt: "2023-05-10T14:25:00Z",
    passengerDetails: [
      {
        fullName: "John Doe",
        age: 35,
        documentNumber: "AB123456",
      },
      {
        fullName: "Jane Doe",
        age: 32,
        documentNumber: "CD789012",
        specialRequests: "Vegetarian meal",
      },
    ],
  },
  {
    id: "bkg_234567",
    bookingReference: "QT8P3S",
    flightId: "flt_234567",
    selectedCabin: "Business",
    totalAmount: 2349.0,
    bookedSeats: ["2F"],
    createdAt: "2023-05-12T09:15:00Z",
    status: "AwaitingPayment",
    passengerDetails: [
      {
        fullName: "Alice Johnson",
        age: 28,
        documentNumber: "EF345678",
        specialRequests: "Wheelchair assistance",
      },
    ],
  },
];

// API client
export const bookingApi = {
  // Get user bookings
  getUserBookings: async (): Promise<ApiResponse<ApiBooking[]>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: mockBookings,
    };
  },
  
  // Get booking by ID
  getBookingById: async (id: string): Promise<ApiResponse<ApiBooking>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const booking = mockBookings.find((b) => b.id === id);
    
    if (booking) {
      return {
        success: true,
        data: booking,
      };
    }
    
    return {
      success: false,
      error: "Booking not found",
    };
  },
  
  // Cancel booking
  cancelBooking: async (id: string): Promise<ApiResponse<void>> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const bookingIndex = mockBookings.findIndex((b) => b.id === id);
    
    if (bookingIndex !== -1) {
      mockBookings[bookingIndex].status = "Cancelled";
      return {
        success: true,
      };
    }
    
    return {
      success: false,
      error: "Booking not found",
    };
  },
}; 