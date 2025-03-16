"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/lib/store/useAuthStore';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnverified?: boolean;
}

/**
 * A component that protects routes requiring authentication.
 * Provides client-side protection in addition to middleware protection.
 */
export default function ProtectedRoute({ 
  children, 
  allowUnverified = false 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, user, refreshAuth } = useAuthStore();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Check auth status on mount
    console.log("ProtectedRoute: Refreshing auth");
    
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("ProtectedRoute: Auth refresh timed out");
        setHasTimedOut(true);
      }
    }, 5000); // 5-second timeout
    
    refreshAuth().then(() => {
      console.log("ProtectedRoute: Auth refreshed successfully");
      clearTimeout(timeoutId);
    }).catch(error => {
      console.error("ProtectedRoute: Auth refresh failed", error);
      clearTimeout(timeoutId);
      setHasTimedOut(true);
    });
    
    return () => clearTimeout(timeoutId);
  }, [refreshAuth, isLoading]);

  useEffect(() => {
    console.log("ProtectedRoute: Auth state changed", { isLoading, isAuthenticated, userExists: !!user });
    
    // If not loading and not authenticated, redirect to login
    if ((!isLoading || hasTimedOut) && !isAuthenticated) {
      console.log("ProtectedRoute: Redirecting to login");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    
    // If user is authenticated but email is not verified and verification is required
    if (!isLoading && isAuthenticated && !allowUnverified && user?.email_confirmed_at === null) {
      console.log("ProtectedRoute: Redirecting to verify email");
      router.push('/verify-email');
    }
  }, [isLoading, isAuthenticated, router, pathname, user, allowUnverified, hasTimedOut]);

  // Show loading state
  if (isLoading && !hasTimedOut) {
    return (
      <div data-testid="loading" className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // If authenticated (and verified if required), render children
  if (isAuthenticated && (allowUnverified || user?.email_confirmed_at !== null)) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
} 