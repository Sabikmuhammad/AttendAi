/**
 * API Route: /api/faculty
 * GET  — list all faculty (admin)
 * POST — create faculty profile (automatically called after Clerk registration)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Faculty from "@/models/Faculty";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const faculty = await Faculty.find({})
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({ faculty }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/faculty]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { name, email, department, designation, employeeId } = body;

        if (!name || !email || !department || !employeeId) {
            return NextResponse.json(
                { error: "Required fields: name, email, department, employeeId" },
                { status: 400 }
            );
        }

        // Check if faculty already exists for this Clerk user
        const existing = await Faculty.findOne({ clerkUserId: userId });
        if (existing) {
            return NextResponse.json({ faculty: existing }, { status: 200 });
        }

        const faculty = await Faculty.create({
            name,
            email,
            department,
            designation: designation ?? "Assistant Professor",
            employeeId,
            clerkUserId: userId,
        });

        return NextResponse.json({ faculty }, { status: 201 });
    } catch (error: unknown) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json(
                { error: "Faculty with this email or employee ID already exists" },
                { status: 409 }
            );
        }
        console.error("[POST /api/faculty]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
