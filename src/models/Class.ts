/**
 * Class Mongoose Model
 *
 * Represents a scheduled class session created by faculty.
 * Links to faculty and students via ObjectId references.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IClass extends Document {
    courseName: string;
    courseCode: string;
    classroomNumber: string;
    startTime: Date;
    endTime: Date;
    /** Reference to the faculty who created this class */
    facultyId: Types.ObjectId;
    /** Array of student ObjectIds enrolled in this class */
    studentIds: Types.ObjectId[];
    /** Whether the class session is currently active */
    isActive: boolean;
    /** Timestamp when the class was actually started */
    startedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
    {
        courseName: {
            type: String,
            required: [true, "Course name is required"],
            trim: true,
            maxlength: [200, "Course name cannot exceed 200 characters"],
        },
        courseCode: {
            type: String,
            required: [true, "Course code is required"],
            trim: true,
            uppercase: true,
        },
        classroomNumber: {
            type: String,
            required: [true, "Classroom number is required"],
            trim: true,
        },
        startTime: {
            type: Date,
            required: [true, "Start time is required"],
        },
        endTime: {
            type: Date,
            required: [true, "End time is required"],
            validate: {
                validator: function (this: IClass, endTime: Date) {
                    return endTime > this.startTime;
                },
                message: "End time must be after start time",
            },
        },
        facultyId: {
            type: Schema.Types.ObjectId,
            ref: "Faculty",
            required: [true, "Faculty reference is required"],
        },
        studentIds: {
            type: [Schema.Types.ObjectId],
            ref: "Student",
            default: [],
        },
        isActive: {
            type: Boolean,
            default: false,
        },
        startedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        collection: "classes",
    }
);

// Index for finding active classes quickly
ClassSchema.index({ isActive: 1, startTime: -1 });
ClassSchema.index({ facultyId: 1, startTime: -1 });

const Class: Model<IClass> =
    mongoose.models.Class ?? mongoose.model<IClass>("Class", ClassSchema);

export default Class;
