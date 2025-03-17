"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/lib/store/useAuthStore";
import { Loader } from "lucide-react";

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const ADMIN_ROLES = ['admin', 'ADMIN', 'service_role'] as const;
type AdminRole = typeof ADMIN_ROLES[number];

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
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Refresh auth when the component mounts
  useEffect(() => {
    console.log("AdminProtectedRoute: Refreshing auth");
    
    let isMounted = true;
    setIsRefreshing(true);
    
    refreshAuth()
      .then(() => {
        if (isMounted) {
          console.log("AdminProtectedRoute: Auth refreshed successfully");
          setIsRefreshing(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("AdminProtectedRoute: Auth refresh failed", error);
          setIsRefreshing(false);
          setRefreshFailed(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshAuth]);

  // Check for admin status whenever the user changes
  useEffect(() => {
    if (!isLoading && user) {
      // Extract JWT token from localStorage
      const supabaseToken = localStorage.getItem('sb-qhuldkrjtcfqamzqjwgf-auth-token');
      let decodedToken = null;
      
      if (supabaseToken) {
        try {
          const { access_token } = JSON.parse(supabaseToken);
          // Get the payload part of the JWT (second part)
          const payload = access_token.split('.')[1];
          // Decode the base64 payload
          decodedToken = JSON.parse(atob(payload));
        } catch (error) {
          console.error("Failed to decode JWT token:", error);
        }
      }

      console.log("AdminProtectedRoute: Auth data", {
        userRole: user.role,
        decodedTokenRole: decodedToken?.role,
        appMetadata: user.app_metadata,
        userMetadata: user.user_metadata
      });

      // Check admin status from multiple sources
      const isUserAdmin = 
        // Check JWT token role
        (decodedToken?.role && ADMIN_ROLES.includes(decodedToken.role as AdminRole)) ||
        // Check user object role
        (user.role && ADMIN_ROLES.includes(user.role as AdminRole)) ||
        // Check app_metadata roles
        (Array.isArray(user.app_metadata?.roles) && 
          user.app_metadata.roles.some(role => ADMIN_ROLES.includes(role as AdminRole))) ||
        // Check user_metadata roles
        (Array.isArray(user.user_metadata?.roles) && 
          user.user_metadata.roles.some(role => ADMIN_ROLES.includes(role as AdminRole)));

      setIsAdmin(isUserAdmin);

      console.log("AdminProtectedRoute: Admin check result:", {
        isAdmin: isUserAdmin,
        tokenRole: decodedToken?.role,
        userRole: user.role,
        appMetadataRoles: user.app_metadata?.roles,
        userMetadataRoles: user.user_metadata?.roles
      });
    }
  }, [isLoading, user]);

  // Handle redirects based on auth state
  useEffect(() => {
    if (isRefreshing) {
      console.log("AdminProtectedRoute: Still refreshing auth, waiting...");
      return;
    }
    
    console.log("AdminProtectedRoute: Auth state", {
      isLoading,
      isRefreshing,
      isAuthenticated,
      refreshFailed,
      userExists: !!user,
      isAdmin,
      pathname,
    });

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("AdminProtectedRoute: Not authenticated, redirecting to login");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If authenticated but not admin, redirect to dashboard
    if (!isAdmin) {
      console.log("AdminProtectedRoute: Not admin, redirecting to dashboard");
      router.push("/");
      return;
    }

    console.log("AdminProtectedRoute: User is authorized to access admin dashboard");
  }, [isRefreshing, isAuthenticated, router, pathname, isAdmin, user, isLoading, refreshFailed]);

  // Show loading state while refreshing auth
  if (isRefreshing) {
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
  if (!isAuthenticated) {
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
  if (!isAdmin) {
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
          onClick={() => router.push("/")}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // If we get here, user is admin
  return <>{children}</>;
}
