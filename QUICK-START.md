# Quick Start

## 1) Prerequisites

- Node.js 20+ (22 LTS recommended)
- Python 3.8+
- MongoDB Atlas connection string
- Clerk keys

## 2) Configure env

Root `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

`ai-service/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
DATABASE_NAME=test
```

## 3) Install

```bash
npm install
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4) Run

Terminal 1:

```bash
cd ai-service
source venv/bin/activate
python main.py
```

Terminal 2:

```bash
npm run dev
```

## 5) Verify key pages

- `/admin/dashboard`
- `/admin/students`
- `/admin/classes`
- `/admin/create-class`
- `/admin/camera`
- `/faculty/dashboard`
- `/student/dashboard`

## 6) If MongoDB login fails

Error example:

```text
MongooseServerSelectionError: Server selection timed out
```

Fix:

1. Resume Atlas cluster if paused.
2. Add your IP in Atlas Network Access (`0.0.0.0/0` for dev is OK).
3. Verify username/password and URL encoding in `MONGODB_URI`.
4. Restart frontend dev server.

See full guide: `MONGODB-FIX.md`.

## 7) If Next.js dev throws missing chunk errors

Error example:

```text
Cannot find module './1331.js'
```

Fix:

```bash
pkill -f "next dev --port 3000" || true
rm -rf .next
npm run dev
```

Use only one frontend dev process at a time.
