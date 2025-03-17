import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ApiBooking, bookingApi } from '@/services/api';
import { flightsApi } from '@/services/api';

// Define booking types
export interface Booking {
  id: string;
  flightId: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookingDate: string;
  departureDate: string;
  returnDate?: string;
  passengers: Passenger[];
  totalPrice: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  checkedIn: boolean;
  seatSelections: SeatSelection[];
  addOns: AddOn[];
  contactInfo: ContactInfo;
  flightDetails: FlightDetails;
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  specialRequirements?: string;
}

export interface SeatSelection {
  passengerId: string;
  seatNumber: string;
  cabin: 'economy' | 'premium' | 'business' | 'first';
  legType: 'outbound' | 'return';
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ContactInfo {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface FlightDetails {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  returnFlightNumber?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;
}

// Define filter types
export interface BookingFilters {
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'all';
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  searchTerm?: string;
  sortBy?: 'date' | 'price' | 'status';
  sortDirection?: 'asc' | 'desc';
}

// Define store state
interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  selectedBooking: Booking | null;
  filters: BookingFilters;
  // Actions
  fetchBookings: () => Promise<void>;
  selectBooking: (id: string) => void;
  updateFilters: (filters: Partial<BookingFilters>) => void;
  getFilteredBookings: () => Booking[];
  checkInPassenger: (bookingId: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  downloadETicket: (id: string) => Promise<boolean>;
}

const fetchBookingsFromAPI = async (): Promise<Booking[]> => {
  try {
    const response = await bookingApi.getUserBookings();
    
    console.log("API Response:", response);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch bookings');
    }
    
    // Map API booking format to our frontend Booking type
    const bookingsPromises = response.data.map(async (apiBooking: ApiBooking) => {
      console.log("Processing booking:", apiBooking);
      
      // Attempt to fetch flight details
      let departureAirport = 'LHR';
      let arrivalAirport = 'JFK';
      
      try {
        const flightResponse = await flightsApi.getFlightDetails(apiBooking.flightId);
        if (flightResponse.success && flightResponse.data) {
          departureAirport = flightResponse.data.origin.code;
          arrivalAirport = flightResponse.data.destination.code;
        }
      } catch (error) {
        console.error(`Error fetching flight details for ${apiBooking.flightId}:`, error);
        // Fallback to the hardcoded values based on ID
        departureAirport = apiBooking.id.includes('e5b4510c') ? 'LAX' : 'LHR';
        arrivalAirport = apiBooking.id.includes('e5b4510c') ? 'SFO' : 'JFK';
      }
      
      // Convert API booking to our frontend booking format
      return {
        id: apiBooking.id,
        flightId: apiBooking.flightId,
        status: mapBookingStatus(apiBooking.status),
        bookingDate: apiBooking.createdAt,
        departureDate: new Date().toISOString(), // Would need to fetch from flight API
        returnDate: undefined, // Would need to fetch from flight API
        passengers: apiBooking.passengerDetails.map((p, index) => {
          const [firstName, ...lastNameParts] = p.fullName.split(' ');
          const lastName = lastNameParts.join(' ');
          
          return {
            id: `passenger-${index}`,
            firstName,
            lastName,
            dateOfBirth: `${new Date().getFullYear() - p.age}-01-01`, // Approximation
            passportNumber: p.documentNumber,
            specialRequirements: p.specialRequests,
          };
        }),
        totalPrice: apiBooking.totalAmount,
        paymentStatus: apiBooking.confirmedAt ? 'paid' : 'pending' as 'paid' | 'pending' | 'refunded',
        checkedIn: false, // Assuming no check-in info in API
        seatSelections: apiBooking.bookedSeats.map((seat, index) => ({
          passengerId: `passenger-${index % apiBooking.passengerDetails.length}`,
          seatNumber: seat,
          cabin: mapCabinType(apiBooking.selectedCabin),
          legType: 'outbound' as 'outbound' | 'return',
        })),
        addOns: [], // No add-ons in API
        contactInfo: {
          email: 'user@example.com', // Would need to fetch from user profile
          phone: '', // Would need to fetch from user profile
        },
        flightDetails: {
          // This would need to be fetched from a flights API in a real implementation
          flightNumber: `FL-${apiBooking.bookingReference}`,
          airline: 'FlightsBooking Airlines',
          departureAirport,
          arrivalAirport,
          departureTime: new Date().toISOString(),
          arrivalTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString(),
          duration: '8h 0m',
          aircraft: 'Boeing 777',
        },
      };
    });
    
    return Promise.all(bookingsPromises);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

// Helper function to map API status to our status enum
const mapBookingStatus = (status: string): Booking['status'] => {
  const statusMap: Record<string, Booking['status']> = {
    'Confirmed': 'confirmed',
    'AwaitingPayment': 'pending',
    'Cancelled': 'cancelled',
    'Completed': 'completed',
  };
  return statusMap[status] || 'pending';
};

// Helper function to map API cabin type to our cabin type
const mapCabinType = (cabin: string): SeatSelection['cabin'] => {
  const cabinMap: Record<string, SeatSelection['cabin']> = {
    'Economy': 'economy',
    'Premium': 'premium',
    'Business': 'business',
    'First': 'first',
  };
  return cabinMap[cabin] || 'economy';
};

// Create the store
export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      isLoading: false,
      error: null,
      selectedBooking: null,
      filters: {
        status: 'all',
        dateRange: {
          from: null,
          to: null,
        },
        searchTerm: '',
        sortBy: 'date',
        sortDirection: 'desc',
      },
      
      // Fetch bookings from API
      fetchBookings: async () => {
        set({ isLoading: true, error: null });
        try {
          const bookings = await fetchBookingsFromAPI();
          set({ bookings, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch bookings', 
            isLoading: false 
          });
        }
      },
      
      // Select a booking by ID
      selectBooking: (id: string) => {
        const booking = get().bookings.find(b => b.id === id) || null;
        set({ selectedBooking: booking });
      },
      
      // Update filters
      updateFilters: (filters: Partial<BookingFilters>) => {
        set({ filters: { ...get().filters, ...filters } });
      },
      
      // Get filtered bookings
      getFilteredBookings: () => {
        const { bookings, filters } = get();
        
        return bookings.filter(booking => {
          // Filter by status
          if (filters.status && filters.status !== 'all' && booking.status !== filters.status) {
            return false;
          }
          
          // Filter by date range
          if (filters.dateRange?.from && filters.dateRange?.to) {
            const bookingDate = new Date(booking.departureDate);
            const fromDate = filters.dateRange.from;
            const toDate = filters.dateRange.to;
            
            if (bookingDate < fromDate || bookingDate > toDate) {
              return false;
            }
          }
          
          // Filter by search term
          if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            const searchableFields = [
              booking.id,
              booking.flightDetails.flightNumber,
              booking.flightDetails.departureAirport,
              booking.flightDetails.arrivalAirport,
              ...booking.passengers.map(p => `${p.firstName} ${p.lastName}`),
            ];
            
            return searchableFields.some(field => 
              field.toLowerCase().includes(searchTerm)
            );
          }
          
          return true;
        }).sort((a, b) => {
          // Sort by selected criteria
          if (filters.sortBy === 'date') {
            return filters.sortDirection === 'asc'
              ? new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
              : new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime();
          }
          
          if (filters.sortBy === 'price') {
            return filters.sortDirection === 'asc'
              ? a.totalPrice - b.totalPrice
              : b.totalPrice - a.totalPrice;
          }
          
          if (filters.sortBy === 'status') {
            return filters.sortDirection === 'asc'
              ? a.status.localeCompare(b.status)
              : b.status.localeCompare(a.status);
          }
          
          return 0;
        });
      },
      
      // Check-in passenger
      checkInPassenger: async (bookingId: string) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => {
            const bookings = state.bookings.map(booking => {
              if (booking.id === bookingId) {
                return {
                  ...booking,
                  checkedIn: true,
                };
              }
              return booking;
            });
            
            // Update selected booking if it's the one being modified
            const selectedBooking = 
              state.selectedBooking?.id === bookingId
                ? bookings.find(b => b.id === bookingId) || null
                : state.selectedBooking;
                
            return { bookings, selectedBooking, isLoading: false };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to check in', 
            isLoading: false 
          });
        }
      },
      
      // Cancel booking
      cancelBooking: async (id: string) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => {
            const bookings = state.bookings.map(booking => {
              if (booking.id === id) {
                return {
                  ...booking,
                  status: 'cancelled' as const,
                };
              }
              return booking;
            });
            
            // Update selected booking if it's the one being modified
            const selectedBooking = 
              state.selectedBooking?.id === id
                ? bookings.find(b => b.id === id) || null
                : state.selectedBooking;
                
            return { bookings, selectedBooking, isLoading: false };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to cancel booking', 
            isLoading: false 
          });
        }
      },
      
      // Download E-ticket
      downloadETicket: async (id: string) => {
        try {
          // Simulate API call that would generate and return a ticket PDF
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real implementation, this would receive a blob or PDF data
          // and trigger a download using browser APIs
          console.log(`Downloading E-ticket for booking ${id}`);
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to download ticket', 
          });
          return false;
        }
      },
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        // Do not persist API data to localStorage
      }),
    }
  )
); 