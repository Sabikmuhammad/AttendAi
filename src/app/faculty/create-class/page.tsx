"use client";

/**
 * Create Class Page — faculty form for creating a new class session.
 * Includes student multi-select with search from the database.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Student {
    _id: string;
    name: string;
    registerNumber: string;
    department: string;
    year: number;
    section: string;
}

interface FormData {
    courseName: string;
    courseCode: string;
    classroomNumber: string;
    startTime: string;
    endTime: string;
}

export default function CreateClassPage() {
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        courseName: "",
        courseCode: "",
        classroomNumber: "",
        startTime: "",
        endTime: "",
    });
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Fetch students from API
    useEffect(() => {
        fetch("/api/students")
            .then((res) => res.json())
            .then((data) => setAllStudents(data.students ?? []))
            .catch(console.error);
    }, []);

    const filteredStudents = allStudents.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.registerNumber.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        );
    });

    const toggleStudent = (id: string) => {
        setSelectedStudents((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedStudents.size === filteredStudents.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(filteredStudents.map((s) => s._id)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    studentIds: Array.from(selectedStudents),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Failed to create class");
                return;
            }

            setSuccess(true);
            setTimeout(() => router.push("/faculty/dashboard"), 1500);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Create Class</h1>
                    <p className="text-slate-400">Set up a new class session and add enrolled students.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ── Class Details ── */}
                        <Card className="bg-slate-900/40 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white text-base">Class Details</CardTitle>
                                <CardDescription>Enter information about the class session.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-slate-300 mb-2 block" htmlFor="courseName">
                                        Course Name *
                                    </Label>
                                    <Input
                                        id="courseName"
                                        placeholder="e.g. Data Structures and Algorithms"
                                        value={form.courseName}
                                        onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                                        required
                                        className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300 mb-2 block" htmlFor="courseCode">
                                        Course Code *
                                    </Label>
                                    <Input
                                        id="courseCode"
                                        placeholder="e.g. CS301"
                                        value={form.courseCode}
                                        onChange={(e) => setForm({ ...form, courseCode: e.target.value.toUpperCase() })}
                                        required
                                        className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-300 mb-2 block" htmlFor="classroom">
                                        Classroom Number *
                                    </Label>
                                    <Input
                                        id="classroom"
                                        placeholder="e.g. B-204"
                                        value={form.classroomNumber}
                                        onChange={(e) => setForm({ ...form, classroomNumber: e.target.value })}
                                        required
                                        className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-300 mb-2 block" htmlFor="startTime">
                                            Start Time *
                                        </Label>
                                        <Input
                                            id="startTime"
                                            type="datetime-local"
                                            value={form.startTime}
                                            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                            required
                                            className="bg-slate-800/50 border-white/10 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block" htmlFor="endTime">
                                            End Time *
                                        </Label>
                                        <Input
                                            id="endTime"
                                            type="datetime-local"
                                            value={form.endTime}
                                            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                            required
                                            className="bg-slate-800/50 border-white/10 text-white"
                                        />
                                    </div>
                                </div>

                                {/* Error / Success */}
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                        ✅ Class created successfully! Redirecting…
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="gradient"
                                    className="w-full mt-2"
                                    disabled={submitting || success}
                                >
                                    {submitting ? "Creating Class…" : `Create Class with ${selectedStudents.size} Students`}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* ── Student Selection ── */}
                        <Card className="bg-slate-900/40 border-white/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-base">Select Students</CardTitle>
                                        <CardDescription>
                                            {selectedStudents.size} of {allStudents.length} selected
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-400 hover:text-blue-300"
                                        onClick={handleSelectAll}
                                    >
                                        {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder="Search by name, register no., or department…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mb-4 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                />

                                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                    {filteredStudents.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-slate-500 text-sm">
                                                {allStudents.length === 0 ? "No students in database yet." : "No students match your search."}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredStudents.map((student) => {
                                            const isSelected = selectedStudents.has(student._id);
                                            return (
                                                <button
                                                    key={student._id}
                                                    type="button"
                                                    onClick={() => toggleStudent(student._id)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${isSelected
                                                            ? "border-blue-500/40 bg-blue-500/10"
                                                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected
                                                                    ? "border-blue-500 bg-blue-500"
                                                                    : "border-slate-600 group-hover:border-slate-400"
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{student.name}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {student.registerNumber} · {student.department} Y{student.year}{student.section}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Badge variant="info" className="text-xs">Selected</Badge>}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    );
}
