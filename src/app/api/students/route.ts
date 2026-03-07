/**
 * API Route: /api/students
 * GET  — list all students (admin/faculty)
 * POST — create a new student record (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const year = searchParams.get("year");
        const search = searchParams.get("search");

        const query: Record<string, unknown> = {};
        if (department) query.department = department;
        if (year) query.year = parseInt(year);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { registerNumber: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const students = await Student.find(query)
            .select("-faceEmbedding -imageDataset") // exclude heavy fields
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({ students }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/students]", error);
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
        const { name, registerNumber, email, department, year, section } = body;

        if (!name || !registerNumber || !email || !department || !year || !section) {
            return NextResponse.json(
                { error: "All fields are required: name, registerNumber, email, department, year, section" },
                { status: 400 }
            );
        }

        const student = await Student.create({
            name,
            registerNumber,
            email,
            department,
            year,
            section,
            faceEmbedding: [],
            imageDataset: [],
        });

        return NextResponse.json({ student }, { status: 201 });
    } catch (error: unknown) {
        if ((error as { code?: number }).code === 11000) {
            return NextResponse.json(
                { error: "Student with this register number or email already exists" },
                { status: 409 }
            );
        }
        console.error("[POST /api/students]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
