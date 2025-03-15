"use client";

import { useEffect } from 'react';
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

  useEffect(() => {
    // Check auth status on mount
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    
    // If user is authenticated but email is not verified and verification is required
    if (!isLoading && isAuthenticated && !allowUnverified && user?.email_confirmed_at === null) {
      router.push('/verify-email');
    }
  }, [isLoading, isAuthenticated, router, pathname, user, allowUnverified]);

  // Show loading state
  if (isLoading) {
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