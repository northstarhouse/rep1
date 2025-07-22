# North Star House Check-In Dashboard

## Overview

This is a single-page responsive check-in dashboard application built for North Star House staff and volunteers. The application provides a centralized interface for managing volunteer check-ins, guest registrations, employee time tracking, and data management. It features a clean, modern design with PostgreSQL database integration for persistent data storage and management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom North Star House brand colors
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following conventional patterns
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Data Storage**: DatabaseStorage class with full CRUD operations for persistent data

### Key Components

#### Database Schema
The application manages three main entity types:
- **Volunteers**: Track check-ins, areas of work, and activities
- **Guests**: Handle registrations with contact info and visit purposes
- **Staff**: Manage employee time tracking and notes

#### API Endpoints
- `POST /api/volunteer` - Create volunteer check-in records
- `GET /api/volunteer` - Retrieve volunteer data with optional category filtering
- `POST /api/guest` - Register new guests
- `POST /api/employee-clock` - Handle staff time tracking
- `GET /api/people` - Retrieve all people data for management
- `GET /api/stats` - Provide dashboard statistics

#### UI Components
- **Dashboard**: Central navigation hub with color-coded action cards
- **Modal System**: Four specialized modals for different functions
  - Volunteer Check-In: Category and activity selection
  - Guest Registration: Contact info and visit purpose capture
  - Employee Clock: Time tracking with notes
  - Manage & Data: Data overview and management tools

## Data Flow

1. **User Interaction**: Users interact with the dashboard cards to open specific modals
2. **Form Submission**: Forms use React Hook Form with Zod validation
3. **API Communication**: TanStack Query handles API requests with automatic caching
4. **Database Operations**: Drizzle ORM provides type-safe database interactions
5. **Real-time Updates**: Query cache invalidation ensures fresh data after mutations
6. **Toast Notifications**: User feedback through toast notifications for all actions

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Consistent icon library
- **Class Variance Authority**: Variant-based styling utility

### Data Management
- **Drizzle ORM**: Type-safe PostgreSQL ORM
- **Drizzle-Kit**: Database migration and introspection tools
- **Neon Database**: Serverless PostgreSQL hosting
- **Zod**: Runtime type validation and parsing

### Developer Experience
- **TypeScript**: Static typing throughout the application
- **ESBuild**: Fast JavaScript bundler for production
- **TSX**: TypeScript execution for development
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite HMR for instant frontend updates
- **Development Server**: Express middleware serves Vite in development
- **Database**: Connects to PostgreSQL via DATABASE_URL environment variable

### Production
- **Build Process**: 
  1. Frontend built with Vite to `dist/public`
  2. Backend bundled with ESBuild to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Environment**: NODE_ENV controls development/production behavior
- **Database Migration**: `npm run db:push` applies schema changes

### Configuration
- **Environment Variables**: DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE for database connection
- **TypeScript Paths**: Configured aliases for clean imports (@/, @shared/)
- **Tailwind Config**: Custom brand colors and responsive breakpoints
- **Drizzle Config**: PostgreSQL dialect with schema and migration paths

## Recent Changes

### Database Integration (July 22, 2025)
- **Added PostgreSQL Database**: Replaced in-memory storage with persistent PostgreSQL database
- **Database Schema**: Created tables for volunteers, guests, staff, and users with proper relationships
- **Migration System**: Implemented Drizzle migrations for database schema management
- **DatabaseStorage Class**: Full CRUD operations with type-safe database queries
- **Environment Setup**: Configured database connection with environment variables

### Returning Volunteers/Staff Lists (July 22, 2025)
- **Quick Check-In Feature**: Added tabs to volunteer and employee modals for easy re-check-in
- **Returning People Lists**: Show lists of previously checked-in volunteers and staff for quick selection
- **Name Auto-Fill**: Click on returning person's name to auto-fill the form
- **API Endpoints**: Added `/api/volunteer-names` and `/api/staff-names` to fetch unique names
- **Improved UX**: Faster check-in process for regular volunteers and staff members

The application is designed to be lightweight, fast, and easy to maintain while providing a comprehensive solution for North Star House's check-in and data management needs with persistent data storage.