# Authentication Setup Guide

## Overview
This project now has a complete authentication flow with protected routes. The authentication uses secure storage and prevents unauthorized access to protected screens.

## Structure

### Contexts
- `contexts/AuthContext.tsx` - Global authentication state management

### Routes
- `app/(auth)/` - Public authentication routes (login, signup)
- `app/(tabs)/` - Protected routes (home and other app screens)
- `app/_layout.tsx` - Root layout with navigation guard

### Utils
- `utils/supabase.ts` - Supabase client configuration (to be configured)

## How It Works

1. **Initial Load**: The app checks for stored authentication tokens in SecureStore
2. **Navigation Guard**: The root layout redirects users based on authentication state
3. **Protected Routes**: All routes under `(tabs)` require authentication
4. **Public Routes**: Routes under `(auth)` are only accessible when not authenticated

## Security Features

✅ Tokens stored in SecureStore (encrypted on device)
✅ Protected routes redirect to login if not authenticated
✅ Auth state managed in React context (can't be bypassed client-side)
✅ Backend validation ready (when you implement Supabase)

## Next Steps

### 1. Configure Supabase (When Ready)

Update `utils/supabase.ts` with your Supabase credentials:
```typescript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
