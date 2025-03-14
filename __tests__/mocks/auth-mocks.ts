import type { User, Session } from '@supabase/supabase-js';

// Mock simple representations of complex types
export const createMockUser = (overrides = {}): User => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
} as User);

export const createMockSession = (overrides = {}): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides
} as Session);

// For testing email verification
export const createUnverifiedUser = (): User => 
  createMockUser({ email_confirmed_at: null });

export const createVerifiedUser = (): User => 
  createMockUser({ email_confirmed_at: new Date().toISOString() });

// Add a simple test to satisfy Jest
describe('Auth mocks', () => {
  test('createMockUser should generate a valid user object', () => {
    const mockUser = createMockUser();
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('app_metadata');
  });
}); 