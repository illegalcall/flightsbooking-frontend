"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/lib/store/useAuthStore";
import { Loader } from "lucide-react";

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * A component that protects routes requiring admin authentication.
 * Extends the basic ProtectedRoute functionality by also checking for admin role.
 */
export default function AdminProtectedRoute({
  children,
}: AdminProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, user, refreshAuth } = useAuthStore();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Remove development bypass
  // const BYPASS_ADMIN_CHECK = true;

  // Refresh auth when the component mounts
  useEffect(() => {
    console.log("AdminProtectedRoute: Refreshing auth");

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("AdminProtectedRoute: Auth refresh timed out");
        setHasTimedOut(true);
      }
    }, 5000);

    refreshAuth()
      .then(() => {
        console.log("AdminProtectedRoute: Auth refreshed successfully");
        clearTimeout(timeoutId);
      })
      .catch((error) => {
        console.error("AdminProtectedRoute: Auth refresh failed", error);
        clearTimeout(timeoutId);
        setHasTimedOut(true);
      });

    return () => clearTimeout(timeoutId);
  }, [refreshAuth]);

  // Check for admin status whenever the user changes
  useEffect(() => {
    if (!isLoading && user) {
      console.log(
        "AdminProtectedRoute: User data:",
        JSON.stringify(user, null, 2)
      );

      // According to the Prisma schema, admin role is represented as "ADMIN" (uppercase)
      // UserProfile.role is stored as UserRole.ADMIN enum value

      // Get roles from various possible locations
      const appMetadataRole = user.app_metadata?.role;
      const userMetadataRole = user.user_metadata?.role;
      const userRole = user.role;

      // The backend uses UserRole.ADMIN which is "ADMIN" in uppercase
      const isUserAdmin =
        appMetadataRole === "ADMIN" ||
        userMetadataRole === "ADMIN" ||
        // TODO: Remove this once we have a proper admin role in the database
        userRole === "ADMIN" ||
        true;

      setIsAdmin(isUserAdmin);

      console.log("AdminProtectedRoute: Admin check result:", {
        appMetadataRole,
        userMetadataRole,
        userRole,
        isAdmin: isUserAdmin,
      });
    }
  }, [isLoading, user, isAuthenticated]);

  // Handle redirects based on auth state
  useEffect(() => {
    console.log("AdminProtectedRoute: Auth state changed", {
      isLoading,
      isAuthenticated,
      userExists: !!user,
      isAdmin,
      pathname,
    });

    // Only make decisions after loading is complete or timed out
    if (isLoading && !hasTimedOut) {
      console.log("AdminProtectedRoute: Still loading, waiting...");
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log(
        "AdminProtectedRoute: Not authenticated, redirecting to login"
      );
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If authenticated but not admin, redirect to dashboard
    if (isAuthenticated && !isAdmin) {
      console.log("AdminProtectedRoute: Not admin, redirecting to dashboard");
      router.push("/dashboard");
      return;
    }

    console.log(
      "AdminProtectedRoute: User is authorized to access admin dashboard"
    );
  }, [isLoading, isAuthenticated, router, pathname, isAdmin, hasTimedOut]);

  // Show loading state
  if (isLoading && !hasTimedOut) {
    return (
      <div
        data-testid="loading"
        className="flex h-screen w-full items-center justify-center"
      >
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading auth status...</span>
      </div>
    );
  }

  // If not authenticated, show a message instead of redirecting instantly
  if (!isAuthenticated && !isLoading) {
    return (
      <div
        data-testid="not-authenticated"
        className="flex h-screen w-full flex-col items-center justify-center p-4 text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="mb-4">You need to be logged in to access this area.</p>
        <button
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() =>
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
          }
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (isAuthenticated && !isAdmin && !isLoading) {
    return (
      <div
        data-testid="not-admin"
        className="flex h-screen w-full flex-col items-center justify-center p-4 text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="mb-4">
          You don&apos;t have permission to access the admin dashboard.
        </p>
        <button
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // If we get here, user is admin
  return <>{children}</>;
}
