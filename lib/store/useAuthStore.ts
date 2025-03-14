import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  updatePassword, 
  getCurrentUser, 
  getCurrentSession,
  AuthError
} from '@/lib/supabase/auth';
import { StoreApi, UseBoundStore } from 'zustand';

// Extend window interface for Cypress testing
declare global {
  interface Window {
    __authStore?: UseBoundStore<StoreApi<AuthState>>;
  }
}

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastError: AuthError | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<boolean>;
  updateUserPassword: (newPassword: string) => Promise<boolean>;
  clearError: () => void;
};

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  lastError: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, lastError: null });
      const { user, session } = await signIn(email, password);
      set({ 
        user, 
        session, 
        isAuthenticated: !!user, 
        isLoading: false
      });
      return true;
    } catch (error) {
      set({ 
        lastError: error as AuthError, 
        isAuthenticated: false, 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (email: string, password: string) => {
    try {
      set({ isLoading: true, lastError: null });
      const { user, session } = await signUp(email, password);
      set({ 
        user, 
        session, 
        isAuthenticated: !!user, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ 
        lastError: error as AuthError, 
        isAuthenticated: false, 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, lastError: null });
      await signOut();
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      set({ 
        lastError: error as AuthError, 
        isLoading: false 
      });
      return false;
    }
  },

  refreshAuth: async () => {
    try {
      set({ isLoading: true });
      const [currentUser, currentSession] = await Promise.all([
        getCurrentUser(),
        getCurrentSession()
      ]);
      
      set({ 
        user: currentUser, 
        session: currentSession, 
        isAuthenticated: !!currentUser, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false, 
        isLoading: false,
        lastError: error as AuthError
      });
    }
  },

  resetUserPassword: async (email: string) => {
    try {
      set({ isLoading: true, lastError: null });
      await resetPassword(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        lastError: error as AuthError, 
        isLoading: false 
      });
      return false;
    }
  },

  updateUserPassword: async (newPassword: string) => {
    try {
      set({ isLoading: true, lastError: null });
      await updatePassword(newPassword);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        lastError: error as AuthError, 
        isLoading: false 
      });
      return false;
    }
  },

  clearError: () => {
    set({ lastError: null });
  }
}));

// Function to expose store for testing
// This attaches the store directly to window
if (typeof window !== 'undefined') {
  window.__authStore = useAuthStore;
  
  // For debugging
  console.log('Auth store attached to window.__authStore');
}

export default useAuthStore; 