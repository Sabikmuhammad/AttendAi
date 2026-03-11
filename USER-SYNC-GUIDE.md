# ✅ MongoDB Connected - User Sync Guide

MongoDB Atlas connection is working! Now let's sync your user.

## Current Status
```json
{
  "success": true,
  "count": 0,
  "users": [],
  "message": "No users found in MongoDB"
}
```

---

## Quick Sync Methods

### Method 1: Automatic Sync (Recommended)
The system automatically syncs users on login. Just:

1. **Refresh the page or navigate to a new route**
   ```
   http://localhost:3000/admin/dashboard
   ```

2. **Check if user was synced:**
   ```
   http://localhost:3000/api/debug/users
   ```

You should see your user in the response.

---

### Method 2: Manual Sync API

If automatic sync didn't work, trigger it manually:

**In Browser Console (F12):**
```javascript
fetch('/api/sync-user-to-db', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Sync result:', data));
```

**Or use curl:**
```bash
curl -X POST http://localhost:3000/api/sync-user-to-db \
  -H "Cookie: $(curl -s http://localhost:3000 -c - | grep __session)"
```

---

### Method 3: Check UserSyncHandler Logs

The `UserSyncHandler` runs automatically on every page load. Check your browser console (F12) for:

```
[UserSyncHandler] User synced: created
```

Or:
```
[UserSyncHandler] User synced: updated
```

---

## Verify User Was Synced

**Visit debug endpoint:**
```
http://localhost:3000/api/debug/users
```

You should see something like:
```json
{
  "success": true,
  "count": 1,
  "users": [
    {
      "_id": "...",
      "clerkId": "user_...",
      "email": "your@email.com",
      "name": "Your Name",
      "role": "admin",
      "createdAt": "2026-03-10..."
    }
  ],
  "message": "Users found"
}
```

---

## Troubleshooting

### Issue: Still no users after refresh

**Solution 1: Check browser console**
- Open DevTools (F12)
- Look for `[UserSyncHandler]` messages
- If you see errors, check if you're logged in

**Solution 2: Force re-login**
```bash
# Clear cookies and sign in again
1. Go to http://localhost:3000
2. Click your profile → Sign Out
3. Sign in again
4. Navigate to /admin/dashboard
```

**Solution 3: Check Clerk authentication**
```javascript
// In browser console
console.log('Logged in:', window.Clerk?.user?.id);
```

### Issue: Error in console

**If you see permission errors:**
- Make sure you're accessing from `localhost:3000` (not a different port)
- Check that you're authenticated (should see UserButton in navbar)

---

## Next Steps

Once your user appears in `/api/debug/users`:

1. ✅ **Set your role to admin** (in Clerk Dashboard)
   ```json
   { "role": "admin" }
   ```

2. ✅ **Access admin dashboard**
   ```
   http://localhost:3000/admin/dashboard
   ```

3. ✅ **Start creating students and classes!**

---

## Test Complete Admin Flow

1. **Create a student:**
   ```
   http://localhost:3000/admin/students
   Click "Add Student"
   ```

2. **Create a class:**
   ```
   http://localhost:3000/admin/create-class
   ```

3. **Start live monitoring:**
   ```
   http://localhost:3000/admin/classes
   Click "Start" on a class
   Then go to /admin/live-monitor
   ```

---

## MongoDB Atlas Webhook (Optional)

For production, set up Clerk webhooks to automatically sync new users:

1. **In Clerk Dashboard:**
   - Go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`
   - Copy signing secret

2. **Add to .env.local:**
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

For development, `UserSyncHandler` is sufficient - it runs automatically! ✅
