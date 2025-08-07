# Master Gourmet Recipe App

## Overview

Master Gourmet is a full-stack web application for managing and organizing cooking recipes. The application allows users to upload recipe videos, extract recipes from Instagram content, and leverage AI-powered analysis to automatically generate recipe details from video content. It features a mobile-first design with a React frontend and Express.js backend, using PostgreSQL for data persistence and OpenAI for intelligent recipe extraction.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gourmet-themed color palette (golden, dark red, olive tones)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Upload**: Multer middleware for handling video file uploads
- **Video Processing**: Custom video processor service for handling video downloads and processing
- **API Design**: RESTful API with structured error handling and request logging

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Design**: User-recipe relationship with support for:
  - User authentication (username/password)
  - Recipe metadata (title, description, ingredients, instructions)
  - Video storage (local file paths for videos and thumbnails)
  - AI processing flags and analysis results
  - Source tracking (upload vs Instagram)

### Authentication and Authorization
- **Current State**: Basic user system with hardcoded user ID ("default-user")
- **Architecture**: Prepared for session-based authentication with connect-pg-simple for session storage
- **Security**: User-scoped data access patterns implemented in storage layer

### AI Integration
- **OpenAI Integration**: GPT-4o for recipe analysis from video frames
- **Whisper API**: Audio transcription for recipe instructions
- **Processing Pipeline**: 
  - Video frame extraction for visual analysis
  - Audio extraction and transcription
  - AI-powered recipe enhancement combining visual and audio data

### External Dependencies

#### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for Node.js
- **react**: Frontend UI library with TypeScript support

#### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing component variants
- **lucide-react**: Icon library for consistent iconography

#### Data Management and APIs
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React
- **zod**: Schema validation for type safety
- **multer**: File upload middleware for Express

#### Media Processing
- **fluent-ffmpeg**: Video processing and manipulation (types only, actual implementation pending)
- **yt-dlp**: Instagram video downloading capability

#### Development and Build Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for Node.js development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

#### Optional Integrations
- **OpenAI API**: AI-powered recipe analysis and transcription services
- **Instagram Integration**: Video content extraction from Instagram URLs