flight-booking-system/
├── .github/                         # GitHub workflows and templates
│   ├── workflows/                   # CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md     # PR template with checklist
├── .husky/                          # Git hooks for pre-commit checks
├── .cursorrules                     # Pre-commit check configurations
├── public/                          # Static assets
│   ├── fonts/                       # Custom fonts
│   ├── images/                      # Static images
│   └── favicon.ico                  # Site favicon
├── app/                             # Next.js App Router pages
│   ├── (auth)/                      # Authentication routes
│   │   ├── login/                   # Login page
│   │   ├── register/                # Registration page
│   │   └── reset-password/          # Password reset
│   ├── (dashboard)/                 # Protected routes
│   │   ├── profile/                 # User profile management
│   │   ├── bookings/                # My bookings page
│   │   │   └── [id]/                # Individual booking details
│   │   └── layout.tsx               # Dashboard layout with protection
│   ├── (public)/                    # Public routes
│   │   ├── search/                  # Flight search page
│   │   └── booking/                 # Booking flow
│   │       ├── [id]/                # Specific booking process
│   │       └── confirmation/        # Booking confirmation
│   ├── admin/                       # Admin dashboard
│   │   ├── users/                   # User management
│   │   ├── flights/                 # Flight management
│   │   ├── bookings/                # Booking management
│   │   └── analytics/               # Analytics dashboard
│   ├── api/                         # API routes
│   │   ├── auth/                    # Auth-related endpoints
│   │   ├── flights/                 # Flight-related endpoints
│   │   ├── bookings/                # Booking-related endpoints
│   │   ├── admin/                   # Admin-only endpoints
│   │   └── sse/                     # Server-sent events endpoints
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Homepage
├── components/                      # Reusable UI components
│   ├── ui/                          # Shadcn UI components
│   ├── auth/                        # Auth-related components
│   ├── flight/                      # Flight-related components
│   │   ├── FlightSearchForm.tsx     # Search form component
│   │   ├── FlightCard.tsx           # Flight results card
│   │   └── SeatMap.tsx              # Seat selection component
│   ├── booking/                     # Booking-related components
│   │   ├── BookingWizard.tsx        # Multi-step booking process
│   │   ├── PriceBreakdown.tsx       # Price breakdown component
│   │   └── SeatLock.tsx             # Seat lock timer component
│   ├── profile/                     # Profile-related components
│   ├── admin/                       # Admin dashboard components
│   └── common/                      # Shared components
│       ├── Layout.tsx               # Layout wrapper
│       ├── Navbar.tsx               # Navigation bar
│       ├── Footer.tsx               # Footer component
│       └── NotificationCenter.tsx   # Real-time notifications
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Authentication hook
│   ├── useFlightSearch.ts           # Flight search hook
│   ├── useSSE.ts                    # Server-sent events hook
│   └── useIndexedDB.ts              # IndexedDB interactions
├── lib/                             # Utility libraries and services
│   ├── supabase/                    # Supabase client setup
│   │   ├── client.ts                # Client initialization
│   │   ├── auth.ts                  # Auth utilities
│   │   ├── database.ts              # Database operations
│   │   └── storage.ts               # Storage operations
│   ├── stripe/                      # Stripe integration
│   ├── indexeddb/                   # IndexedDB utilities
│   │   ├── schema.ts                # Database schema
│   │   ├── operations.ts            # CRUD operations
│   │   └── sync.ts                  # Background sync service
│   ├── workers/                     # Web Worker implementations
│   │   ├── flight-search.worker.ts  # Flight search worker
│   │   └── worker-registry.ts       # Worker registration
│   ├── sse/                         # SSE client implementation
│   ├── utils/                       # General utility functions
│   └── validators/                  # Form validation schemas
├── store/                           # State management
│   ├── auth.ts                      # Auth state
│   ├── booking.ts                   # Booking state
│   ├── flights.ts                   # Flight search state
│   └── notifications.ts             # Notification state
├── types/                           # TypeScript type definitions
│   ├── auth.types.ts                # Auth-related types
│   ├── flight.types.ts              # Flight-related types
│   ├── booking.types.ts             # Booking-related types
│   └── supabase.types.ts            # Supabase database types
├── styles/                          # Global styles
│   └── globals.css                  # Global CSS (includes Tailwind)
├── middleware.ts                    # Next.js middleware (for auth protection)
├── workers/                         # Web Worker source files
│   └── flight-search.worker.ts      # Flight search worker logic
├── tests/                           # Test files
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   └── e2e/                         # End-to-end tests
├── docs/                            # Documentation
│   ├── api/                         # API documentation
│   │   └── swagger.yaml             # Swagger specification
│   ├── components/                  # Component documentation
│   └── deployment/                  # Deployment documentation
├── scripts/                         # Build and utility scripts
│   ├── seed-data.js                 # Database seeding script
│   └── generate-types.js            # Type generation from Supabase
├── .env.example                     # Example environment variables
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── jest.config.js                   # Jest configuration
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── README.md                        # Project documentation
```

# FlightsBooking Frontend

This is the frontend application for the FlightsBooking platform, built with Next.js, Supabase, and Tailwind CSS.

## Authentication System

The application uses Supabase for authentication with the following features:

- Email and password authentication
- Protected routes
- Auth state management with React Context
- Route redirection based on authentication status

### Auth Components

- **AuthContext**: Provides authentication state and methods throughout the application
- **ProtectedRoute**: HOC that redirects unauthenticated users to the login page
- **AuthRedirect**: HOC that redirects authenticated users away from auth pages

## Route Protection

Routes are protected using the following structure:

1. Public routes: Accessible to all users
2. Auth routes: Only accessible to unauthenticated users (login, register)
3. Protected routes: Only accessible to authenticated users (dashboard, profile)

### Implementation

- **`app/(dashboard)/layout.tsx`**: Uses the `ProtectedRoute` component to protect all dashboard routes
- **`app/(auth)/layout.tsx`**: Uses the `AuthRedirect` component to redirect authenticated users away from auth pages
- **`middleware.ts`**: Server-side protection using Next.js middleware for additional security

## Supabase Auth Functions

The following auth functions are available:

- `signUp(email, password)`: Register a new user
- `signIn(email, password)`: Sign in an existing user
- `signOut()`: Sign out the current user
- `resetPassword(email)`: Send a password reset email
- `updatePassword(newPassword)`: Update the user's password
- `getCurrentUser()`: Get the current user
- `getCurrentSession()`: Get the current session

### Handling Logout

The application implements a robust logout mechanism that ensures:

1. The Supabase token is completely removed from localStorage
2. The AuthContext state is immediately updated
3. All auth-related data is properly cleared
4. The UI is instantly updated to reflect the logged-out state

## Usage

To use authentication in your components:

```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isLoading, signOut } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```