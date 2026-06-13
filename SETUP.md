# Frontend Environment Configuration

## Required Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8009
```

## How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. Paste them into your `.env.local` file

## Backend Port Configuration

The frontend is configured to connect to the backend on port 8009. Make sure your backend is running on the same port.

## Running the Application

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open http://localhost:3000 in your browser

## Fixed Issues - ok

- ✅ Updated from deprecated `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
- ✅ Fixed Supabase client initialization
- ✅ Updated package dependencies
- ✅ Verified all import paths are correct
