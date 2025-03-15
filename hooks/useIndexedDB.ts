"use client"
import { useState, useEffect, useCallback } from 'react';
import { 
  saveFlightSearchResults, 
  getFlightSearchResults,
  saveMetadata,
  getMetadata
} from '@/lib/indexeddb/operations';
import { initSyncService, triggerSync } from '@/lib/indexeddb/sync';
import { FlightSearchResult, FlightSearchFormData } from '@/lib/services/flights/flightSearchService';

// Initialize sync service
if (typeof window !== 'undefined') {
  initSyncService();
}

export default function useIndexedDB() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we can access IndexedDB
        if ('indexedDB' in window) {
          setIsInitialized(true);
        } else {
          console.warn('IndexedDB is not supported in this browser');
        }
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };
    
    init();
  }, []);
  
  // Cache flight search results
  const cacheFlightResults = useCallback(async (
    searchParams: FlightSearchFormData,
    results: FlightSearchResult[]
  ): Promise<void> => {
    if (!isInitialized) return;
    
    try {
      const queryString = JSON.stringify(searchParams);
      await saveFlightSearchResults(queryString, results);
    } catch (error) {
      console.error('Error caching flight results:', error);
    }
  }, [isInitialized]);
  
  // Get cached flight search results
  const getCachedFlightResults = useCallback(async (
    searchParams: FlightSearchFormData
  ): Promise<FlightSearchResult[] | null> => {
    if (!isInitialized) return null;
    
    try {
      const queryString = JSON.stringify(searchParams);
      return await getFlightSearchResults(queryString);
    } catch (error) {
      console.error('Error getting cached flight results:', error);
      return null;
    }
  }, [isInitialized]);
  
  // Save metadata
  const cacheMetadata = useCallback(async <T>(
    key: string,
    data: T
  ): Promise<void> => {
    if (!isInitialized) return;
    
    try {
      await saveMetadata(key, data);
    } catch (error) {
      console.error('Error caching metadata:', error);
    }
  }, [isInitialized]);
  
  // Get metadata
  const getCachedMetadata = useCallback(async <T>(
    key: string
  ): Promise<T | null> => {
    if (!isInitialized) return null;
    
    try {
      return await getMetadata<T>(key);
    } catch (error) {
      console.error('Error getting cached metadata:', error);
      return null;
    }
  }, [isInitialized]);
  
  // Manually trigger a sync
  const syncData = useCallback(() => {
    if (!isInitialized) return;
    triggerSync();
  }, [isInitialized]);
  
  return {
    isSupported: isInitialized,
    cacheFlightResults,
    getCachedFlightResults,
    cacheMetadata,
    getCachedMetadata,
    syncData
  };
} 