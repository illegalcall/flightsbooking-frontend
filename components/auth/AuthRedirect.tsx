"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirect({ children, redirectTo = '/' }: AuthRedirectProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if authentication is still loading
    if (!isLoading) {
      // If user is already authenticated, redirect to the specified path
      if (user) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, router, redirectTo]);

  // While checking authentication, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not loading and user does not exist, render the children
  return !user ? <>{children}</> : null;
} 