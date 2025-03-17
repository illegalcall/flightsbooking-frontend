// services/api.ts

import { supabase } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_V1_URL = `${API_BASE_URL}/v1`;

export async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token || "";

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define passenger data interface
export interface PassengerData {
  title: "mr" | "mrs" | "ms" | "dr";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

// Define booking data interface
export interface BookingData {
  flightId: string;
  passengers: PassengerData[];
  contactInfo: {
    email: string;
    phoneNumber: string;
    phoneCountryCode?: string;
    address?: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  selectedSeats?: Array<{
    passengerId: number;
    seatNumber: string;
  }>;
  addons?: Array<{
    id: string;
    quantity: number;
  }>;
  bookingId?: string;
}

// Define booking API response interface
export interface ApiBooking {
  id: string;
  bookingReference: string;
  status: string;
  userProfileId: string;
  flightId: string;
  selectedCabin: string;
  totalAmount: number;
  passengerDetails: Array<{
    age: number;
    fullName: string;
    documentNumber: string;
    specialRequests: string;
  }>;
  bookedSeats: string[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}

// Admin interfaces
export interface UserFilterDto {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BookingFilterDto {
  userEmail?: string;
  bookingReference?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FlightFilterDto {
  airline?: string;
  flightNumber?: string;
  originCode?: string;
  destinationCode?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateUserRoleDto {
  role: "user" | "admin";
}

export interface UpdateBookingStatusDto {
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface CreateFlightDto {
  flightNumber: string;
  airline: string;
  aircraft: string;
  departureTime: string;
  arrivalTime: string;
  originCode: string;
  destinationCode: string;
  basePrice: number;
  availableSeats: number;
  status: "scheduled" | "on-time" | "delayed" | "cancelled";
}

export interface UpdateFlightDto {
  flightNumber?: string;
  airline?: string;
  aircraft?: string;
  departureTime?: string;
  arrivalTime?: string;
  basePrice?: number;
  availableSeats?: number;
  status?: "scheduled" | "on-time" | "delayed" | "cancelled";
}

// Passenger endpoints
export const passengerApi = {
  validatePassenger: async (
    passengerData: PassengerData
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/passengers/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify(passengerData),
      });

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to validate passenger data";
      return { success: false, error: errorMessage };
    }
  },
};
// Booking endpoints
export const bookingApi = {
  createBooking: async (
    bookingData: BookingData
  ): Promise<ApiResponse<{ id: string }>> => {
    try {
      console.log("trying to create booking");

      const headers = await getAuthHeaders();
      console.log("headers::::", headers);

      const response = await fetch(`${API_V1_URL}/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify(bookingData),
      });

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create booking";
      return { success: false, error: errorMessage };
    }
  },

  getBooking: async (bookingId: string): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_V1_URL}/bookings/${bookingId}`, {
        headers,
      });
      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch booking details";
      return { success: false, error: errorMessage };
    }
  },

  confirmBooking: async (
    bookingId: string,
    paymentData: { paymentId: string; status: string }
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_V1_URL}/bookings/${bookingId}/confirm`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(paymentData),
        }
      );

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to confirm booking";
      return { success: false, error: errorMessage };
    }
  },

  getUserBookings: async (): Promise<ApiResponse<ApiBooking[]>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_V1_URL}/bookings`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch user bookings";
      console.error("Error fetching bookings:", errorMessage);
      return { success: false, error: errorMessage };
    }
  },
};

// Payment data interface
export interface PaymentIntentData {
  bookingId: string;
  amount: number;
  currency: string;
  customer?: {
    email: string;
    name: string;
  };
}

// Seats endpoints
export const seatsApi = {
  getSeatMap: async (
    flightId: string
  ): Promise<ApiResponse<SeatMapResponse>> => {
    try {
      const response = await fetch(`${API_V1_URL}/seats/map/${flightId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch seat map: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch seat map";
      return { success: false, error: errorMessage };
    }
  },
};

// Payments endpoints
export const paymentsApi = {
  createPaymentIntent: async (
    paymentData: PaymentIntentData
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_V1_URL}/payments/create-intent`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create payment intent";
      return { success: false, error: errorMessage };
    }
  },
};

// Add SeatMapResponse interface
export interface SeatMap {
  cabin: string;
  rows: number;
  columns: string[];
  seats: Array<{
    id: string;
    flightId: string;
    seatNumber: string;
    cabin: string;
    position: {
      row: number;
      col: string;
    };
    isBlocked: boolean;
    isBooked: boolean;
    isLocked: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface SeatMapResponse {
  flightId: string;
  seatMaps: SeatMap[];
}

// Admin API endpoints
export const adminApi = {
  // User Management
  listUsers: async (filters: UserFilterDto = {}): Promise<ApiResponse> => {
    try {
      // Convert filters to query params
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/admin/users?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      return { success: false, error: errorMessage };
    }
  },

  getUserDetails: async (userId: string): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user details";
      return { success: false, error: errorMessage };
    }
  },

  updateUserRole: async (
    userId: string,
    roleData: UpdateUserRoleDto
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(roleData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user role";
      return { success: false, error: errorMessage };
    }
  },

  disableUser: async (userId: string): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/disable`,
        {
          method: "POST",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to disable user: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disable user";
      return { success: false, error: errorMessage };
    }
  },

  // Booking Management
  listBookings: async (
    filters: BookingFilterDto = {}
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      // Convert filters to query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/admin/bookings?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch bookings";
      return { success: false, error: errorMessage };
    }
  },

  getBookingDetails: async (bookingId: string): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/admin/bookings/${bookingId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch booking details: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch booking details";
      return { success: false, error: errorMessage };
    }
  },

  updateBookingStatus: async (
    bookingId: string,
    statusData: UpdateBookingStatusDto
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/admin/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(statusData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update booking status: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update booking status";
      return { success: false, error: errorMessage };
    }
  },

  // Flight Management
  listFlights: async (filters: FlightFilterDto = {}): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      // Convert filters to query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/admin/flights?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch flights: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch flights";
      return { success: false, error: errorMessage };
    }
  },

  createFlight: async (flightData: CreateFlightDto): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/admin/flights`, {
        method: "POST",
        headers,
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create flight: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create flight";
      return { success: false, error: errorMessage };
    }
  },

  getFlightDetails: async (flightId: string): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/admin/flights/${flightId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch flight details: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch flight details";
      return { success: false, error: errorMessage };
    }
  },

  updateFlight: async (
    flightId: string,
    flightData: UpdateFlightDto
  ): Promise<ApiResponse> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/admin/flights/${flightId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(flightData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update flight: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update flight";
      return { success: false, error: errorMessage };
    }
  },
};

// Flights endpoints
export const flightsApi = {
  getFlightDetails: async (
    flightId: string
  ): Promise<ApiResponse<FlightDetails>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_V1_URL}/flights/${flightId}`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to fetch flight details: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch flight details";
      return { success: false, error: errorMessage };
    }
  },
};

// Interface for flight details
export interface Airport {
  code: string;
  city: string;
  name: string;
}

export interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  basePrice: number;
  cabinClass: string;
}
