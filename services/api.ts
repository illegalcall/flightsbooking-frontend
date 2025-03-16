// services/api.ts
const API_BASE_URL = 'http://localhost:4000/v1';

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

// Passenger endpoints
export const passengerApi = {
  validatePassenger: async (passengerData: PassengerData): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/passengers/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passengerData),
      });
      
      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate passenger data';
      return { success: false, error: errorMessage };
    }
  },
};

// Booking endpoints
export const bookingApi = {
  createBooking: async (bookingData: BookingData): Promise<ApiResponse<{ id: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      return { success: false, error: errorMessage };
    }
  },
  
  getBooking: async (bookingId: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch booking details';
      return { success: false, error: errorMessage };
    }
  },
  
  confirmBooking: async (bookingId: string, paymentData: { paymentId: string; status: string }): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      
      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm booking';
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

// Payment endpoints
export const paymentApi = {
  createPaymentIntent: async (paymentData: PaymentIntentData): Promise<ApiResponse<{ clientSecret: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      
      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
      return { success: false, error: errorMessage };
    }
  },
  
  confirmPayment: async (paymentId: string, confirmationData: Record<string, unknown>): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmationData),
      });
      
      return await response.json();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment';
      return { success: false, error: errorMessage };
    }
  },
}; 