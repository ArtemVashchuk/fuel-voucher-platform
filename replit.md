# Lemberg Fuel Corp.

## Overview

A mobile-first fuel package purchasing application for Ukrainian gas stations. Users can browse fuel packages from various stations (OKKO, WOG, UPG, KLO), select fuel types and volume packages, purchase at discounted prices, and receive QR codes for redemption at stations. The app features a cyberpunk/aggressive dark theme design with neon green accents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand with localStorage persistence for cart/selection flow
- **Data Fetching**: TanStack React Query for server state
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: REST endpoints under `/api/*` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Storage
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Tables**:
  - `qr_codes`: Inventory of available QR codes by station/fuel/volume
  - `purchases`: User purchase records with status tracking
  - `fuel_packages`: Predefined pricing packages

### Key Design Patterns
- **Multi-App Monorepo Structure**: 
  - `client/`: Mobile-first user app (fuel purchasing)
  - `admin-app/`: Separate admin panel for managing stations, fuel types, QR codes, packages
  - `server/`: Shared Express backend API
  - `shared/`: Shared TypeScript types and schema
- **Path Aliases**: `@/*` for client source, `@shared/*` for shared modules
- **Session-based User Tracking**: Uses browser-generated session IDs (no authentication currently)
- **Mock Data Fallback**: Static mock data in `client/src/lib/mock-data.ts` for development

### Admin App Architecture
- **Location**: `admin-app/` directory with separate React app
- **Port**: 5001 (development), proxied through nginx (Docker)
- **Features**: Full CRUD for Stations, Fuel Types, QR Codes, Packages, Purchases view
- **Deployment**: Separate Docker container running nginx to serve static build

### Development vs Production
- Development: Vite dev server with HMR, served through Express middleware
- Production: Vite builds to `dist/public`, server bundles with esbuild to `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Drizzle Kit**: Schema migrations via `npm run db:push`

### Third-Party Libraries
- **Stripe**: Payment processing integration prepared (session IDs in schema)
- **canvas-confetti**: Success page celebration effects

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay
- `@replit/vite-plugin-cartographer`: Dev tooling
- `@replit/vite-plugin-dev-banner`: Development indicator
- `connect-pg-simple`: PostgreSQL session store (prepared for future auth)

## Docker Deployment

The application supports running entirely outside of Replit using Docker.

### Files
- `docker-compose.yml`: Service orchestration (backend, PostgreSQL, migrations)
- `Dockerfile`: Multi-stage build for production
- `.env.example`: Environment variable template
- `DOCKER.md`: Detailed deployment instructions

### Quick Start
```bash
cp .env.example .env
# Edit .env with your credentials
docker-compose up -d
docker-compose run --rm migrate
```

### Environment Variables (Docker)
- `POSTGRES_*`: Database configuration
- `SESSION_SECRET`: Express session secret
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe credentials
- `TWILIO_*`: SMS verification (optional)