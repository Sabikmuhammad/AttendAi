import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import User from '@/models/User';
import OTP from '@/models/OTP';
import Department from '@/models/Department';
import { activateTrial } from '@/lib/trial';
import { sendOTPEmail } from '@/lib/email';
import { withInstitutionScope } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      // Step 1 — Institution Info
      institutionName,
      institutionType,
      country,
      city,
      website,
      // Step 2 — Academic Structure
      numDepartments,
      numPrograms,
      numSections,
      departmentNames,
      // Step 3 — Institution Size
      totalStudents,
      totalFaculty,
      numClassrooms,
      numCampuses,
      // Step 4 — Admin Contact
      adminName,
      adminRole,
      adminPhone,
      adminEmail,
      adminPassword,
      itAdminContact,
    } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!institutionName || !institutionType || !country || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Institution name, type, country, admin name, email and password are required.' },
        { status: 400 }
      );
    }

    if (adminPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // ── Generate unique institution code ────────────────────────────────────
    const baseCode = institutionName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4)
      .padEnd(4, 'X');

    let code = baseCode;
    let attempt = 0;
    while (await Institution.exists({ code })) {
      attempt++;
      code = baseCode.slice(0, 3) + attempt;
    }

    // Take only the first word of the institution name as the subdomain
    const firstWord = institutionName.trim().split(/\s+/)[0];
    const subdomain = firstWord
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    // Ensure uniqueness — append suffix only if slug already taken
    let uniqueSubdomain = subdomain;
    let suffix = 1;
    while (await Institution.exists({ subdomain: uniqueSubdomain })) {
      uniqueSubdomain = `${subdomain}${suffix++}`;
    }

    // ── Check admin email uniqueness (global) ───────────────────────────────
    // We check after institution creation since institutionId is needed
    // ── Create Institution ──────────────────────────────────────────────────
    const institution = await Institution.create({
      name: institutionName,
      code,
      subdomain: uniqueSubdomain,
      domain: `attendai.com`,
      address: city ? `${city}, ${country}` : country,
      contactEmail: adminEmail,
      status: 'trial',
      plan: 'trial',
      metadata: {
        type: institutionType,
        country,
        city: city || '',
        website: website || '',
        numDepartments: numDepartments || 0,
        numPrograms: numPrograms || 0,
        numSections: numSections || 0,
        departmentNames: departmentNames || [],
        totalStudents: totalStudents || 0,
        totalFaculty: totalFaculty || 0,
        numClassrooms: numClassrooms || 0,
        numCampuses: numCampuses || 1,
        adminRole: adminRole || 'Admin',
        adminPhone: adminPhone || '',
        itAdminContact: itAdminContact || '',
      },
    });

    const institutionId = String(institution._id);

    // ── Create Departments ──────────────────────────────────────────────────
    if (departmentNames && Array.isArray(departmentNames) && departmentNames.length > 0) {
      const uniqueDepartments = Array.from(new Set(departmentNames.filter((name: unknown) => typeof name === 'string' && name.trim() !== '')));
      if (uniqueDepartments.length > 0) {
        const departmentDocs = uniqueDepartments.map(name => ({
          name: name.trim(),
          institutionId,
        }));
        try {
          await Department.insertMany(departmentDocs, { ordered: false });
        } catch (err) {
          console.warn('Non-fatal error creating departments:', err);
        }
      }
    }

    // ── Activate 14-day trial ───────────────────────────────────────────────
    await activateTrial(institutionId);

    // ── Create admin user ───────────────────────────────────────────────────
    const existingUser = await User.findOne({ email: adminEmail.toLowerCase(), institutionId });
    if (existingUser) {
      // Roll back institution creation
      await Institution.findByIdAndDelete(institutionId);
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      password: passwordHash,
      role: 'admin',
      institutionId,
      isVerified: false,
    });

    // ── Create OTP + send verification email ───────────────────────────────
    await OTP.deleteMany(withInstitutionScope({ email: adminEmail.toLowerCase() }, institutionId));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email: adminEmail.toLowerCase(), institutionId, otp });

    const emailResult = await sendOTPEmail({ email: adminEmail, otp, name: adminName });
    if (!emailResult.success) {
      // Roll back partial onboarding so the institution isn't stuck half-created.
      await User.findByIdAndDelete(adminUser._id);
      await Institution.findByIdAndDelete(institutionId);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Institution registered. Please verify your email to activate your admin account.',
      requiresVerification: true,
      institution: {
        id: institutionId,
        name: institution.name,
        code: institution.code,
        subdomain: institution.subdomain, // kept for internal bookkeeping; routing is code-based
      },
      user: {
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });

    return response;
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { success: false, error: 'Onboarding failed. Please try again.' },
      { status: 500 }
    );
  }
}
