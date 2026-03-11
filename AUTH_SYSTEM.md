# AttendAI Authentication System

## 🎨 Overview

A production-grade authentication system with premium modern UI for the AttendAI platform. Built with enterprise-level security and $1B startup design aesthetics.

## 🚀 Features

### Authentication
- ✅ Email + Password login
- ✅ OTP verification via Resend
- ✅ Role-based access control (Admin, Faculty, Student)
- ✅ Secure JWT sessions with NextAuth.js
- ✅ Password hashing with bcrypt
- ✅ OTP expiration (5 minutes)
- ✅ Rate limiting ready

### Premium UI/UX
- ✅ Glassmorphism cards
- ✅ Gradient backgrounds
- ✅ Smooth Framer Motion animations
- ✅ Auto-focus and paste support for OTP
- ✅ Countdown timer for OTP
- ✅ Loading states
- ✅ Error/Success notifications
- ✅ Responsive design
- ✅ Accessibility compliant

### Security
- ✅ bcrypt password hashing (12 rounds)
- ✅ OTP auto-deletion after expiration
- ✅ Email verification required
- ✅ Secure session management
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ Role-based middleware protection

## 📁 Project Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx              # Premium login page
│   ├── register/
│   │   └── page.tsx              # Premium registration page
│   ├── verify-otp/
│   │   └── page.tsx              # 6-digit OTP verification
│   ├── unauthorized/
│   │   └── page.tsx              # Access denied page
│   └── api/
│       └── auth/
│           ├── [...nextauth]/
│           │   └── route.ts      # NextAuth handler
│           ├── register/
│           │   └── route.ts      # Registration API
│           ├── verify-otp/
│           │   └── route.ts      # OTP verification API
│           └── resend-otp/
│               └── route.ts      # Resend OTP API
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── email.ts                  # Resend email service
│   └── mongodb.ts                # Database connection
├── models/
│   ├── User.ts                   # User model with roles
│   └── OTP.ts                    # OTP model with TTL
├── components/
│   ├── providers.tsx             # SessionProvider wrapper
│   └── ui/                       # ShadCN components
└── middleware.ts                 # Route protection

```

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | App Router, Server Actions |
| **TypeScript** | Type safety |
| **NextAuth v5** | Authentication framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **Resend** | Email delivery |
| **bcryptjs** | Password hashing |
| **Tailwind CSS** | Styling |
| **ShadCN UI** | Component library |
| **Framer Motion** | Animations |

## 📦 Installation

### 1. Install Dependencies

```bash
npm install next-auth@beta bcryptjs resend framer-motion
npm install -D @types/bcryptjs
```

### 2. Environment Variables

Create a `.env.local` file:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Resend Email API
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=onboarding@yourdomain.com
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Get `RESEND_API_KEY` from: https://resend.com

## 🎯 Authentication Flow

```mermaid
graph TD
    A[User visits /register] --> B[Fill registration form]
    B --> C[Submit with role selection]
    C --> D[Password hashed with bcrypt]
    D --> E[User created in DB]
    E --> F[Generate 6-digit OTP]
    F --> G[Save OTP with 5min TTL]
    G --> H[Send OTP via Resend]
    H --> I[Redirect to /verify-otp]
    I --> J{OTP valid?}
    J -->|Yes| K[Mark user as verified]
    J -->|No| L[Show error]
    K --> M[Send welcome email]
    M --> N[Redirect to /login]
    N --> O[Enter credentials]
    O --> P{Valid?}
    P -->|Yes| Q[Create JWT session]
    P -->|No| R[Show error]
    Q --> S{Check role}
    S -->|Admin| T[/admin/dashboard]
    S -->|Faculty| U[/faculty/dashboard]
    S -->|Student| V[/student/dashboard]
```

## 🔐 User Roles

### Admin
- **Created:** Manually via database
- **Access:** Full system access
- **Routes:** `/admin/*`

### Faculty
- **Created:** Self-registration
- **Access:** Class management, attendance monitoring
- **Routes:** `/faculty/*`

### Student
- **Created:** Self-registration
- **Access:** View classes, view attendance
- **Routes:** `/student/*`

## 🛡️ Middleware Protection

Routes are automatically protected based on authentication state and user role:

```typescript
/admin/*    → admin only
/faculty/*  → faculty + admin
/student/*  → student + admin
/login      → public
/register   → public
/verify-otp → public
```

## 📧 Email Templates

### OTP Verification Email
- Modern gradient header
- Large 6-digit code display
- 5-minute expiration notice
- Beautiful HTML design

### Welcome Email
- Sent after successful verification
- Confirms account activation
- Professional branding

## 🎨 UI Components

### Login Page
- Split-screen design
- Animated gradient background
- Feature highlights
- Glassmorphism card
- Icon-based input fields

### Register Page
- Full-screen layout
- Role selection cards (Student/Faculty)
- Password confirmation
- Admin creation notice
- Real-time validation

### OTP Verification Page
- 6 individual digit inputs
- Auto-focus between fields
- Paste support (Ctrl+V)
- Countdown timer (5:00)
- Resend OTP button
- Visual feedback

## 🔒 Security Best Practices

✅ Passwords hashed with bcrypt (12 rounds)  
✅ OTP auto-expires after 5 minutes  
✅ MongoDB TTL index for automatic OTP cleanup  
✅ Email verification required before login  
✅ JWT stored in HTTP-only cookies  
✅ CSRF protection enabled  
✅ Secure session management  
✅ Role-based route protection  
✅ Input validation on client and server  
✅ Error messages don't leak sensitive info  

## 📱 Responsive Design

All authentication pages are fully responsive:
- Mobile: Single column layout
- Tablet: Optimized spacing
- Desktop: Split-screen / centered layouts
- Touch-friendly input sizes
- Accessible color contrast

## 🧪 Testing the System

### 1. Register a Student Account
```
GET http://localhost:3000/register
- Enter name, email, password
- Select "Student" role
- Submit form
```

### 2. Verify Email
```
Check your email for 6-digit code
GET http://localhost:3000/verify-otp?email=test@example.com
- Paste or type OTP
- Click "Verify Email"
```

### 3. Login
```
GET http://localhost:3000/login
- Enter verified email and password
- Redirected to /student/dashboard
```

### 4. Test Role Protection
```
Try accessing /admin/dashboard as student
→ Redirected to /unauthorized
```

## 🔧 API Endpoints

### POST `/api/auth/register`
Register a new user (student or faculty)

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Check your email.",
  "requiresVerification": true
}
```

### POST `/api/auth/verify-otp`
Verify email with OTP

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully!"
}
```

### POST `/api/auth/resend-otp`
Resend verification code

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New verification code sent"
}
```

## 🎭 Database Models

### User Model
```typescript
{
  name: string;           // Full name
  email: string;          // Unique, lowercase
  password: string;       // bcrypt hashed
  role: 'admin' | 'faculty' | 'student';
  isVerified: boolean;    // Email verified
  imageUrl?: string;      // Optional avatar
  createdAt: Date;
  updatedAt: Date;
}
```

### OTP Model
```typescript
{
  email: string;          // Lowercase email
  otp: string;            // 6-digit code
  expiresAt: Date;        // 5 minutes from creation
  createdAt: Date;
}
```

## 🚀 Deployment

### Environment Setup
1. Set production `NEXTAUTH_URL`
2. Use secure `NEXTAUTH_SECRET`
3. Configure Resend with custom domain
4. Set `EMAIL_FROM` with verified domain
5. Enable MongoDB Atlas IP allowlist

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS policies set
- [ ] Database backups enabled
- [ ] Error tracking configured
- [ ] Email deliverability tested

## 📊 MongoDB Indexes

Automatically created for performance:

```javascript
// User model
email: { index: true, unique: true }

// OTP model
email: { index: true }
expiresAt: { index: true, expireAfterSeconds: 0 }
```

## 🎨 Design Inspiration

This authentication system follows design patterns from:
- **Stripe** - Clean forms, gradient accents
- **Linear** - Minimalist UI, smooth animations
- **Notion** - Glassmorphism, soft shadows

## 🐛 Troubleshooting

### Email not sending
- Check `RESEND_API_KEY` is valid
- Verify `EMAIL_FROM` domain
- Check Resend dashboard for errors

### OTP expired
- Default: 5 minutes
- User can click "Resend Code"
- Old OTPs automatically deleted

### Session not persisting
- Check `NEXTAUTH_SECRET` is set
- Verify cookies are enabled
- Check `NEXTAUTH_URL` matches domain

### Middleware redirecting unexpectedly
- Check user role in session
- Verify route protection logic
- Check public routes list

## 📚 Additional Resources

- [NextAuth.js v5 Docs](https://next-auth.js.org)
- [Resend Documentation](https://resend.com/docs)
- [ShadCN UI Components](https://ui.shadcn.com)
- [Framer Motion Docs](https://www.framer.com/motion/)

## 🎉 Features Coming Soon

- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Remember me functionality
- [ ] Login activity tracking
- [ ] Account deletion
- [ ] Email change verification

## 📄 License

This authentication system is part of the AttendAI project.

---

**Built with ❤️ for production-grade security and premium UX**
