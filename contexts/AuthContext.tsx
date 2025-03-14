"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser, getCurrentSession, signOut } from '@/lib/supabase/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for user and session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Fetch fresh data from Supabase
        const [currentUser, currentSession] = await Promise.all([
          getCurrentUser(),
          getCurrentSession()
        ]);
        
        setUser(currentUser);
        setSession(currentSession);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        
        // Update user info when auth state changes
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    try {
      const [currentUser, currentSession] = await Promise.all([
        getCurrentUser(),
        getCurrentSession()
      ]);
      
      setUser(currentUser);
      setSession(currentSession);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut: handleSignOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 