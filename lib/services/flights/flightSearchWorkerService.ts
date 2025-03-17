import { FlightSearchResult } from './flightSearchService';

// Types for filter options
export interface FilterOptions {
  priceRange?: { min: number; max: number };
  airlines?: string[];
  stops?: number[];
  departureTimeRange?: { start: string; end: string };
  arrivalTimeRange?: { start: string; end: string };
  directOnly?: boolean;
}

// Sort options
export type SortOption = 'price' | 'duration' | 'departure' | 'arrival';

// Worker response type
interface WorkerResponse {
  success: boolean;
  results?: FlightSearchResult[];
  count?: number;
  error?: string;
}

// Create and manage the flight search worker
class FlightSearchWorkerService {
  private worker: Worker | null = null;
  private isWorkerSupported: boolean = typeof Worker !== 'undefined';

  constructor() {
    this.initWorker();
  }

  // Initialize the worker if supported by the browser
  private initWorker(): void {
    if (this.isWorkerSupported) {
      try {
        this.worker = new Worker(
          new URL('@/lib/workers/flightSearchWorker.ts', import.meta.url)
        );
        console.log('Flight search worker initialized');
      } catch (error) {
        console.error('Error initializing flight search worker:', error);
        this.isWorkerSupported = false;
      }
    } else {
      console.warn('Web Workers are not supported in this browser');
    }
  }

  // Filter and sort flights using the worker
  public async processFlights(
    flights: FlightSearchResult[],
    filters?: FilterOptions,
    sortOption?: SortOption
  ): Promise<FlightSearchResult[]> {
    // Ensure flights is an array
    if (!flights || !Array.isArray(flights)) {
      console.warn('Invalid flights data provided to processFlights, using empty array');
      return [];
    }

    // If workers aren't supported, process in the main thread
    if (!this.isWorkerSupported || !this.worker) {
      console.log('Processing flights in main thread');
      return this.processInMainThread(flights, filters, sortOption);
    }

    // Use the worker for processing
    return new Promise((resolve, reject) => {
      // Set up the message handler
      const messageHandler = (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;
        
        // Clean up the event listener
        if (this.worker) {
          this.worker.removeEventListener('message', messageHandler);
        }
        
        // Handle the response
        if (data.success && data.results) {
          resolve(data.results);
        } else {
          reject(new Error(data.error || 'Unknown error processing flights'));
        }
      };
      
      // Add the event listener
      if (this.worker) {
        this.worker.addEventListener('message', messageHandler);
        
        // Send the request to the worker
        this.worker.postMessage({
          action: filters ? 'filter' : 'sort',
          flights,
          filters,
          sortOption
        });
      } else {
        reject(new Error('Worker not available'));
      }
    });
  }

  // Fallback processing in the main thread if workers aren't supported
  private processInMainThread(
    flights: FlightSearchResult[],
    filters?: FilterOptions,
    sortOption?: SortOption
  ): FlightSearchResult[] {
    let results = [...flights];
    
    // Apply filters
    if (filters) {
      results = this.filterFlights(results, filters);
    }
    
    // Apply sorting
    if (sortOption) {
      results = this.sortFlights(results, sortOption);
    }
    
    return results;
  }

  // Main thread filter implementation
  private filterFlights(flights: FlightSearchResult[], filters: FilterOptions): FlightSearchResult[] {
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

  // Main thread sort implementation
  private sortFlights(flights: FlightSearchResult[], sortOption: SortOption): FlightSearchResult[] {
    const sortedFlights = [...flights];
    
    sortedFlights.sort((a, b) => {
      switch (sortOption) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          // Convert duration (e.g., "2h 30m") to minutes for comparison
          const aDuration = this.durationToMinutes(a.duration);
          const bDuration = this.durationToMinutes(b.duration);
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
  private durationToMinutes(duration: string | number): number {
    // If duration is already a number, return it
    if (typeof duration === 'number') return duration;
    
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (!match) return 0;
    
    const hours = parseInt(match[1], 10) || 0;
    const minutes = parseInt(match[2], 10) || 0;
    
    return hours * 60 + minutes;
  }

  // Terminate the worker when no longer needed
  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      console.log('Flight search worker terminated');
    }
  }
}

// Create a singleton instance
export const flightSearchWorkerService = new FlightSearchWorkerService(); 