/**
 * Student Mongoose Model
 *
 * Stores student profile data including:
 * - Personal information (name, register number, department)
 * - Face recognition data (embedding vector + image paths for training)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
    name: string;
    registerNumber: string;
    email: string;
    department: string;
    year: number;
    section: string;
    /** 128-dimensional face embedding vector from face_recognition library */
    faceEmbedding: number[];
    /** Array of image paths used for training the recognition model */
    imageDataset: string[];
    /** Clerk userId for students who have accounts */
    clerkUserId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
    {
        name: {
            type: String,
            required: [true, "Student name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        registerNumber: {
            type: String,
            required: [true, "Register number is required"],
            unique: true,
            trim: true,
            uppercase: true,
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
        year: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        section: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        faceEmbedding: {
            type: [Number],
            default: [],
            validate: {
                validator: (arr: number[]) => arr.length === 0 || arr.length === 128,
                message: "Face embedding must be a 128-dimensional vector",
            },
        },
        imageDataset: {
            type: [String],
            default: [],
        },
        clerkUserId: {
            type: String,
            sparse: true,
            unique: true,
        },
    },
    {
        timestamps: true,
        collection: "students",
    }
);

// Index for fast lookups by department and year
StudentSchema.index({ department: 1, year: 1, section: 1 });

const Student: Model<IStudent> =
    mongoose.models.Student ?? mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
