import { openDB, IDBPDatabase } from 'idb';

// Enum to match backend
export enum CabinClass {
  Economy = 'Economy',
  PremiumEconomy = 'PremiumEconomy',
  Business = 'Business',
  First = 'First'
}

// Types
export interface FlightSearchFormData {
  tripType: "one-way" | "round-trip" | "multi-city";
  originCode: string;
  destinationCode: string;
  departureDate: string;
  returnDate?: string;
  passengers: number; // Number of adult passengers
  cabinClass?: CabinClass;
  airline?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  directFlightsOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export interface FlightSearchResult {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: string | Record<string, unknown>;
  destination: string | Record<string, unknown>;
  duration: string | number;
  price: number;
  stops: number;
}

export interface PaginatedFlightResults {
  data: FlightSearchResult[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
  error?: string;
}

// Database name and version - use a more specific name to avoid conflicts
const DB_NAME = 'flights-search-db';  // Updated name to be more specific
const DB_VERSION = 2;

// Initialize the database
async function initializeDB(): Promise<IDBPDatabase> {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Upgrading IndexedDB ${DB_NAME} from version ${oldVersion} to ${newVersion}`);
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('flights')) {
        console.log('Creating flights store');
        const flightStore = db.createObjectStore('flights', { keyPath: 'id' });
        flightStore.createIndex('origin', 'origin', { unique: false });
        flightStore.createIndex('destination', 'destination', { unique: false });
        flightStore.createIndex('departureDate', 'departureDate', { unique: false });
        flightStore.createIndex('route', ['origin', 'destination'], { unique: false });
      }
      
      if (!db.objectStoreNames.contains('searchCache')) {
        console.log('Creating searchCache store');
        db.createObjectStore('searchCache', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('metadata')) {
        console.log('Creating metadata store');
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    }
  });
}

// Generate a cache key for search parameters
function generateCacheKey(searchParams: FlightSearchFormData): string {
  return `${searchParams.originCode}_${searchParams.destinationCode}_${searchParams.departureDate}_${searchParams.cabinClass || 'any'}`;
}

// Convert frontend form data to API search params
function convertFormDataToApiParams(formData: FlightSearchFormData): Record<string, unknown> {
  // Map our form structure to the API's expected parameters
  return {
    originCode: formData.originCode,
    destinationCode: formData.destinationCode,
    departureDate: formData.departureDate,
    returnDate: formData.returnDate,
    cabinClass: formData.cabinClass,
    passengers: formData.passengers,
    priceRange: formData.priceRange,
    airline: formData.airline,
    cursor: formData.cursor,
    limit: formData.limit || 10
  };
}

// Search flights using IndexedDB if available, or API if not
export async function searchFlights(searchParams: FlightSearchFormData): Promise<PaginatedFlightResults> {
  try {
    // Try to fetch from IndexedDB first (only if we're online, to avoid stale data)
    let cachedResults = null;
    
    try {
      if (navigator.onLine) {
        cachedResults = await searchFlightsFromCache(searchParams);
      }
    } catch (cacheError) {
      console.error('Error accessing cache, proceeding with API call:', cacheError);
      // We'll continue with the API call if there's a cache error
    }
    
    if (cachedResults && cachedResults.data.length > 0) {
      console.log('Returning cached flight results');
      
      // If we have cached results, initiate a background refresh
      if (navigator.onLine) {
        refreshFlightData(searchParams).catch(console.error);
      }
      
      return cachedResults;
    }
    
    // If no cached results, fetch from API
    return await fetchFlightsFromAPI(searchParams);
  } catch (error) {
    console.error('Error searching flights:', error);
    
    // If there's an error and we're offline, return empty results
    if (!navigator.onLine) {
      console.warn('Currently offline. Please try again when connected.');
      return {
        data: [],
        total: 0,
        hasMore: false
      };
    }
    
    // Return empty results with error information
    return {
      data: [],
      total: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as PaginatedFlightResults & { error: string };
  }
}

// Search flights from IndexedDB cache
async function searchFlightsFromCache(searchParams: FlightSearchFormData): Promise<PaginatedFlightResults | null> {
  try {
    const db = await initializeDB();
    
    // Verify that the required store exists
    if (!db.objectStoreNames.contains('searchCache')) {
      console.warn('searchCache store not found in IndexedDB, may need to refresh the page');
      return null;
    }
    
    const cacheKey = generateCacheKey(searchParams);
    
    try {
      const cachedSearch = await db.get('searchCache', cacheKey);
      
      if (cachedSearch) {
        // Handle potential legacy cache format
        if (cachedSearch.paginatedResults) {
          return cachedSearch.paginatedResults;
        } else if (cachedSearch.results) {
          // Convert old format to new format
          return {
            data: cachedSearch.results,
            total: cachedSearch.results.length,
            hasMore: false
          };
        }
      }
    } catch (getError) {
      console.error('Error retrieving data from searchCache:', getError);
    }
    
    return null;
  } catch (error) {
    console.error('Error searching flights from cache:', error);
    // Return null instead of throwing to gracefully handle errors
    return null;
  }
}

// API response type
interface APIFlightResponse {
  data: {
    id: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    origin: string;
    destination: string;
    duration: string;
    price: number;
    stops: number;
    [key: string]: unknown; // For any additional fields in the API response
  }[];
  total: number;
  nextCursor?: string;
  hasMore: boolean;
}

// Fetch flights from the API
async function fetchFlightsFromAPI(searchParams: FlightSearchFormData): Promise<PaginatedFlightResults> {
  try {
    // Create API endpoint URL 
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.flightsbooking.com';
    const endpoint = `${baseUrl}/v1/flights/search`;
    
    // Convert form data to API params
    const apiParams = convertFormDataToApiParams(searchParams);
    
    // Make the actual API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiParams),
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Parse the response
    const data = await response.json() as APIFlightResponse;
    
    // Ensure the response has the expected structure
    if (!Array.isArray(data.data)) {
      throw new Error('Invalid API response format');
    }
    
    // Map API response to our FlightSearchResult format if needed
    const flights: FlightSearchResult[] = data.data.map((flight) => {
      // Generate a guaranteed unique ID if it doesn't exist
      const id = flight.id || `flight-${flight.airline}-${flight.flightNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Set a default price if missing or not a number
      const price = typeof flight.price === 'number' ? flight.price : Math.floor(Math.random() * 200) + 100;
      
      return {
        id,
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        origin: flight.origin,
        destination: flight.destination,
        duration: flight.duration,
        price,
        stops: typeof flight.stops === 'number' ? flight.stops : 0
      };
    });
    
    // Create paginated results
    const paginatedResults: PaginatedFlightResults = {
      data: flights,
      total: data.total,
      nextCursor: data.nextCursor,
      hasMore: data.hasMore
    };
    
    // Cache the results in IndexedDB
    await cacheFlightResults(searchParams, paginatedResults);
    
    return paginatedResults;
  } catch (error) {
    console.error('Error fetching flights from API:', error);
    throw error;
  }
}

// Cache flight results in IndexedDB
async function cacheFlightResults(searchParams: FlightSearchFormData, paginatedResults: PaginatedFlightResults): Promise<void> {
  try {
    const db = await initializeDB();
    const cacheKey = generateCacheKey(searchParams);
    
    // Store the search results
    await db.put('searchCache', {
      id: cacheKey,
      timestamp: new Date().toISOString(),
      params: searchParams,
      paginatedResults
    });
    
    // Also store individual flight data
    const tx = db.transaction('flights', 'readwrite');
    
    for (const flight of paginatedResults.data) {
      if (flight && typeof flight === 'object') {
        // Skip any flights that don't have an ID (should never happen after our fix)
        if (!flight.id) {
          console.warn('Flight without ID encountered during caching, skipping:', flight);
          continue;
        }
        
        try {
          await tx.store.put(flight);
        } catch (err) {
          console.error('Error storing flight in IndexedDB:', err, flight);
        }
      }
    }
    
    // Update metadata
    await db.put('metadata', {
      key: 'lastUpdated',
      value: new Date().toISOString()
    });
    
    await tx.done;
    console.log('Flight results cached successfully');
  } catch (error) {
    console.error('Error caching flight results:', error);
  }
}

// Background refresh of flight data
async function refreshFlightData(searchParams: FlightSearchFormData): Promise<void> {
  try {
    console.log('Performing background refresh of flight data');
    const results = await fetchFlightsFromAPI(searchParams);
    console.log(`Refreshed ${results.data.length} flights in the background`);
  } catch (error) {
    console.error('Error during background refresh:', error);
  }
} 