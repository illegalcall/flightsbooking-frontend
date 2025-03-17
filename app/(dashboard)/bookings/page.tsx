"use client";

import { useEffect, useState } from "react";
import BookingsList from "@/components/booking/BookingsList";
import { useBookingStore } from "@/lib/store/useBookingStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FilterIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRange } from "react-day-picker";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { 
    isLoading, 
    filters, 
    updateFilters, 
    getFilteredBookings, 
    fetchBookings,
  } = useBookingStore();

  useEffect(() => {
    // Fetch bookings from API when component mounts
    fetchBookings().catch(() => {
      // Error handling done within the store
    });
  }, [fetchBookings]);

  // Handle tab change - update filters
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateFilters({ status: value === 'all' ? 'all' : value as "confirmed" | "pending" | "cancelled" | "completed" | "all" });
  };

  // Handle date range change with type safety
  const handleDateRangeChange = (range: DateRange | undefined) => {
    updateFilters({ 
      dateRange: range ? {
        from: range.from || null,
        to: range.to || null
      } : { from: null, to: null }
    });
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">Manage and track all your flight bookings</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-[260px]">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8 w-full"
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            />
          </div>
          
          <Button variant="outline" size="icon" className="shrink-0" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
            <FilterIcon className="h-4 w-4" />
          </Button>
          
          {isFiltersOpen && (
            <div className="absolute right-0 top-16 w-80 p-4 bg-white border rounded-md shadow-md z-10">
              <div className="pb-4">
                <h3 className="font-semibold">Filter Bookings</h3>
                <p className="text-sm text-muted-foreground">
                  Refine your booking list using the filters below
                </p>
              </div>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Booking Date Range</Label>
                  <DateRangePicker
                    value={filters.dateRange}
                    onChange={handleDateRangeChange}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select 
                    defaultValue={filters.sortBy || 'date'} 
                    onValueChange={(value) => updateFilters({ sortBy: value as "date" | "price" | "status" })}
                  >
                    <SelectTrigger id="sortBy">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Booking Date</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortDirection">Sort Direction</Label>
                  <Select 
                    defaultValue={filters.sortDirection || 'desc'} 
                    onValueChange={(value) => updateFilters({ sortDirection: value as "asc" | "desc" })}
                  >
                    <SelectTrigger id="sortDirection">
                      <SelectValue placeholder="Sort direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => {
                  updateFilters({
                    dateRange: { from: null, to: null },
                    searchTerm: '',
                    sortBy: 'date',
                    sortDirection: 'desc',
                    status: 'all'
                  });
                  setActiveTab('all');
                }}>
                  Reset Filters
                </Button>
                <Button onClick={() => setIsFiltersOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card className={cn(
            "border-0 shadow-none",
            activeTab !== 'all' && "animate-in fade-in-50"
          )}>
            <CardHeader className="px-0 pt-0 pb-4">
              <CardDescription>
                Showing {getFilteredBookings().length} {activeTab === 'all' ? 'total' : activeTab} bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <BookingsList bookings={getFilteredBookings()} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 