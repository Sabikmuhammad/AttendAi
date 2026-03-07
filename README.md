# AttendAI — AI Smart Classroom Attendance System

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- Clerk account

### 1. Configure Environment Variables

Edit `.env.local` and fill in your credentials:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from [clerk.com](https://dashboard.clerk.com)
- `CLERK_SECRET_KEY` — from Clerk dashboard
- `MONGODB_URI` — from [MongoDB Atlas](https://cloud.mongodb.com)

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Web App

```bash
npm run dev
```

App runs at http://localhost:3000

### 4. Start the AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

AI service runs at http://localhost:8000

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| UI Components | ShadCN UI |
| Authentication | Clerk (RBAC) |
| Database | MongoDB Atlas, Mongoose |
| AI Service | Python, FastAPI, OpenCV, face_recognition |

## Architecture

```
Webcam → Next.js → Python AI API → Recognition → Next.js → MongoDB → Attendance
```

## Roles

| Role | Access |
|------|--------|
| `admin` | All dashboards, user management |
| `faculty` | Create classes, live class, attendance |
| `student` | Own attendance history |
