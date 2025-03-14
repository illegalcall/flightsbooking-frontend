/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

import { StoreApi } from 'zustand';
import { AuthState } from '../../lib/store/useAuthStore';

declare global {
  interface Window {
    __authStore?: StoreApi<AuthState>;
  }
}

// Extend the Cypress namespace to include Testing Library commands
declare namespace Cypress {
  interface Chainable {
    // Add Testing Library commands
    findByText(text: string | RegExp): Chainable<JQuery<HTMLElement>>;
    findByLabelText(text: string | RegExp): Chainable<JQuery<HTMLElement>>;
    findByRole(role: string, options?: { name?: string | RegExp }): Chainable<JQuery<HTMLElement>>;
    
    // Add our custom commands
    login(email: string, password: string): Chainable<void>;
    logout(): Chainable<void>;
  }
} 