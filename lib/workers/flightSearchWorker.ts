import { FlightSearchResult } from '../services/flights/flightSearchService';

// Define message types for worker communication
type WorkerMessage = {
  action: 'filter' | 'sort';
  flights: FlightSearchResult[];
  filters?: FilterOptions;
  sortOption?: SortOption;
};

type FilterOptions = {
  priceRange?: { min: number; max: number };
  airlines?: string[];
  stops?: number[];
  departureTimeRange?: { start: string; end: string };
  arrivalTimeRange?: { start: string; end: string };
  directOnly?: boolean;
};

type SortOption = 'price' | 'duration' | 'departure' | 'arrival';

// Filter flights based on criteria
function filterFlights(flights: FlightSearchResult[], filters: FilterOptions): FlightSearchResult[] {
  return flights.filter(flight => {
    // Filter by price range
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (flight.price < min || flight.price > max) return false;
    }

    // Filter by airlines
    if (filters.airlines && filters.airlines.length > 0) {
      if (!filters.airlines.includes(flight.airline)) return false;
    }

    // Filter by stops
    if (filters.stops && filters.stops.length > 0) {
      if (!filters.stops.includes(flight.stops)) return false;
    }

    // Filter direct flights only
    if (filters.directOnly && flight.stops > 0) return false;

    // Filter by departure time range
    if (filters.departureTimeRange) {
      const { start, end } = filters.departureTimeRange;
      if (flight.departureTime < start || flight.departureTime > end) return false;
    }

    // Filter by arrival time range
    if (filters.arrivalTimeRange) {
      const { start, end } = filters.arrivalTimeRange;
      if (flight.arrivalTime < start || flight.arrivalTime > end) return false;
    }

    return true;
  });
}

// Sort flights based on criteria
function sortFlights(flights: FlightSearchResult[], sortOption: SortOption): FlightSearchResult[] {
  const sortedFlights = [...flights];
  
  sortedFlights.sort((a, b) => {
    switch (sortOption) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        // Convert duration (e.g., "2h 30m") to minutes for comparison
        const aDuration = durationToMinutes(a.duration);
        const bDuration = durationToMinutes(b.duration);
        return aDuration - bDuration;
      case 'departure':
        return a.departureTime.localeCompare(b.departureTime);
      case 'arrival':
        return a.arrivalTime.localeCompare(b.arrivalTime);
      default:
        return 0;
    }
  });
  
  return sortedFlights;
}

// Helper function to convert duration string to minutes
function durationToMinutes(duration: string | number): number {
  // If duration is already a number, return it
  if (typeof duration === 'number') return duration;
  
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  
  const hours = parseInt(match[1], 10) || 0;
  const minutes = parseInt(match[2], 10) || 0;
  
  return hours * 60 + minutes;
}

// Set up worker message handler
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { action, flights, filters, sortOption } = event.data;
  
  try {
    let results: FlightSearchResult[] = [...flights];
    
    // Apply filters if provided
    if (action === 'filter' && filters) {
      results = filterFlights(results, filters);
    }
    
    // Apply sorting if provided
    if (sortOption) {
      results = sortFlights(results, sortOption);
    }
    
    // Send the processed results back to the main thread
    self.postMessage({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      success: false,
      error: (error as Error).message
    });
  }
});

export {}; 