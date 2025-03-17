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

A modern, feature-rich flight booking platform built with Next.js, React, and TypeScript, offering a seamless experience for travelers to search, book, and manage their flight reservations.

![FlightsBooking Platform](https://placehold.co/600x400?text=FlightsBooking+Platform)

## Features

- **User Authentication**: Secure login, registration, password reset, and email verification
- **Flight Search**: Intuitive interface to search flights with filters for dates, destinations, and prices
- **Booking Management**: View, modify, and cancel bookings
- **Seat Selection**: Interactive seat map for choosing seats
- **Payment Processing**: Secure payment integration with Stripe
- **User Profiles**: Manage personal information and preferences
- **Admin Dashboard**: Manage flights, bookings, and users (admin-only)
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Offline Capabilities**: Basic functionality even without internet connection

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest, React Testing Library, Cypress

## Architecture

### Frontend Structure

The application follows Next.js App Router architecture with route groups:

- `(public)`: Routes accessible without authentication
- `(auth)`: Authentication-related routes
- `(dashboard)`: Protected routes requiring authentication

### Key Components

- **Services Layer**: API integration with backend services
- **Hooks**: Custom React hooks for shared functionality
- **Contexts**: Global state and shared data across components
- **Components**: Reusable UI components

### Data Flow

1. **User Interaction**: User interacts with the UI
2. **State Management**: Zustand stores handle local state
3. **API Integration**: Services make requests to the backend
4. **Data Rendering**: Components update based on API responses

## User Flow

1. **Search**: Users search for flights by entering origin, destination, and dates
2. **Selection**: Users select from available flights based on preferences
3. **Booking**: Users enter passenger details and select seats
4. **Payment**: Users complete payment via Stripe integration
5. **Confirmation**: Users receive booking confirmation and access to manage booking

## Design Decisions and Tradeoffs

### Next.js App Router

**Benefits**:
- Server-side rendering for improved SEO and performance
- Built-in API routes for server-side operations
- Simplified routing with file-based system

**Tradeoffs**:
- Learning curve for developers new to App Router
- Some limitations with third-party libraries integration

### Component Library (shadcn/ui)

**Benefits**:
- Consistent design language across the application
- Customizable components that maintain accessibility
- Reduced development time for common UI elements

**Tradeoffs**:
- Additional bundle size from component library
- Some customization limitations

### State Management with Zustand

**Benefits**:
- Lightweight and performant compared to Redux
- Simple API with minimal boilerplate
- TypeScript support for type safety

**Tradeoffs**:
- Less ecosystem support compared to Redux
- Limited middleware options

### Authentication with Supabase

**Benefits**:
- Ready-to-use authentication system
- OAuth integrations for social login
- Security features like 2FA

**Tradeoffs**:
- Vendor lock-in with Supabase
- Limited customization of authentication flow

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flightsbooking-frontend.git

# Navigate to project directory
cd flightsbooking-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run end-to-end tests
npm run test:e2e
```

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment Processing