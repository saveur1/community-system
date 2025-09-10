# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript community listening tool built with React (frontend) and Express.js (backend). The application supports multiple languages, uses Server-Side Rendering (SSR), and provides a comprehensive API for community engagement features like surveys, feedback, announcements, and user management.

## Common Commands

### Development
- `npm run dev` - Start development server with hot reload (includes TSOA route generation)
- `npm run debug` - Start server with debugger attached
- `npm run lint` - Run TypeScript type checking

### Building
- `npm run build` - Build both client and server for production
- `npm run build:client` - Build only the client-side bundle
- `npm run build:server` - Build only the server-side bundle for SSR

### Production
- `npm run serve` - Start production server

### Database & Setup
- `npm run setup:system` - Run initial system setup
- `npm run seed` - Seed database with mock data

### Utilities
- `npm run translate` - Run translation script for i18n

### Testing Individual Components
- Run specific tests: `npx jest path/to/test.spec.ts`
- Run single controller test: `npx tsx backend/controllers/auth.ts` (for testing individual controller logic)

## Architecture Overview

### Full-Stack SSR Setup
- **Frontend**: React 19 with TanStack Router for file-based routing
- **Backend**: Express.js with TSOA for automatic API generation and Swagger docs
- **SSR**: Vite handles both client and server builds with separate entry points
- **Database**: MySQL with Sequelize ORM and automatic model associations

### Key Architectural Patterns

#### API Layer (TSOA-Generated)
- Controllers in `backend/controllers/` use TSOA decorators for automatic route generation
- Run `npx tsoa routes && npx tsoa spec` to regenerate API routes and Swagger docs
- API documentation available at `/api/docs` in development
- Authentication handled via middleware in `backend/middlewares/auth.ts`

#### Frontend Routing
- File-based routing with TanStack Router in `src/routes/`
- Routes auto-generated in `routeTree.gen.ts` - do not edit manually
- SSR support with separate entry points: `entry-client.tsx` and `entry-server.tsx`

#### Database Models
- Sequelize models in `backend/models/` with associations defined in `index.ts`
- Database connection and initialization in `backend/config/database.ts`
- Migrations and schema changes should sync through Sequelize

#### State Management
- TanStack Query for server state management
- Custom hooks in `src/hooks/` for API interactions
- React Context for auth state and global app state

### Project Structure Notes

#### Backend Organization
- `controllers/` - TSOA controllers for API endpoints
- `models/` - Sequelize models and database schema
- `middlewares/` - Express middleware (auth, error handling, file upload)
- `types/` - TypeScript type definitions
- `config/` - Database and application configuration

#### Frontend Organization  
- `routes/` - File-based routing structure (auto-generated tree)
- `components/` - Reusable UI components organized by feature
- `api/` - Client-side API functions (axios-based)
- `hooks/` - Custom React hooks for data fetching and state

#### Key Files
- `server.ts` - Main server entry point with Vite integration
- `vite.config.ts` - Build configuration for client/server separation
- `tsoa.json` - TSOA configuration for API generation

## Environment Setup

Copy `.env.example` to `.env` and configure:
- Database connection (MySQL)
- JWT secrets for authentication
- SMTP settings for email notifications  
- Google OAuth credentials
- API URL for client-side requests

## Development Workflow

1. **API Changes**: Modify controllers → Run `npm run dev` (includes TSOA regeneration)
2. **Database Changes**: Update models → Restart dev server → Run migrations if needed
3. **Frontend Routes**: Add files to `src/routes/` → Router tree updates automatically
4. **Component Development**: Hot reload active, but restart server for SSR changes

## Important Implementation Details

### Authentication Flow
- JWT-based with Google OAuth support
- Middleware validates tokens on protected routes
- User roles and permissions system integrated

### Internationalization
- i18next setup with language detection
- Translation files and utilities in place
- Server-side language context passed to client

### File Upload Handling
- Multer middleware configured for document uploads
- Document management through dedicated controller

### Database Relationships
- Complex relational structure with organizations, projects, surveys, users
- Sequelize associations handle relationships automatically
