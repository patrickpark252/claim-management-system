# Claim Management System

## Overview

This is a web-based claim management system designed to handle customer complaints, returns, and defective product claims. The application is built with a React frontend and Express.js backend, using Excel file imports to manage order data. The system provides a comprehensive interface for tracking order status, managing progress states, and handling customer service workflows.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **File Processing**: Multer for file uploads and XLSX library for Excel processing
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful endpoints with consistent error handling

### Database Architecture
- **Primary Tables**:
  - `orders`: Main order data with 21 columns matching Excel structure
  - `logs`: Audit trail for order changes and actions
- **Database Provider**: Neon Database (PostgreSQL-compatible serverless)
- **Migration Tool**: Drizzle Kit for schema management

## Key Components

### Data Models
- **Orders**: Comprehensive order tracking with fields for mall info, game details, buyer information, status tracking, and custom columns
- **Logs**: Action logging system for audit trails and change tracking
- **Excel Integration**: Support for 21-column Excel file structure with automatic parsing

### User Interface Components
- **Order List**: Sortable and filterable order management interface
- **Order Detail**: Inline editing for order fields with double-click activation
- **Memo Section**: Rich text memo management with date insertion functionality
- **Sidebar**: Quick filtering and bulk actions interface
- **Status Management**: Predefined progress states and processing options

### File Management
- **Excel Import**: Automatic parsing of Excel files starting from row 3
- **Image Handling**: Support for order-related image uploads and management
- **Folder Creation**: Automatic folder generation based on order patterns

## Data Flow

1. **Excel Import**: Users upload Excel files which are parsed and stored in PostgreSQL
2. **Order Management**: Orders are displayed in a list with real-time filtering and sorting
3. **Status Updates**: Progress and processing states are updated through UI interactions
4. **Audit Logging**: All changes are automatically logged with timestamps and user actions
5. **Real-time Sync**: Frontend automatically refreshes data every 30 seconds

## External Dependencies

### Core Dependencies
- **Database**: Neon Database for PostgreSQL hosting
- **UI Library**: Radix UI for accessible component primitives
- **Validation**: Zod for runtime type checking and validation
- **File Processing**: XLSX library for Excel file manipulation
- **Date Handling**: date-fns for date formatting and manipulation

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server with HMR
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Port Configuration**: Frontend served on port 5000, API routes on same port
- **Hot Reload**: Vite development server with automatic reloading

### Production Build
- **Frontend**: Static build output to `dist/public` directory
- **Backend**: Bundled with ESBuild for Node.js runtime
- **Database**: Automatic connection to Neon Database via environment variables
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **File Storage**: Local file system for uploaded images and documents
- **Session Storage**: PostgreSQL-based session management

## Changelog

```
Changelog:
- June 15, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```