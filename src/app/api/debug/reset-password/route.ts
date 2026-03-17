import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

// DEV ONLY — remove before production
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) {
    return NextResponse.json({ error: 'email and newPassword required' }, { status: 400 });
  }

  await connectDB();
  const hash = await bcrypt.hash(newPassword, 12);

  // Use raw MongoDB driver to bypass ALL Mongoose hooks and middleware
  const db = mongoose.connection.db!;
  const result = await db.collection('users').updateOne(
    { email: email.toLowerCase() },
    { $set: { passwordHash: hash, password: hash } }
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Re-fetch and verify
  const user = await db.collection('users').findOne({ email: email.toLowerCase() });
  const storedHash = (user?.passwordHash || user?.password) as string;
  const verified = await bcrypt.compare(newPassword, storedHash);

  return NextResponse.json({
    success: verified,
    email: user?.email,
    role: user?.role,
    hashMatch: verified,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  });
}
