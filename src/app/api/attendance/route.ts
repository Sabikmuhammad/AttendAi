/**
 * API Route: /api/attendance
 * POST — mark attendance for detected students.
 *         Uses upsert to avoid duplicates (compound index: classId + studentId).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import Student from "@/models/Student";

// POST /api/attendance — mark one or more students as present
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();
        const { classId, detectedStudentIds, confidence } = body;

        if (!classId || !Array.isArray(detectedStudentIds)) {
            return NextResponse.json(
                { error: "classId and detectedStudentIds[] are required" },
                { status: 400 }
            );
        }

        // Fetch the active class and its enrolled student list
        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        if (!classDoc.isActive) {
            return NextResponse.json({ error: "Class is not currently active" }, { status: 400 });
        }

        // Filter: only mark detected students who are enrolled in this class
        const enrolledStudentIds = classDoc.studentIds.map((id) => id.toString());
        const validDetectedIds = detectedStudentIds.filter((id: string) =>
            enrolledStudentIds.includes(id)
        );

        if (validDetectedIds.length === 0) {
            return NextResponse.json(
                { message: "No enrolled students detected", markedCount: 0 },
                { status: 200 }
            );
        }

        const now = new Date();
        const attendanceRecords = [];

        for (const studentId of validDetectedIds) {
            // Upsert: insert if not exists, do nothing if record already exists
            const result = await Attendance.findOneAndUpdate(
                { classId, studentId },
                {
                    $setOnInsert: {
                        classId,
                        studentId,
                        detectedTime: now,
                        status: "present",
                        confidence: confidence ?? null,
                    },
                },
                { upsert: true, new: true }
            );
            attendanceRecords.push(result);
        }

        return NextResponse.json(
            {
                message: `Marked ${validDetectedIds.length} student(s) present`,
                markedCount: validDetectedIds.length,
                records: attendanceRecords,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[POST /api/attendance]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/attendance?classId=xxx — fetch attendance for a specific class
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const classId = searchParams.get("classId");
        const studentId = searchParams.get("studentId");

        if (classId) {
            // Faculty: fetch all attendance for a class
            const records = await Attendance.find({ classId })
                .populate("studentId", "name registerNumber department")
                .sort({ detectedTime: -1 })
                .lean();
            return NextResponse.json({ records }, { status: 200 });
        }

        if (studentId) {
            // Student: fetch own attendance history
            const records = await Attendance.find({ studentId })
                .populate("classId", "courseName courseCode classroomNumber startTime")
                .sort({ detectedTime: -1 })
                .lean();
            return NextResponse.json({ records }, { status: 200 });
        }

        return NextResponse.json(
            { error: "Provide classId or studentId query parameter" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[GET /api/attendance]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
