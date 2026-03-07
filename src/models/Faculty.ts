/**
 * Faculty Mongoose Model
 *
 * Stores faculty profile data linked to their Clerk userId.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaculty extends Document {
    name: string;
    email: string;
    department: string;
    designation: string;
    employeeId: string;
    /** Clerk userId — links auth identity to this record */
    clerkUserId: string;
    createdAt: Date;
    updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
    {
        name: {
            type: String,
            required: [true, "Faculty name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
        },
        designation: {
            type: String,
            default: "Assistant Professor",
            trim: true,
        },
        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
        collection: "faculty",
    }
);

FacultySchema.index({ department: 1 });

const Faculty: Model<IFaculty> =
    mongoose.models.Faculty ?? mongoose.model<IFaculty>("Faculty", FacultySchema);

export default Faculty;
