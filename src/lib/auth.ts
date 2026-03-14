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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        try {
          await connectDB();

          const user = await User.findOne({ 
            email: (credentials.email as string).toLowerCase() 
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your email first');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash || user.password || ''
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // NextAuth JWT encoding uses structured cloning under the hood,
          // so values must be plain serializable primitives/arrays.
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
