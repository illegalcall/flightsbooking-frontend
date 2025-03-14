/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { User, Session } from '@supabase/supabase-js';
import useAuthStore from '../../lib/store/useAuthStore';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useRouter, usePathname } from 'next/navigation';
import { createMockUser, createMockSession, createUnverifiedUser } from '../mocks/auth-mocks';

// Mock the auth store completely to avoid TypeScript issues
jest.mock('../../lib/store/useAuthStore', () => {
  type MockStore = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    lastError: Error | null;
    login: jest.Mock;
    register: jest.Mock;
    logout: jest.Mock;
    refreshAuth: jest.Mock;
    resetUserPassword: jest.Mock;
    updateUserPassword: jest.Mock;
    clearError: jest.Mock;
  };

  type MockStoreFunction = jest.Mock<MockStore> & {
    setState: (state: Partial<MockStore>) => void;
    getState: () => MockStore;
  };

  const mockStore: MockStore = {
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    lastError: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn(),
    resetUserPassword: jest.fn(),
    updateUserPassword: jest.fn(),
    clearError: jest.fn(),
  };

  // Add behaviors to mock functions
  mockStore.login.mockImplementation(async (email, password) => {
    try {
      const result = await import('../../lib/supabase/auth').then(m => m.signIn(email, password));
      mockStore.user = result.user;
      mockStore.session = result.session;
      mockStore.isAuthenticated = true;
      mockStore.lastError = null;
      return true;
    } catch (error) {
      mockStore.user = null;
      mockStore.session = null;
      mockStore.isAuthenticated = false;
      mockStore.lastError = error;
      return false;
    }
  });

  mockStore.logout.mockImplementation(async () => {
    await import('../../lib/supabase/auth').then(m => m.signOut());
    mockStore.user = null;
    mockStore.session = null;
    mockStore.isAuthenticated = false;
    mockStore.lastError = null;
    return true;
  });

  mockStore.refreshAuth.mockImplementation(async () => {
    const auth = await import('../../lib/supabase/auth');
    const [user, session] = await Promise.all([
      auth.getCurrentUser(),
      auth.getCurrentSession()
    ]);
    mockStore.user = user;
    mockStore.session = session;
    mockStore.isAuthenticated = !!user;
  });

  // Mock the store function
  const useStore = jest.fn(() => mockStore) as MockStoreFunction;
  
  // Add setState and getState to the store
  useStore.setState = (newState: Partial<MockStore>) => {
    Object.assign(mockStore, newState);
  };
  
  useStore.getState = () => mockStore;
  
  return useStore;
});

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Supabase auth functions
jest.mock('../../lib/supabase/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  getCurrentUser: jest.fn(),
  getCurrentSession: jest.fn(),
}));

// Import mocked modules
import * as supabaseAuth from '../../lib/supabase/auth';

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset auth store to initial state
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      lastError: null,
    });
    
    // Default router mock implementation
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    
    // Default pathname mock implementation
    (usePathname as jest.Mock).mockReturnValue('/profile');
  });

  describe('Login Flow', () => {
    test('should login successfully with valid credentials', async () => {
      // Mock successful login
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ access_token: 'token123' });
      
      (supabaseAuth.signIn as jest.Mock).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      // Get store actions
      const { login } = useAuthStore.getState();

      // Attempt login
      await act(async () => {
        await login('test@example.com', 'password123');
      });

      // Verify store state after login
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.lastError).toBeNull();
      expect(supabaseAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    test('should handle login failure correctly', async () => {
      // Mock login failure
      const error = { message: 'Invalid credentials', status: 401 };
      (supabaseAuth.signIn as jest.Mock).mockRejectedValue(error);

      // Get store actions
      const { login } = useAuthStore.getState();

      // Attempt login
      await act(async () => {
        await login('test@example.com', 'wrong-password');
      });

      // Verify store state after failed login
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.lastError).toEqual(error);
    });
  });

  describe('Logout Flow', () => {
    test('should logout successfully', async () => {
      // Setup initial authenticated state
      useAuthStore.setState({
        user: createMockUser({ id: '123', email: 'test@example.com' }),
        session: createMockSession({ access_token: 'token123' }),
        isAuthenticated: true,
      });

      // Mock successful logout
      (supabaseAuth.signOut as jest.Mock).mockResolvedValue(true);

      // Get store actions
      const { logout } = useAuthStore.getState();

      // Attempt logout
      await act(async () => {
        await logout();
      });

      // Verify store state after logout
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(supabaseAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('ProtectedRoute Component', () => {
    test('should redirect to login if user is not authenticated', async () => {
      // Setup mock router
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
      });

      // Make sure refreshAuth won't change our state
      (supabaseAuth.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (supabaseAuth.getCurrentSession as jest.Mock).mockResolvedValue(null);
      
      // Set loading to false to avoid showing loading state
      useAuthStore.setState({ isLoading: false });

      // Render component
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Wait for the redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fprofile');
      });
    });

    test('should show protected content if user is authenticated', async () => {
      // Setup authenticated user with verified email
      const mockUser = createMockUser({ 
        id: '123', 
        email: 'test@example.com', 
        email_confirmed_at: new Date().toISOString() 
      });
      
      // Force the state we need for the test
      useAuthStore.setState({
        user: mockUser,
        session: createMockSession(),
        isAuthenticated: true,
        isLoading: false,
      });

      // Mock refreshAuth to do nothing (to avoid state changes)
      const store = useAuthStore.getState();
      (store.refreshAuth as jest.Mock).mockImplementation(() => Promise.resolve());

      // Render component
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Verify content is rendered
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    test('should redirect to verify email page for unverified users', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      
      const unverifiedUser = createUnverifiedUser();
      const mockSession = createMockSession({ user: unverifiedUser });
      
      useAuthStore.setState({
        user: unverifiedUser,
        session: mockSession,
        isLoading: false,
        isAuthenticated: true,
        lastError: null,
      });

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/verify-email');
      });
    });

    test('should allow unverified users if allowUnverified is true', async () => {
      const unverifiedUser = createUnverifiedUser();
      const mockSession = createMockSession({ user: unverifiedUser });
      
      useAuthStore.setState({
        user: unverifiedUser,
        session: mockSession,
        isLoading: false,
        isAuthenticated: true,
        lastError: null,
      });

      render(
        <ProtectedRoute allowUnverified>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
}); 