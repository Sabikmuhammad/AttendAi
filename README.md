# AttendAI

AI-assisted classroom attendance platform with a Next.js admin/faculty/student web app and a Python AI service.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Auth: Clerk
- Database: MongoDB Atlas + Mongoose
- AI service: FastAPI + OpenCV + face_recognition

## Current Project Structure

```text
AttendAi/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── ...
│   │   ├── faculty/
│   │   ├── student/
│   │   ├── api/
│   │   │   ├── attendance/route.ts
│   │   │   ├── classes/route.ts
│   │   │   ├── faculty/route.ts
│   │   │   ├── students/route.ts
│   │   │   └── onboarding/set-role/route.ts
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── mongodb.ts
│   │   ├── class-status.ts
│   │   └── utils.ts
│   ├── models/
│   │   ├── Attendance.ts
│   │   ├── Class.ts
│   │   ├── Faculty.ts
│   │   └── Student.ts
│   └── components/ui/
├── ai-service/
│   ├── main.py
│   ├── embeddings.py
│   ├── face_detector.py
│   ├── recognition.py
│   └── requirements.txt
├── README.md
├── QUICK-START.md
├── SETUP.md
├── SETUP_GUIDE.md
└── MONGODB-FIX.md
```

## Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

Create `ai-service/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster0
DATABASE_NAME=test
```

## Local Development

1. Install frontend dependencies:

```bash
npm install
```

2. Install AI service dependencies:

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

3. Start AI service:

```bash
cd ai-service
source venv/bin/activate
python main.py
```

4. Start frontend:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- AI service: http://localhost:8000

## Common Issues

### MongoDB server selection timeout

If login fails with `MongooseServerSelectionError: Server selection timed out`:

1. Check cluster status in Atlas and resume if paused.
2. Check Atlas Network Access (allow your IP or `0.0.0.0/0` for development).
3. Verify `MONGODB_URI` credentials and URL encoding.
4. Restart dev server after `.env.local` changes.

Detailed guide: `MONGODB-FIX.md`.

### Next.js dev missing chunk/module errors

If you see `Cannot find module './xxxx.js'` under `.next/server`:

```bash
pkill -f "next dev --port 3000" || true
rm -rf .next
npm run dev
```

Run only one Next.js dev server at a time.

## Useful Docs

- `QUICK-START.md` - minimal run checklist
- `SETUP_GUIDE.md` - complete setup details
- `MONGODB-FIX.md` - Atlas troubleshooting
- `AI_MONITORING_GUIDE.md` - monitoring flow
