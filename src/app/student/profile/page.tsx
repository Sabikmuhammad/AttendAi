'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  role: string;
  imageUrl?: string;
  isVerified: boolean;
  createdAt: string;
  studentId?: string;
  department?: string;
  section?: string;
}

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success) {
        // Check if user is on the correct profile page for their role
        const userRole = data.profile.role;
        if (userRole !== 'student') {
          // Redirect to correct profile page based on role
          router.push(`/${userRole}/profile`);
          return;
        }
        setProfile(data.profile);
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'faculty':
        return 'info';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/student/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">View your student information</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.imageUrl} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-2">{profile.name}</CardTitle>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant={getRoleBadgeVariant(profile.role) as any}>
                    {profile.role.toUpperCase()}
                  </Badge>
                  {profile.isVerified && (
                    <Badge variant="success">Verified</Badge>
                  )}
                  {profile.section && profile.section !== 'Not Assigned' && (
                    <Badge variant="outline">Section {profile.section}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Information Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-base font-medium mt-1">{profile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <p className="text-base font-medium mt-1">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-base font-medium mt-1 capitalize">{profile.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Your academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Student ID</label>
              <p className="text-base font-medium mt-1 font-mono">
                {profile.studentId || 'Not Assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Department</label>
              <p className="text-base font-medium mt-1">
                {profile.department || 'Not Assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Section</label>
              <p className="text-base font-medium mt-1">
                {profile.section && profile.section !== 'Not Assigned' 
                  ? profile.section 
                  : 'Not Assigned'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account verification and enrollment details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
              <div className="mt-1">
                {profile.isVerified ? (
                  <Badge variant="success">Verified Account</Badge>
                ) : (
                  <Badge variant="warning">Pending Verification</Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Enrolled Since</label>
              <p className="text-base font-medium mt-1">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4 flex-wrap">
        <Button onClick={() => router.push('/student/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push('/student/settings')}>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
