# AttendAI - AI-Powered Smart Classroom Attendance

Modern AI company-style landing page and role-based dashboards built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

### Landing Page (Minimal AI Company Design)
- **Hero Section** with AI face detection animation
  - Real-time scanning effect
  - Face bounding box detection
  - Confidence score display
  - Animated tech badges
- **Features Section** with 6 core technology cards
  - Deep Face Recognition
  - Computer Vision Analytics
  - Automated Detection
  - CCTV & Webcam Integration
  - Real-time Monitoring
  - Privacy & Security
- **How It Works** - 4-step process with animated cards
- **Product Showcase** - UI preview cards for dashboards
- **CTA Section** with gradient background
- **Footer** with product/technology/resources links

### Role Selection System
- Choose role before authentication: Student, Faculty, or Administrator
- Animated role cards with Framer Motion
- State management with Zustand (persisted)
- Smooth transitions to Clerk authentication

### Authentication (Clerk)
- Sign In / Sign Up pages with custom styling
- Protected routes with middleware
- Role-based redirects
- User sync with MongoDB via webhooks

### Role-Based Dashboards

#### Student Dashboard
- Attendance rate statistics (4 metric cards)
- Recent attendance history
- Course performance tracking
- Clean white UI with purple accents

#### Faculty Dashboard
- Live camera feed monitoring
- Student detection logs
- Active classes overview
- Real-time attendance alerts
- Student management

#### Administrator Dashboard
- System health monitoring
- Active sessions tracking
- User management
- Camera network status
- Analytics overview

## 🛠 Tech Stack

- **Framework:** Next.js 14/15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI
- **Animations:** Framer Motion
- **Authentication:** Clerk
- **Database:** MongoDB with Mongoose
- **State Management:** Zustand
- **Webhook Handling:** Svix

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd AttendAi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

## 🔑 Environment Variables

Create a `.env.local` file with the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendai
```

### Optional feature flags

```env
ENABLE_SUBDOMAINS=true     # Subdomains are *disabled* by default (set to true when you're ready)
ATTENDANCE_SERVICE_TOKEN=secure-token-from-ai-service
```

### Getting Clerk Credentials

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy the Publishable Key and Secret Key
4. Go to Webhooks → Add Endpoint
5. Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
6. Select events: `user.created`, `user.updated`, `user.deleted`
7. Copy the Webhook Secret

### Getting MongoDB URI

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a cluster
3. Create a database user
4. Get connection string
5. Replace `<password>` with your password

## 🚀 Development

```bash
# Run development server
npm run dev

# Open browser
http://localhost:3000
```

## 🏗 Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
AttendAi/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── user/route.ts           # User CRUD operations
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts      # Clerk webhook handler
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Dashboard router (role-based redirect)
│   │   │   ├── student/
│   │   │   │   ├── layout.tsx          # Student dashboard layout
│   │   │   │   └── page.tsx            # Student dashboard page
│   │   │   ├── faculty/
│   │   │   │   ├── layout.tsx          # Faculty dashboard layout
│   │   │   │   └── page.tsx            # Faculty dashboard page
│   │   │   └── admin/
│   │   │       ├── layout.tsx          # Admin dashboard layout
│   │   │       └── page.tsx            # Admin dashboard page
│   │   ├── role/
│   │   │   └── page.tsx                # Role selection page
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx            # Clerk sign-in page
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx            # Clerk sign-up page
│   │   ├── globals.css                 # Global styles (light theme)
│   │   ├── layout.tsx                  # Root layout with ClerkProvider
│   │   └── page.tsx                    # Landing page
│   ├── components/
│   │   ├── landing/
│   │   │   ├── AIDetectionAnimation.tsx    # AI face detection animation
│   │   │   ├── NewHeroSection.tsx          # Hero section
│   │   │   ├── NewFeaturesSection.tsx      # Features section
│   │   │   ├── NewHowItWorksSection.tsx    # How it works section
│   │   │   ├── NewProductShowcaseSection.tsx # Product showcase
│   │   │   ├── NewCTASection.tsx           # Call to action
│   │   │   ├── NewNavbar.tsx               # Landing navbar
│   │   │   └── NewFooter.tsx               # Footer
│   │   ├── ui/                         # ShadCN UI components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   ├── Navbar.tsx                  # Dashboard navbar
│   │   └── Sidebar.tsx                 # Dashboard sidebar
│   ├── lib/
│   │   ├── mongodb.ts                  # MongoDB connection
│   │   ├── store.ts                    # Zustand store (role state)
│   │   └── utils.ts                    # Utility functions
│   ├── models/
│   │   └── User.ts                     # Mongoose User model
│   └── middleware.ts                   # Clerk middleware (route protection)
└── package.json
```

## 🎨 Design System

### Colors
- **Primary:** Purple (`#9333ea`, `#7c3aed`)
- **Background:** White (`#FFFFFF`)
- **Text:** Gray-900 (`#171717`)
- **Borders:** Gray-200 (`#E5E5E5`)

### Components
- **Border Radius:** `rounded-2xl` (1rem), `rounded-3xl` (1.5rem)
- **Shadows:** `shadow-sm`, `shadow-lg`, `shadow-xl`
- **Spacing:** Apple-level spacing (large gaps, generous padding)

### Animations
- **Page Transitions:** Fade + slide up
- **Hover Effects:** Scale (1.02), translate
- **AI Detection:** Scanning line, corner brackets, data points

## 🔐 Authentication Flow

1. User lands on `/` (landing page)
2. Clicks "Get Started" → `/role` (role selection)
3. Selects role (Student/Faculty/Admin) → saved in Zustand
4. Clicks "Continue" → `/sign-up` (Clerk authentication)
5. After sign-up/sign-in → `/dashboard` (redirects based on role)
6. User data synced to MongoDB via webhook

## 🗄 Database Schema

### User Model
```typescript
{
  clerkId: String (unique)      // Clerk user ID
  email: String (unique)        // User email
  name: String                  // Full name
  role: String                  // 'student' | 'faculty' | 'admin'
  imageUrl: String              // Profile image URL
  createdAt: Date               // Account creation timestamp
}
```

## 🔗 API Routes

### POST `/api/webhooks/clerk`
Clerk webhook handler for user sync (create/update/delete)

### GET `/api/user`
Fetch current user from MongoDB

### POST `/api/user`
Create or update user in MongoDB

## 📱 Routes

- `/` - Landing page
- `/role` - Role selection
- `/sign-in` - Clerk sign in
- `/sign-up` - Clerk sign up
- `/dashboard` - Role-based redirect
- `/dashboard/student` - Student dashboard
- `/dashboard/faculty` - Faculty dashboard
- `/dashboard/admin` - Admin dashboard

## 🎯 Key Features

### Landing Page
- ✅ Minimal white design with purple accents
- ✅ AI face detection animation with scanning effect
- ✅ 6 feature cards with icons and gradients
- ✅ 4-step "How It Works" process
- ✅ Product showcase with UI previews
- ✅ Responsive navbar with mobile menu
- ✅ Footer with social links

### Dashboards
- ✅ Shared sidebar and navbar components
- ✅ Role-based navigation items
- ✅ Animated statistics cards
- ✅ Real-time monitoring UI
- ✅ User profile integration
- ✅ Protected routes with middleware

### State Management
- ✅ Zustand for client-side state
- ✅ Persisted role selection
- ✅ MongoDB for persistent data
- ✅ Clerk for authentication state

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)
Set all variables from `.env.example` in Vercel dashboard

### Webhook Configuration
Update Clerk webhook endpoint to production URL:
```
https://your-domain.vercel.app/api/webhooks/clerk
```

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for AI-powered attendance automation

---

**Note:** This is a frontend-focused implementation. For production use, integrate with the Python AI service (`ai-service/`) for actual face recognition functionality.
