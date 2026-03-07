/**
 * API Route: /api/classes/[id]
 * GET   — fetch a single class with populated students
 * PATCH — update class (e.g., toggle isActive, add students)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Class from "@/models/Class";
import Faculty from "@/models/Faculty";

interface RouteParams {
    params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const classDoc = await Class.findById(params.id)
            .populate("studentIds", "name registerNumber department year section")
            .populate("facultyId", "name department")
            .lean();

        if (!classDoc) {
            return NextResponse.json({ error: "Class not found" }, { status: 404 });
        }

        return NextResponse.json({ class: classDoc }, { status: 200 });
    } catch (error) {
        console.error("[GET /api/classes/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

        // Find class and verify ownership
        const existingClass = await Class.findOne({
            _id: params.id,
            facultyId: faculty._id,
        });

        if (!existingClass) {
            return NextResponse.json({ error: "Class not found or unauthorized" }, { status: 404 });
        }

        // Handle starting the class
        if (body.isActive === true && !existingClass.isActive) {
            body.startedAt = new Date();
        }

        const updatedClass = await Class.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ class: updatedClass }, { status: 200 });
    } catch (error) {
        console.error("[PATCH /api/classes/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
