import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to readable format (e.g., "Sep 12, 2023")
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "MMM d, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

/**
 * Format a date string to a longer format (e.g., "September 12, 2023")
 */
export function formatDateLong(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "MMMM d, yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

/**
 * Format a time string to readable format (e.g., "14:30")
 */
export function formatTime(timeString: string): string {
  try {
    const date = parseISO(timeString)
    return format(date, "HH:mm")
  } catch (error) {
    console.error("Error formatting time:", error)
    return timeString
  }
}

/**
 * Format a number as currency (e.g., "$123.45")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
