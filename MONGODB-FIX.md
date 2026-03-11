# MongoDB Atlas Connection Fix

## Error
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution: Whitelist Your IP Address

### Option 1: Allow All IPs (Development Only)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Click **"Allow Access From Anywhere"**
6. Enter `0.0.0.0/0` in the IP Address field
7. Add a comment: "Development - Allow All"
8. Click **"Confirm"**

**⚠️ Warning:** This allows connections from any IP. Only use for development.

### Option 2: Whitelist Your Current IP (Recommended for Production)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Click **"Add Current IP Address"**
6. MongoDB will auto-detect your IP
7. Click **"Confirm"**

**Note:** If your IP changes (e.g., on WiFi networks), you'll need to add the new IP.

### Option 3: Verify Your Connection String
Check your `.env.local` file:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Make sure:
- ✅ Username is correct
- ✅ Password is correct (no special characters need URL encoding)
- ✅ Cluster URL is correct
- ✅ Database name is specified

### How to Get Current IP
```bash
curl ifconfig.me
```

### Test Connection After Fix

1. **Restart Dev Server:**
```bash
npm run dev
```

2. **Test Database Connection:**
Visit: `http://localhost:3000/api/debug/users`

If successful, you should see:
```json
{
  "success": true,
  "count": 0,
  "users": [],
  "message": "Users found" or "No users found..."
}
```

### Common Issues

**Issue 1:** Password contains special characters  
**Solution:** URL encode special characters in MongoDB URI:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

Example:
```
# Before
mongodb+srv://user:P@ssw0rd!@cluster.net

# After
mongodb+srv://user:P%40ssw0rd!@cluster.net
```

**Issue 2:** Cluster is paused  
**Solution:** Go to Atlas dashboard and resume the cluster

**Issue 3:** Network Access shows different IP  
**Solution:** Your IP changed. Add the new IP or use 0.0.0.0/0

---

## Alternative: Use Local MongoDB (Optional)

If you want to develop without Atlas:

1. **Install MongoDB locally:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

2. **Update .env.local:**
```bash
MONGODB_URI=mongodb://localhost:27017/attendai
```

3. **Restart server:**
```bash
npm run dev
```

---

## Quick Fix for Development

**Temporary Solution:** If you want to test the app without MongoDB, the system will still work (UserSyncHandler gracefully fails in the background). MongoDB is only needed for:
- Student management
- Class management  
- Attendance records
- Reports

Clerk authentication will still work without MongoDB.

---

## Verify Fix Worked

After whitelisting your IP, test these endpoints:

1. **Debug Users:**
```bash
curl http://localhost:3000/api/debug/users
```

2. **Sync Current User:**
```bash
curl -X POST http://localhost:3000/api/sync-user-to-db
```

3. **Create Test Student:**
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "registerNumber": "TEST001",
    "email": "test@example.com",
    "department": "Computer Science"
  }'
```

If all return success, MongoDB is connected! ✅
