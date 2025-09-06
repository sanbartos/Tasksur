# TaskSur - South American Services Platform

## Overview

TaskSur is a full-stack web application that connects clients with service providers (taskers) across South America, specifically focusing on Uruguay and Argentina. The platform enables users to post tasks, browse available services, make offers, and manage their service requests through a comprehensive marketplace interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React 18 with TypeScript, utilizing a modern component-based architecture:

- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

The frontend follows a modular structure with reusable components, custom hooks, and page-based organization.

### Backend Architecture
The server is built as a REST API using Express.js with TypeScript:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js for HTTP server and routing
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect authentication with session management

### Database Design
Uses PostgreSQL with a relational schema designed for marketplace functionality:

- **Users**: Store user profiles, ratings, and tasker capabilities
- **Categories**: Service categories for task classification
- **Tasks**: Job postings with budgets, locations, and requirements
- **Offers**: Proposals from taskers with pricing and timelines
- **Reviews**: Rating and feedback system
- **Messages**: Communication between clients and taskers
- **Sessions**: Authentication session storage

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed session store using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Authorization**: Route-level authentication middleware

### Task Management
- **Task Creation**: Form-based task posting with validation
- **Service Discovery**: Browse and filter available tasks by category, location, and status
- **Offer System**: Taskers can submit proposals with pricing and timelines
- **Task Lifecycle**: Status management from open to completed

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: React Query for automatic data synchronization
- **Form Validation**: Zod schemas for type-safe form handling
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Internationalization**: Spanish language support for South American market

### Payment Integration
- **PayPal Integration**: Payment processing with PayPal Server SDK
- **Multiple Currencies**: Full support for UYU (Uruguayan Peso), ARS (Argentine Peso), and USD
- **Regional Focus**: PayPal chosen for its popularity and reliability in South American markets
- **Sandbox Environment**: Development testing with PayPal's sandbox environment

## Data Flow

### Request Flow
1. Client requests hit the Express server
2. Authentication middleware validates sessions
3. Route handlers process business logic
4. Drizzle ORM handles database operations
5. JSON responses sent back to client

### State Management
1. React Query manages server state and caching
2. Forms use React Hook Form for local state
3. UI state managed through React hooks
4. Global user state maintained via authentication context

### Database Operations
1. Drizzle ORM provides type-safe database queries
2. Connection pooling via Neon serverless driver
3. Migration system for schema evolution
4. Relational queries with joins for complex data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Authentication
- **openid-client**: OpenID Connect client
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Payment Processing
- **@paypal/paypal-server-sdk**: PayPal server-side integration
- **PayPal Components**: Client-side payment button and checkout flow
- **Multi-currency Support**: UYU, ARS, USD payment processing

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type checking and compilation
- **eslint**: Code linting
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL for development and production
- **Environment Variables**: Managed through .env files
- **Session Storage**: PostgreSQL sessions table

### Production Build
- **Client Build**: Vite builds React app to static assets
- **Server Build**: esbuild bundles Express server with external dependencies
- **Asset Serving**: Express serves static files in production
- **Process Management**: Single Node.js process serving both API and static content

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Authentication**: Replit OAuth configuration
- **Sessions**: Secure session secret for production
- **CORS**: Configured for Replit deployment domains

### Scalability Considerations
- **Database**: Serverless PostgreSQL handles connection scaling
- **Caching**: React Query provides client-side caching
- **Session Store**: PostgreSQL session storage scales with database
- **Static Assets**: Served directly by Express with potential CDN integration