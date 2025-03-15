import { DBSchema } from 'idb';
import { FlightSearchResult } from '../services/flights/flightSearchService';

// Define the database schema
export interface FlightsDBSchema extends DBSchema {
  // Store for flight search results
  'flights': {
    key: string;
    value: {
      id: string;
      results: FlightSearchResult[];
      timestamp: number;
      query: string;
    };
    indexes: {
      'by-timestamp': number;
    };
  };
  
  // Store for search results cache
  'searchCache': {
    key: string;
    value: {
      id: string;
      timestamp: string;
      params: unknown;
      paginatedResults: unknown;
    };
  };
  
  // Store for frequently used data like airports, airlines, etc.
  'metadata': {
    key: string;
    value: {
      id: string;
      data: unknown;
      lastUpdated: number;
    };
  };
}

// Database configuration
export const DB_CONFIG = {
  name: 'flights-search-db',
  version: 2,
  stores: {
    flights: {
      keyPath: 'id',
      indexes: [
        { name: 'by-timestamp', keyPath: 'timestamp' }
      ]
    },
    searchCache: {
      keyPath: 'id'
    },
    metadata: {
      keyPath: 'id'
    }
  }
};

// Maximum number of cached search results to keep
export const MAX_CACHED_SEARCHES = 20;

// Maximum age of cached data in milliseconds (24 hours)
export const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; 