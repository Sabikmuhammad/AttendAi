/**
 * Attendance Mongoose Model
 *
 * Records each student's attendance for a class session.
 * Includes a compound unique index on (classId + studentId)
 * to prevent duplicate attendance entries.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "late";

export interface IAttendance extends Document {
    classId: Types.ObjectId;
    studentId: Types.ObjectId;
    /** Timestamp when the face was detected / attendance was marked */
    detectedTime: Date;
    status: AttendanceStatus;
    /** Confidence score from the face recognition model (0–1) */
    confidence?: number;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
    {
        classId: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            required: [true, "Class reference is required"],
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"],
        },
        detectedTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: {
                values: ["present", "absent", "late"],
                message: "Status must be 'present', 'absent', or 'late'",
            },
            default: "present",
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
        },
    },
    {
        timestamps: true,
        collection: "attendance",
    }
);

/**
 * Compound unique index prevents duplicate attendance records.
 * Each student can only be marked once per class session.
 */
AttendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true });

// Index for fetching all attendance for a class
AttendanceSchema.index({ classId: 1, detectedTime: -1 });

// Index for fetching a student's attendance history
AttendanceSchema.index({ studentId: 1, detectedTime: -1 });

const Attendance: Model<IAttendance> =
    mongoose.models.Attendance ??
    mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
