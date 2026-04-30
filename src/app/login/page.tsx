'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';

const scanAnimation = `
@keyframes scan {
  0% { transform: translateY(-100%); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}`;

function LoginForm() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = scanAnimation;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Optional prefill from onboarding redirect: /login?institutionCode=ABCD
  useEffect(() => {
    const code = searchParams.get('institutionCode');
    if (code) setInstitutionCode(code.toUpperCase());
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        institutionCode,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      // Set access_token cookie (bridges NextAuth session with legacy access_token cookie system)
      try {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.error('Failed to set access token:', err);
      }

      // We need to fetch the session to determine the route
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === 'super_admin') router.push('/super-admin/dashboard');
      else if (role === 'institution_admin' || role === 'admin') router.push('/admin/dashboard');
      else if (role === 'faculty') router.push('/faculty/dashboard');
      else if (role === 'student') router.push('/student/dashboard');
      else router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-black">
      {/* Left Branding Panel */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-10 bg-gradient-to-br from-purple-950 via-black to-indigo-950 animate-fade-in-up">

        <div className="flex flex-col items-center justify-center text-center gap-10 max-w-md">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Automate attendance with AI
            </h2>
            <p className="mt-2 text-base sm:text-lg text-purple-400 font-medium">
              Let AI take your attendance
            </p>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Reduce manual work, eliminate errors, and track attendance in real-time.
            </p>
          </div>

          {/* Face Scan Animation */}
          <div className="relative mt-6 flex flex-col items-center gap-4">
            <div className="relative w-56 h-56 flex items-center justify-center">

              {/* Rotating Gradient Ring */}
              <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-40 animate-[spin_8s_linear_infinite] blur-sm" />

              {/* Outer Ring */}
              <div className="absolute inset-2 rounded-full border border-purple-500/30" />

              {/* Radar Sweep */}
              <div className="absolute inset-2 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-[scan_3s_linear_infinite]" />
              </div>

              {/* Center Circle */}
              <div className="relative w-32 h-32 rounded-full border border-purple-400 flex items-center justify-center bg-black/40 backdrop-blur">

                {/* Face Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-purple-400 animate-[pulse_2s_ease-in-out_infinite]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
                </svg>

                {/* Corner brackets */}
                <div className="absolute inset-0">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-purple-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-purple-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-purple-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-purple-400" />
                </div>
              </div>
            </div>

            <p className="text-xs text-purple-400 tracking-widest animate-pulse">
              SCANNING FACE...
            </p>
          </div>
        </div>

      </div>

      {/* Right Login Panel */}
      <div className="relative flex items-center justify-center px-6">

        {/* Glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-purple-600/20 blur-[120px]" />
        </div>

        <div className="w-full max-w-md">
          <Card className="p-8 sm:p-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-2xl shadow-purple-500/10">

            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome back
              </h1>
              <p className="text-gray-400 text-sm">
                Enter your credentials to continue
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/[0.06] border-white/10 focus:bg-white/[0.08] text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Institution Code */}
              <div className="space-y-1.5">
                <Label htmlFor="institutionCode" className="text-gray-300">Institution Code</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    id="institutionCode"
                    type="text"
                    placeholder="e.g. SAHYADRI"
                    value={institutionCode}
                    onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                    className="pl-10 h-12 bg-white/[0.06] border-white/10 focus:bg-white/[0.08] text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/[0.06] border-white/10 focus:bg-white/[0.08] text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <Link href="/onboarding" className="text-purple-400 hover:text-purple-300">
                  Register institution
                </Link>
                <button type="button" className="text-gray-500 hover:text-white">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:opacity-90 active:scale-95 transition"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Card>

          <p className="mt-5 text-center text-xs text-gray-500">
            Powered by <span className="text-purple-400">AttendAI</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
