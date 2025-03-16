import { BookingData as ApiBookingData } from "@/services/api";

// Define a local type that matches form data structure
export type BookingData = Omit<ApiBookingData, 'passengers'> & {
  passengers?: Array<{
    title: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    passportExpiry: string;
  }>;
  bookingId?: string;
  flightDetails?: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: {
      code: string;
      city: string;
      name: string;
    };
    destination: {
      code: string;
      city: string;
      name: string;
    };
    departureTime: string;
    arrivalTime: string;
    duration: string;
    aircraft: string;
    basePrice: number;
    cabinClass: string;
  };
};

const BOOKING_STORAGE_KEY = 'flightBookingData';

/**
 * Save booking data to localStorage
 */
export const saveBookingData = (bookingData: Partial<BookingData>): void => {
  try {
    // Get existing data first
    const existingData = getBookingData();
    
    // Merge with new data
    const updatedData = {
      ...existingData,
      ...bookingData,
    };
    
    // Save to localStorage
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Failed to save booking data to localStorage:', error);
  }
};

/**
 * Retrieve booking data from localStorage
 */
export const getBookingData = (): Partial<BookingData> => {
  try {
    const data = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!data) return {};
    
    return JSON.parse(data) as Partial<BookingData>;
  } catch (error) {
    console.error('Failed to retrieve booking data from localStorage:', error);
    return {};
  }
};

/**
 * Clear booking data from localStorage
 */
export const clearBookingData = (): void => {
  try {
    localStorage.removeItem(BOOKING_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear booking data from localStorage:', error);
  }
};

/**
 * Check if there is any booking data stored
 */
export const hasBookingData = (): boolean => {
  try {
    const data = localStorage.getItem(BOOKING_STORAGE_KEY);
    return !!data;
  } catch {
    // Silently handle the error and return false
    return false;
  }
}; 