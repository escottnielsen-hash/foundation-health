# Foundation Health

## Overview
Foundation Health is a comprehensive healthcare solutions platform focused on prevention, wellness, and holistic patient care. Built with Next.js 15, React 19, Supabase for authentication and database, and Stripe for payments.

## Project Architecture
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19 with TailwindCSS
- **Database/Auth**: Supabase
- **Payments**: Stripe
- **State Management**: Zustand
- **UI Components**: Radix UI

## Project Structure
```
app/
├── (auth)/       # Authentication pages (login, register, forgot-password)
├── (marketing)/  # Marketing pages (home, about, services)
├── (portal)/     # Protected portal pages (dashboard)
├── api/          # API routes
├── layout.tsx    # Root layout
└── globals.css   # Global styles

components/
├── layout/       # Layout components
└── ui/           # UI components (buttons, dialogs, etc.)

lib/
├── supabase/     # Supabase client configuration
└── utils/        # Utility functions

supabase/
└── migrations/   # Database migrations
```

## Environment Variables Required
The following environment variables are needed for full functionality:

### Supabase (required)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)

### Stripe (for payments)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### App
- `NEXT_PUBLIC_APP_URL` - Application URL

## Development
The development server runs on port 5000:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

## User Roles
The app supports multiple user roles:
- **Patient**: Access to patient portal
- **Physician**: Access to physician portal
- **Admin**: Full access to all areas

## Recent Changes
- Configured for Replit environment
- Set up development server on port 5000
- Added placeholder Supabase credentials (need real credentials for auth to work)
