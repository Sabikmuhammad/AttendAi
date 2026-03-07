/**
 * API Route: /api/classes
 * GET  — fetch all classes for the authenticated faculty
 * POST — create a new class session
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import Faculty from "@/models/Faculty";

// GET /api/classes — returns all classes for the logged-in faculty
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Find the faculty record for this Clerk user
        const faculty = await Faculty.findOne({ clerkUserId: userId });
        if (!faculty) {
            return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
        }

        const classes = await Class.find({ facultyId: faculty._id })
            .populate("studentIds", "name registerNumber department")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ classes }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/classes]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/classes — create a new class
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const faculty = await Faculty.findOne({ clerkUserId: userId });
        if (!faculty) {
            return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { courseName, courseCode, classroomNumber, startTime, endTime, studentIds } = body;

        // Validate required fields
        if (!courseName || !courseCode || !classroomNumber || !startTime || !endTime) {
            return NextResponse.json(
                { error: "Missing required fields: courseName, courseCode, classroomNumber, startTime, endTime" },
                { status: 400 }
            );
        }

        const newClass = await Class.create({
            courseName,
            courseCode,
            classroomNumber,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            facultyId: faculty._id,
            studentIds: studentIds ?? [],
            isActive: false,
        });

        return NextResponse.json({ class: newClass }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/classes]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
