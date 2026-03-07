"use client";

/**
 * Student Dashboard — shows attendance history, percentage per course, and recent detections.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
    _id: string;
    classId: {
        _id: string;
        courseName: string;
        courseCode: string;
        classroomNumber: string;
        startTime: string;
    };
    detectedTime: string;
    status: string;
    confidence?: number;
}

interface CourseStats {
    courseName: string;
    courseCode: string;
    total: number;
    present: number;
    percentage: number;
}

function AttendanceRow({ record }: { record: AttendanceRecord }) {
    const cls = record.classId;
    const date = new Date(record.detectedTime).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
    const time = new Date(record.detectedTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-xs">{cls?.courseCode?.slice(0, 2) ?? "NA"}</span>
                </div>
                <div>
                    <p className="font-semibold text-white text-sm">{cls?.courseName ?? "Unknown Course"}</p>
                    <p className="text-xs text-slate-500">Room {cls?.classroomNumber} · {date} at {time}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {record.confidence != null && (
                    <span className="text-xs text-slate-500 font-mono">
                        {Math.round(record.confidence * 100)}% match
                    </span>
                )}
                <Badge variant={record.status === "present" ? "success" : "destructive"}>
                    {record.status}
                </Badge>
            </div>
        </div>
    );
}

function CourseCard({ stats }: { stats: CourseStats }) {
    const color =
        stats.percentage >= 75
            ? "from-emerald-500 to-emerald-600"
            : stats.percentage >= 60
                ? "from-amber-500 to-amber-600"
                : "from-red-500 to-red-600";

    const textColor =
        stats.percentage >= 75
            ? "text-emerald-400"
            : stats.percentage >= 60
                ? "text-amber-400"
                : "text-red-400";

    return (
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] card-hover">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="font-semibold text-white text-sm">{stats.courseName}</p>
                    <p className="text-xs text-slate-500 uppercase font-mono">{stats.courseCode}</p>
                </div>
                <span className={`text-2xl font-black ${textColor}`}>
                    {stats.percentage}%
                </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                    style={{ width: `${stats.percentage}%` }}
                />
            </div>
            <p className="text-xs text-slate-500 mt-2">
                {stats.present} of {stats.total} classes attended
            </p>
        </div>
    );
}

export default function StudentDashboard() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In production, studentId would come from Clerk metadata
        // For now, fetch from API which resolves via Clerk session
        fetch("/api/attendance?studentId=me")
            .then((r) => r.json())
            .then((d) => setRecords(d.records ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Compute per-course stats
    const courseMap = new Map<string, CourseStats>();
    records.forEach((r) => {
        const cls = r.classId;
        if (!cls) return;
        const key = cls.courseCode ?? cls._id;
        if (!courseMap.has(key)) {
            courseMap.set(key, {
                courseName: cls.courseName,
                courseCode: cls.courseCode,
                total: 0,
                present: 0,
                percentage: 0,
            });
        }
        const stats = courseMap.get(key)!;
        stats.total++;
        if (r.status === "present") stats.present++;
        stats.percentage = Math.round((stats.present / stats.total) * 100);
    });

    const courseStats = Array.from(courseMap.values());
    const overallPercentage =
        records.length > 0
            ? Math.round((records.filter((r) => r.status === "present").length / records.length) * 100)
            : 0;

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">My Attendance</h1>
                    <p className="text-slate-400">Track your attendance across all courses.</p>
                </div>

                {/* Overall stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-blue-700/5">
                        <p className="text-sm text-slate-400 mb-1">Overall Attendance</p>
                        <p className="text-4xl font-black gradient-text">{overallPercentage}%</p>
                    </div>
                    <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-600/10 to-emerald-700/5">
                        <p className="text-sm text-slate-400 mb-1">Classes Attended</p>
                        <p className="text-4xl font-black text-white">{records.filter((r) => r.status === "present").length}</p>
                    </div>
                    <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-600/10 to-violet-700/5">
                        <p className="text-sm text-slate-400 mb-1">Total Classes</p>
                        <p className="text-4xl font-black text-white">{records.length}</p>
                    </div>
                </div>

                {/* Course-wise breakdown */}
                {courseStats.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4">Course Breakdown</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courseStats.map((s) => (
                                <CourseCard key={s.courseCode} stats={s} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance history */}
                <Card className="bg-slate-900/40 border-white/10">
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="text-white text-base">Attendance History</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-16 rounded-xl shimmer" />
                                ))}
                            </div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📋</div>
                                <p className="text-slate-400 font-medium">No attendance records yet</p>
                                <p className="text-slate-600 text-sm mt-1">Your attendance will appear here after classes are held.</p>
                            </div>
                        ) : (
                            records.map((r) => <AttendanceRow key={r._id} record={r} />)
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
