import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role:
        | 'super_admin'
        | 'institution_admin'
        | 'department_admin'
        | 'admin'
        | 'faculty'
        | 'student';
      institutionId: string;
      departmentIds: string[];
      isVerified: boolean;
    } & DefaultSession['user'];
  }
  interface User {
    role:
      | 'super_admin'
      | 'institution_admin'
      | 'department_admin'
      | 'admin'
      | 'faculty'
      | 'student';
    institutionId: string;
    departmentIds?: string[];
    isVerified: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        institutionCode: { label: 'Institution Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.institutionCode) {
          throw new Error('Please provide email, password, and institution code');
        }

        try {
          console.log('\n--- NEXTAUTH AUTHORIZE ATTEMPT ---');
          console.log('Validating credentials for:', credentials.email);
          await connectDB();

          const mongoose = (await import('mongoose')).default;
          const Institution = mongoose.models.Institution || (await import('@/models/Institution')).default;

          const institutionCode = String(credentials.institutionCode).trim().toUpperCase();
          const institution = await Institution.findOne({ code: institutionCode }).lean() as { _id: string; status?: string } | null;

          if (!institution) {
            console.error('Login failed: Invalid institution code:', institutionCode);
            throw new Error('Invalid institution code');
          }

          if (institution.status === 'suspended') {
            console.error('Login failed: Suspended institution:', institutionCode);
            throw new Error('Institution is suspended. Contact platform support.');
          }

          const userEmail = (credentials.email as string).toLowerCase().trim();
          console.log('Looking up user:', userEmail, 'in institution:', String(institution._id));
          
          const user = await User.findOne({ 
            email: userEmail,
            institutionId: String(institution._id)
          });

          if (!user) {
            console.error('Login failed: User record not found in MongoDB!');
            throw new Error('Invalid credentials');
          }

          console.log('User found! isVerified:', user.isVerified);

          if (!user.isVerified) {
            console.error('Login failed: Unverified user');
            throw new Error('Please verify your email first');
          }

          console.log('Verifying password with bcrypt...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash || user.password || ''
          );

          if (!isPasswordValid) {
            console.error('Login failed: Password mismatch');
            throw new Error('Invalid password');
          }

          console.log('Login completely successful! Generating session...');
          const departmentIds = Array.isArray(user.departmentIds)
            ? user.departmentIds.map((id) => String(id))
            : [];
          const normalizedRole = user.role as
            | 'super_admin'
            | 'institution_admin'
            | 'department_admin'
            | 'admin'
            | 'faculty'
            | 'student';

          return {
            id: user._id.toString(),
            name: String(user.name),
            email: String(user.email),
            role: normalizedRole,
            institutionId:
              String(
                user.institutionId ||
                  process.env.DEFAULT_INSTITUTION_ID ||
                  'default-institution'
              ),
            departmentIds,
            isVerified: Boolean(user.isVerified),
            image: user.imageUrl ? String(user.imageUrl) : undefined,
          };
        } catch (error) {
          console.error('NEXTAUTH AUTHORIZE ERROR:', error);
          throw new Error((error as Error).message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.institutionId = String(user.institutionId);
        token.departmentIds = Array.isArray(user.departmentIds)
          ? user.departmentIds.map((id) => String(id))
          : [];
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as
          | 'super_admin'
          | 'institution_admin'
          | 'department_admin'
          | 'admin'
          | 'faculty'
          | 'student';
        session.user.institutionId =
          (token.institutionId as string) ||
          process.env.DEFAULT_INSTITUTION_ID ||
          'default-institution';
        session.user.departmentIds = (token.departmentIds as string[]) || [];
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
