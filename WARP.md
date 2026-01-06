# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack AI chat application built with React (Vite) on the frontend and Express.js on the backend. It integrates Google's Gemini AI for conversational responses, uses Clerk for authentication, MongoDB for data persistence, and ImageKit for image handling.

## Architecture

### Monorepo Structure
The project is organized as a monorepo with two main directories:
- `backend/` - Express.js REST API server
- `client/` - React SPA built with Vite

### Backend (`backend/`)
- **Entry Point**: `index.js` - Express server with MongoDB connection, Clerk authentication middleware, and API routes
- **Models** (`models/`):
  - `chats.js` - Stores individual chat conversations with history array of user/model messages
  - `userChats.js` - Stores user's chat list (metadata only: chat IDs and titles)
- **API Routes**:
  - `GET /api/upload` - ImageKit authentication parameters (public)
  - `POST /api/chats` - Create new chat (authenticated)
  - `GET /api/userchats` - Fetch user's chat list (authenticated)
  - `GET /api/chats/:id` - Fetch specific chat with history (authenticated)
  - `PUT /api/chats/:id` - Update chat with new messages (authenticated)
- **Authentication**: All `/api/chats*` and `/api/userchats` routes use `ClerkExpressRequireAuth()` middleware
- **Production**: Server serves static client build from `../client/dist`

### Frontend (`client/src/`)
- **Entry Point**: `main.jsx` - Sets up React Router with nested layouts
- **Routing Structure**:
  - `RootLayout` (wraps all routes with Clerk + React Query providers)
    - `/` - Homepage
    - `/sign-in/*` - Clerk sign-in
    - `/sign-up/*` - Clerk sign-up
    - `DashboardLayout` (protected, shows ChatList sidebar)
      - `/dashboard` - Dashboard page
      - `/dashboard/chats/:id` - Chat page with conversation
- **Key Components**:
  - `ChatList` - Sidebar showing user's chat history
  - `NewPrompt` - Chat input form with image upload, handles Gemini streaming responses
  - `Upload` - Image upload component using ImageKit
- **Layouts**:
  - `RootLayout` - Top-level layout with Clerk authentication and React Query setup
  - `DashboardLayout` - Protected layout with auth check and sidebar navigation
- **State Management**: 
  - `@tanstack/react-query` for server state
  - Local React state for chat UI
- **AI Integration**: `lib/gemini.js` configures Google Generative AI client with safety settings

### Data Flow for Chat Messages
1. User submits message via `NewPrompt` component
2. Message sent to Gemini API via streaming (`chat.sendMessageStream`)
3. Response streamed and displayed in real-time
4. After completion, both question and answer saved to backend via `PUT /api/chats/:id`
5. React Query invalidates cache to refresh chat history

### Environment Variables
**Backend** (`.env` file in `backend/`):
- `PORT` - Server port (default: 3000)
- `CLIENT_URL` - Frontend URL for CORS
- `MONGO` - MongoDB connection string
- `IMAGE_KIT_ENDPOINT` - ImageKit URL endpoint
- `IMAGE_KIT_PUBLIC_KEY` - ImageKit public key
- `IMAGE_KIT_PRIVATE_KEY` - ImageKit private key
- Clerk environment variables (check Clerk SDK docs)

**Frontend** (`.env` file in `client/`):
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `VITE_GEMINI_PUBLIC_KEY` - Google Gemini API key
- `VITE_API_URL` - Backend API URL
- `VITE_IMAGE_KIT_ENDPOINT` - ImageKit URL endpoint

## Development Commands

### Backend
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon (requires .env file)
npm start

# Server runs on port 3000 by default
```

### Frontend
```powershell
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Full Stack Development
Run both servers simultaneously in separate terminal windows:
1. Terminal 1: `cd backend && npm start`
2. Terminal 2: `cd client && npm run dev`

## Code Conventions

### ESLint Rules (Client)
- PropTypes validation disabled (`react/prop-types: off`)
- Unused variables show warnings (not errors)
- React Refresh requires component-only exports (with exceptions for constants)

### Database Schema Conventions
- `userId` field uses String type (from Clerk)
- Chat history follows Gemini format: `{ role: "user"|"model", parts: [{ text: string }], img?: string }`
- Timestamps enabled on both schemas

### Import Style
- ES6 modules throughout (`type: "module"` in package.json)
- Named imports for utilities, default exports for components

## Key Dependencies
- **Frontend**: React 19 RC, Vite, React Router 7, Clerk React, TanStack Query, Google Generative AI SDK
- **Backend**: Express 5, Mongoose, Clerk Node SDK, ImageKit, Nodemon
- **AI**: Google Gemini 1.5 Flash model with safety settings

## Production Deployment
The backend serves the client's static build in production:
- Client build output: `client/dist/`
- Backend serves all routes through `client/dist/index.html` for SPA routing
- Build client first: `cd client && npm run build`
- Start backend: `cd backend && npm start`
