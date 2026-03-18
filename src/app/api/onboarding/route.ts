import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Institution from '@/models/Institution';
import User from '@/models/User';
import OTP from '@/models/OTP';
import Department from '@/models/Department';
import { activateTrial } from '@/lib/trial';
import { sendInstitutionWelcomeEmail } from '@/lib/email';
import { withInstitutionScope } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  let createdInstitutionId: string | null = null;
  let createdAdminUserId: string | null = null;

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

    const normalizedAdminEmail = String(adminEmail || '').toLowerCase().trim();

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

    // Guard against duplicate admin emails early to avoid partial onboarding records.
    const existingGlobalUser = await User.findOne({ email: normalizedAdminEmail }).lean();
    if (existingGlobalUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this admin email already exists. Please use a different email.' },
        { status: 409 }
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
      contactEmail: normalizedAdminEmail,
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
    createdInstitutionId = institutionId;

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
    const existingUser = await User.findOne({ email: normalizedAdminEmail, institutionId });
    if (existingUser) {
      // Roll back institution creation
      await Institution.findByIdAndDelete(institutionId);
      createdInstitutionId = null;
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminUser = await User.create({
      name: adminName,
      email: normalizedAdminEmail,
      passwordHash,
      password: passwordHash,
      role: 'admin',
      institutionId,
      isVerified: false,
    });
    createdAdminUserId = String(adminUser._id);

    // ── Create OTP + send verification email ───────────────────────────────
    await OTP.deleteMany(withInstitutionScope({ email: normalizedAdminEmail }, institutionId));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email: normalizedAdminEmail, institutionId, otp });

    const origin = req.nextUrl.origin;
    const registerUrl = `${origin}/register?institutionCode=${institution.code}`;
    const loginUrl = `${origin}/login`;

    const emailResult = await sendInstitutionWelcomeEmail({ 
      email: adminEmail, 
      otp, 
      name: adminName,
      institutionName: institution.name,
      registerUrl,
      loginUrl
    });

    if (!emailResult.success) {
      // Roll back partial onboarding so the institution isn't stuck half-created.
      await User.findByIdAndDelete(adminUser._id);
      await Institution.findByIdAndDelete(institutionId);
      createdAdminUserId = null;
      createdInstitutionId = null;
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

    // Best-effort rollback if onboarding failed after institution/admin creation.
    if (createdAdminUserId) {
      await User.findByIdAndDelete(createdAdminUserId);
    }
    if (createdInstitutionId) {
      await Institution.findByIdAndDelete(createdInstitutionId);
    }

    const mongoError = error as { code?: number; keyPattern?: Record<string, 1>; keyValue?: Record<string, string> };
    if (mongoError?.code === 11000) {
      const duplicateField = Object.keys(mongoError.keyPattern || {})[0] || 'field';
      const duplicateValue = mongoError.keyValue?.[duplicateField];
      return NextResponse.json(
        {
          success: false,
          error: duplicateValue
            ? `Duplicate value for ${duplicateField}: ${duplicateValue}`
            : `Duplicate value detected for ${duplicateField}.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Onboarding failed. Please try again.' },
      { status: 500 }
    );
  }
}
