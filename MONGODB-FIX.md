# MongoDB Fix Guide

This project uses MongoDB Atlas through `MONGODB_URI` in `.env.local`.

## Typical Error

```text
MongooseServerSelectionError: Server selection timed out
```

In this codebase, this is usually one of:

1. Atlas cluster is paused
2. Atlas Network Access does not allow your client IP
3. Invalid URI credentials or encoding
4. DNS/network issue to Atlas SRV endpoint

## Fast Checklist

1. Confirm env variable exists:

```bash
grep -n "MONGODB_URI" .env.local
```

2. Resume cluster in Atlas if paused.
3. Add Network Access entry (your IP or `0.0.0.0/0` for development).
4. Restart Next.js dev server.

## Atlas Steps

### 1) Resume paused cluster

- Open https://cloud.mongodb.com
- Go to Database / Clusters
- If cluster shows `Paused`, click `Resume`
- Wait until status is active

### 2) Allow your IP

- Atlas -> Network Access
- Add current IP, or temporarily use `0.0.0.0/0` in development

## URI Format

Use this format:

```text
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Cluster0
```

If password contains special characters, URL-encode them:

- `@` -> `%40`
- `#` -> `%23`
- `$` -> `%24`
- `%` -> `%25`
- `&` -> `%26`

## Network/DNS Checks

```bash
# Basic internet
curl -I https://www.google.com

# Atlas SRV resolution
dig _mongodb._tcp.<your-cluster>.mongodb.net SRV +short

# One shard TCP connectivity
nc -zv <first-shard-host> 27017
```

## Code Behavior in This Project

MongoDB connection uses retry and longer timeouts in `src/lib/mongodb.ts`:

- `serverSelectionTimeoutMS: 45000`
- `connectTimeoutMS: 30000`
- `socketTimeoutMS: 45000`

These values help when Atlas M0 needs extra time to wake up.

## Restart Commands

After env or Atlas changes:

```bash
pkill -f "next dev --port 3000" || true
rm -rf .next
npm run dev
```

## Optional Local MongoDB

If Atlas is unavailable, local development can use:

```text
MONGODB_URI=mongodb://localhost:27017/attendai
```

Then restart frontend.
