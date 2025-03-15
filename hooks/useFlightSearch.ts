"use client"
import { useState, useCallback, useEffect } from 'react';
import { 
  FlightSearchFormData, 
  FlightSearchResult, 
  searchFlights 
} from '@/lib/services/flights/flightSearchService';
import { 
  FilterOptions, 
  SortOption,
  flightSearchWorkerService
} from '@/lib/services/flights/flightSearchWorkerService';

export default function useFlightSearch() {
  const [results, setResults] = useState<FlightSearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<FlightSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOption>('price');

  // Search for flights
  const search = useCallback(async (searchParams: FlightSearchFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchFlights(searchParams);
      
      // Ensure we have an array of results
      if (searchResults && searchResults.data && Array.isArray(searchResults.data)) {
        setResults(searchResults.data);
        setFilteredResults(searchResults.data);
      } else {
        // Handle empty or invalid results
        setResults([]);
        setFilteredResults([]);
        if (searchResults.error) {
          setError(searchResults.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for flights');
      console.error('Flight search error:', err);
      // Set empty arrays to prevent errors
      setResults([]);
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(async () => {
    if (results.length === 0) return;
    
    try {
      const processed = await flightSearchWorkerService.processFlights(
        results,
        filters,
        sortOption
      );
      setFilteredResults(processed);
    } catch (err) {
      console.error('Error processing flights:', err);
      // Fallback to showing all results
      setFilteredResults(results);
    }
  }, [results, filters, sortOption]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  // Update sort option
  const updateSortOption = useCallback((option: SortOption) => {
    setSortOption(option);
  }, []);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      flightSearchWorkerService.terminate();
    };
  }, []);

  // Apply filters and sorting when they change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  return {
    search,
    results: filteredResults,
    isLoading,
    error,
    filters,
    updateFilters,
    sortOption,
    updateSortOption
  };
} 