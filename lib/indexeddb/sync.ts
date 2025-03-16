import { getFlightSearchResults, saveFlightSearchResults, getMetadata, saveMetadata } from './operations';
import { MAX_CACHE_AGE } from './schema';
import { searchFlights } from '../services/flights/flightSearchService';

// Last sync timestamp
let lastSyncTimestamp = 0;

// Minimum time between syncs (5 minutes)
const MIN_SYNC_INTERVAL = 5 * 60 * 1000;

// Track online status
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

// Initialize the sync service
export const initSyncService = (): void => {
  if (typeof window === 'undefined') return;
  
  // Set up online/offline event listeners
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
  
  // Initial sync if online
  if (isOnline) {
    syncCachedData();
  }
};

// Handle network status changes
const handleNetworkChange = (): void => {
  const wasOffline = !isOnline;
  isOnline = navigator.onLine;
  
  // If we're coming back online, sync data
  if (wasOffline && isOnline) {
    console.log('Network connection restored. Syncing data...');
    syncCachedData();
  }
};

// Sync cached data with the server
export const syncCachedData = async (): Promise<void> => {
  if (!isOnline) return;
  
  // Prevent too frequent syncs
  const now = Date.now();
  if (now - lastSyncTimestamp < MIN_SYNC_INTERVAL) {
    return;
  }
  
  lastSyncTimestamp = now;
  
  try {
    // Get the last sync metadata
    const lastSync = await getMetadata<{ timestamp: number; queries: string[] }>('last-sync');
    
    // If we have previous sync data and it's recent enough, use it
    if (lastSync && now - lastSync.timestamp < MAX_CACHE_AGE) {
      // Refresh each cached search query
      for (const query of lastSync.queries) {
        refreshCachedSearch(query);
      }
    } else {
      // Otherwise, do a full sync
      await fullSync();
    }
    
    console.log('Data sync completed successfully');
  } catch (error) {
    console.error('Error syncing data:', error);
  }
};

// Refresh a single cached search
const refreshCachedSearch = async (query: string): Promise<void> => {
  try {
    // Check if we have this search in cache
    const cachedResults = await getFlightSearchResults(query);
    
    if (cachedResults) {
      // If we have cached results, refresh them
      const freshResults = await searchFlights(JSON.parse(query));
      await saveFlightSearchResults(query, freshResults.data);
    }
  } catch (error) {
    console.error(`Error refreshing cached search for query ${query}:`, error);
  }
};

// Perform a full sync of all cached data
const fullSync = async (): Promise<void> => {
  try {
    // Get all cached queries (this would need to be implemented)
    // For now, we'll just save the sync timestamp
    await saveMetadata('last-sync', {
      timestamp: Date.now(),
      queries: [] // In a real app, this would be populated with actual queries
    });
  } catch (error) {
    console.error('Error performing full sync:', error);
  }
};

// Export a function to manually trigger a sync
export const triggerSync = (): void => {
  if (isOnline) {
    syncCachedData();
  }
}; 