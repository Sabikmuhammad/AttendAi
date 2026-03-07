"use client";

/**
 * Faculty Dashboard — shows active classes, recent attendance stats, and quick actions.
 * Client component for real-time data fetching with React state.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ClassItem {
    _id: string;
    courseName: string;
    courseCode: string;
    classroomNumber: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    studentIds: Array<{ name: string; registerNumber: string }>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon,
    gradient,
}: {
    label: string;
    value: number | string;
    icon: string;
    gradient: string;
}) {
    return (
        <div className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} card-hover`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-400 mb-1">{label}</p>
                    <p className="text-3xl font-black text-white">{value}</p>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}

// ─── Class Row ────────────────────────────────────────────────────────────────

function ClassRow({ cls }: { cls: ClassItem }) {
    const start = new Date(cls.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const end = new Date(cls.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const date = new Date(cls.startTime).toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });

    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/20">
                    <span className="text-blue-400 font-mono font-bold text-xs">{cls.courseCode.slice(0, 2)}</span>
                </div>
                <div>
                    <p className="font-semibold text-white text-sm">{cls.courseName}</p>
                    <p className="text-xs text-slate-500">
                        Room {cls.classroomNumber} · {date} · {start}–{end}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{cls.studentIds?.length ?? 0} students</span>
                {cls.isActive ? (
                    <Badge variant="success" className="animate-pulse">
                        ● LIVE
                    </Badge>
                ) : (
                    <Badge variant="secondary">Scheduled</Badge>
                )}
                <Link href={`/faculty/live-class?classId=${cls._id}`}>
                    <Button size="sm" variant={cls.isActive ? "gradient" : "outline"} className="border-white/20 text-white hover:bg-white/10 text-xs">
                        {cls.isActive ? "Join Live" : "Start Class"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function FacultyDashboard() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/classes")
            .then((res) => res.json())
            .then((data) => {
                setClasses(data.classes ?? []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalStudents = classes.reduce((sum, c) => sum + (c.studentIds?.length ?? 0), 0);
    const activeClasses = classes.filter((c) => c.isActive).length;
    const todayClasses = classes.filter((c) => {
        const d = new Date(c.startTime);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="p-8 min-h-screen">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white mb-2">Faculty Dashboard</h1>
                <p className="text-slate-400">
                    Manage your classes and monitor attendance in real-time.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mb-8">
                <Link href="/faculty/create-class">
                    <Button variant="gradient" className="gap-2">
                        <span>+</span> Create Class
                    </Button>
                </Link>
                <Link href="/faculty/live-class">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                        🎥 Start Live Attendance
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Classes" value={classes.length} icon="📚" gradient="from-blue-600/10 to-blue-700/5" />
                <StatCard label="Live Now" value={activeClasses} icon="🔴" gradient="from-red-600/10 to-red-700/5" />
                <StatCard label="Today's Classes" value={todayClasses} icon="📅" gradient="from-violet-600/10 to-violet-700/5" />
                <StatCard label="Total Students" value={totalStudents} icon="👥" gradient="from-emerald-600/10 to-emerald-700/5" />
            </div>

            {/* Classes Table */}
            <Card className="bg-slate-900/40 border-white/10">
                <CardHeader className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">All Classes</CardTitle>
                        <Link href="/faculty/create-class">
                            <Button size="sm" variant="gradient">+ New Class</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 rounded-xl shimmer" />
                            ))}
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-slate-400 font-medium">No classes yet</p>
                            <p className="text-slate-600 text-sm mt-1 mb-6">Create your first class to get started</p>
                            <Link href="/faculty/create-class">
                                <Button variant="gradient">Create Your First Class</Button>
                            </Link>
                        </div>
                    ) : (
                        classes.map((cls) => <ClassRow key={cls._id} cls={cls} />)
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
