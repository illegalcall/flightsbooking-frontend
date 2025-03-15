import { openDB, IDBPDatabase } from 'idb';
import { FlightSearchResult } from '../services/flights/flightSearchService';
import { FlightsDBSchema, DB_CONFIG, MAX_CACHED_SEARCHES, MAX_CACHE_AGE } from './schema';

// Database instance
let dbPromise: Promise<IDBPDatabase<FlightsDBSchema>> | null = null;

// Initialize the database
export const initDB = async (): Promise<IDBPDatabase<FlightsDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<FlightsDBSchema>(DB_CONFIG.name, DB_CONFIG.version, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading ${DB_CONFIG.name} from version ${oldVersion} to ${newVersion}`);
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('flights')) {
          console.log('Creating flights store');
          const flightsStore = db.createObjectStore('flights', { keyPath: 'id' });
          flightsStore.createIndex('by-timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('searchCache')) {
          console.log('Creating searchCache store');
          db.createObjectStore('searchCache', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          console.log('Creating metadata store');
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
      },
    });
  }
  
  return dbPromise;
};

// Generate a unique ID for a search query
const generateSearchId = (query: string): string => {
  return `search-${btoa(query).replace(/[+/=]/g, '')}`;
};

// Save flight search results to IndexedDB
export const saveFlightSearchResults = async (
  query: string,
  results: FlightSearchResult[]
): Promise<void> => {
  try {
    const db = await initDB();
    const id = generateSearchId(query);
    const timestamp = Date.now();
    
    await db.put('flights', {
      id,
      results,
      timestamp,
      query
    });
    
    // Clean up old entries if we have too many
    await cleanupOldSearches();
  } catch (error) {
    console.error('Error saving flight search results to IndexedDB:', error);
  }
};

// Get flight search results from IndexedDB
export const getFlightSearchResults = async (
  query: string
): Promise<FlightSearchResult[] | null> => {
  try {
    const db = await initDB();
    const id = generateSearchId(query);
    const entry = await db.get('flights', id);
    
    if (!entry) return null;
    
    // Check if the cache is still valid
    if (Date.now() - entry.timestamp > MAX_CACHE_AGE) {
      // Cache is too old, delete it and return null
      await db.delete('flights', id);
      return null;
    }
    
    return entry.results;
  } catch (error) {
    console.error('Error getting flight search results from IndexedDB:', error);
    return null;
  }
};

// Clean up old searches to prevent the database from growing too large
export const cleanupOldSearches = async (): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction('flights', 'readwrite');
    const store = tx.objectStore('flights');
    const index = store.index('by-timestamp');
    
    // Get all entries sorted by timestamp
    const entries = await index.getAll();
    
    // If we have more than the maximum allowed, delete the oldest ones
    if (entries.length > MAX_CACHED_SEARCHES) {
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      // Delete the oldest entries
      const entriesToDelete = entries.slice(0, entries.length - MAX_CACHED_SEARCHES);
      
      for (const entry of entriesToDelete) {
        await store.delete(entry.id);
      }
    }
    
    await tx.done;
  } catch (error) {
    console.error('Error cleaning up old searches:', error);
  }
};

// Save metadata to IndexedDB
export const saveMetadata = async (
  id: string,
  data: unknown
): Promise<void> => {
  try {
    const db = await initDB();
    await db.put('metadata', {
      id,
      data,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error saving metadata to IndexedDB:', error);
  }
};

// Get metadata from IndexedDB
export const getMetadata = async <T>(
  id: string
): Promise<T | null> => {
  try {
    const db = await initDB();
    const entry = await db.get('metadata', id);
    
    if (!entry) return null;
    
    return entry.data as T;
  } catch (error) {
    console.error('Error getting metadata from IndexedDB:', error);
    return null;
  }
}; 