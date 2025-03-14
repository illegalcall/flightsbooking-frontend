// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/mock-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Silence console errors during tests (optional)
global.console.error = jest.fn();
global.console.warn = jest.fn(); 