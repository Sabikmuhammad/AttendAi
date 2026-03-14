'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Mail, Lock, User, Shield, GraduationCap, Users, Hash, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institutionCode: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'faculty',
    studentId: '',
    facultyId: '',
    department: '',
    section: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'student' && !formData.studentId) {
      setError('Student ID is required');
      return;
    }

    if (formData.role === 'student' && !formData.section) {
      setError('Section is required for students');
      return;
    }

    if (formData.role === 'student' && !formData.semester) {
      setError('Semester is required for students');
      return;
    }

    if (formData.role === 'faculty' && !formData.facultyId) {
      setError('Faculty ID is required');
      return;
    }

    if (!formData.department) {
      setError('Department is required');
      return;
    }

    if (!formData.institutionCode) {
      setError('Institution code is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          institutionCode: formData.institutionCode,
          studentId: formData.role === 'student' ? formData.studentId : undefined,
          facultyId: formData.role === 'faculty' ? formData.facultyId : undefined,
          department: formData.department,
          section: formData.role === 'student' ? formData.section : undefined,
          semester: formData.role === 'student' ? formData.semester : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to OTP verification page
      router.push(
        `/verify-otp?email=${encodeURIComponent(formData.email)}&institutionCode=${encodeURIComponent(formData.institutionCode)}`
      );
    } catch (err) {
      setError((err as Error).message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-2"
          >
            Join AttendAI
          </motion.h1>
          <p className="text-gray-600">Create your account and get started</p>
        </div>

        <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Institution Code */}
            <div className="space-y-2">
              <Label htmlFor="institutionCode" className="text-gray-700 font-medium">
                Institution Code
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="institutionCode"
                  type="text"
                  placeholder="e.g., ABCU"
                  value={formData.institutionCode}
                  onChange={(e) =>
                    setFormData({ ...formData, institutionCode: e.target.value.toUpperCase() })
                  }
                  className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Select Your Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'student'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <GraduationCap
                    className={`w-8 h-8 mx-auto mb-2 ${
                      formData.role === 'student' ? 'text-violet-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="font-semibold text-gray-900">Student</div>
                  <div className="text-xs text-gray-500 mt-1">Attend classes</div>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, role: 'faculty' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'faculty'
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <Users
                    className={`w-8 h-8 mx-auto mb-2 ${
                      formData.role === 'faculty' ? 'text-violet-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="font-semibold text-gray-900">Faculty</div>
                  <div className="text-xs text-gray-500 mt-1">Manage classes</div>
                </motion.button>
              </div>
            </div>

            {/* Student ID / Faculty ID based on role */}
            {formData.role === 'student' ? (
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-gray-700 font-medium">
                  Student ID *
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="e.g., STU2024001"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="facultyId" className="text-gray-700 font-medium">
                  Faculty ID *
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="facultyId"
                    type="text"
                    placeholder="e.g., FAC2024001"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700 font-medium">
                Department *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="department"
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Section (only for students) */}
            {formData.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-gray-700 font-medium">
                    Section *
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="section"
                      type="text"
                      placeholder="e.g., A, B, C"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-gray-700 font-medium">
                    Semester *
                  </Label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-600 hover:text-violet-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Shield className="inline w-4 h-4 mr-1" />
          Admin accounts are created manually for security purposes
        </p>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
