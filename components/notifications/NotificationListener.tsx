"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function NotificationListener() {
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      // Get auth token from localStorage
      const authData = localStorage.getItem("sb-auth-token");
      if (!authData) return;

      try {
        const { access_token } = JSON.parse(authData);
        if (!access_token) return;

        // Close existing connection if any
        if (eventSource) {
          eventSource.close();
        }

        // Create SSE connection with token in URL as EventSource doesn't support custom headers
        // Important: In a production app, we would use a more secure approach like cookies
        eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/notifications/events?token=${encodeURIComponent(access_token)}`,
          {
            withCredentials: true,
          }
        );

        // Handle incoming events
        eventSource.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);

            let title = "Notification";
            let description = notification.message;

            // Customize notification based on type
            switch (notification.type) {
              case "status_change":
                title = "Booking Status Updated";
                description = `Booking #${notification.bookingReference}: ${notification.message}`;
                break;
              case "flight_update":
                title = "Flight Update";
                description = `Flight update for booking #${notification.bookingReference}: ${notification.message}`;
                break;
              case "payment_update":
                title = "Payment Update";
                description = `Payment update for booking #${notification.bookingReference}: ${notification.message}`;
                break;
            }

            // Show toast notification
            toast({
              title,
              description,
              duration: 5000,
            });

            // Reset retry count on successful message
            if (retryCount > 0) {
              setRetryCount(0);
            }
          } catch (error) {
            console.error("Error parsing SSE event:", error);
          }
        };

        // Handle connection opened
        eventSource.onopen = () => {
          console.log("SSE connection established");
          // Reset retry count on successful connection
          if (retryCount > 0) {
            setRetryCount(0);
          }
        };

        // Handle connection errors
        eventSource.onerror = (error) => {
          console.error("SSE connection error:", error);
          eventSource?.close();

          // Try to reconnect if within retry limit
          if (retryCount < MAX_RETRIES) {
            const nextRetryCount = retryCount + 1;
            setRetryCount(nextRetryCount);
            console.log(
              `Attempting to reconnect (${nextRetryCount}/${MAX_RETRIES}) in ${RETRY_DELAY}ms`
            );

            retryTimeout = setTimeout(() => {
              connectSSE();
            }, RETRY_DELAY);
          } else {
            console.error(`Maximum retry attempts (${MAX_RETRIES}) reached`);
          }
        };
      } catch (error) {
        console.error("Error setting up SSE connection:", error);
      }
    };

    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [toast, retryCount]);

  return null;
}
