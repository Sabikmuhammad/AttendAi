# Automatic Role-Sync System

## How It Works

The system automatically syncs the selected role to Clerk's publicMetadata when a user signs up. No manual configuration needed!

### Flow:

1. **Role Selection** (`/role`)
   - User selects role (Student/Faculty/Admin)
   - Role is saved to Zustand store
   - Role is also saved to `localStorage` as `pendingRole`
   - User is redirected to `/sign-up`

2. **User Signs Up/Signs In**
   - Clerk handles authentication
   - After successful auth, user is redirected to app

3. **Automatic Role Sync** (RoleSyncHandler)
   - Component checks if user is authenticated
   - Reads `pendingRole` from localStorage
   - Calls `/api/sync-role` to update Clerk metadata
   - Redirects to role-specific dashboard
   - Clears pending role from localStorage

4. **Dashboard Access**
   - User lands on `/dashboard/{role}` directly
   - All future logins check `publicMetadata.role`
   - No manual role assignment needed!

### API Endpoints:

**POST `/api/sync-role`**
- Updates Clerk user's publicMetadata with selected role
- Requires authentication (uses Clerk auth token)
- Validates role values (student/faculty/admin)

**POST `/api/user`** (Enhanced)
- Now also updates Clerk metadata when role is provided
- Creates/updates MongoDB user record
- Keeps MongoDB and Clerk in sync

### Components:

**`RoleSyncHandler`**
- Client component that runs on every page load
- Only syncs when pendingRole exists
- Automatic cleanup after sync
- Silent operation (no UI disruption)

### Setup Required:

Just add Clerk keys to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

That's it! The rest is automatic.

### Testing:

1. Start dev server: `npm run dev`
2. Navigate to `/role`
3. Select a role (e.g., Faculty)
4. Click Continue → Sign up
5. After sign-up, you'll be automatically redirected to `/dashboard/faculty`
6. Role is now saved in Clerk (check Dashboard → Users → Metadata)

### Fallbacks:

- If sync fails, user is redirected to `/dashboard` 
- Dashboard page will use role from metadata or redirect to `/role`
- Graceful error handling throughout

### Benefits:

✅ Zero manual role assignment  
✅ Seamless user experience  
✅ Automatic Clerk metadata sync  
✅ MongoDB and Clerk stay in sync  
✅ Works with sign-up AND sign-in  
✅ No API key configuration for role sync  
✅ Production-ready error handling
