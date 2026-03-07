"use client";

/**
 * Admin Dashboard — manage students, faculty, and view system analytics.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    email: string;
}

interface NewStudentForm {
    name: string;
    registerNumber: string;
    email: string;
    department: string;
    year: string;
    section: string;
}

type ActiveTab = "students" | "faculty" | "analytics";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("students");
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState<NewStudentForm>({
        name: "", registerNumber: "", email: "", department: "", year: "1", section: "A",
    });
    const [addingStudent, setAddingStudent] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetch("/api/students")
            .then((r) => r.json())
            .then((d) => setStudents(d.students ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredStudents = students.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
            s.name.toLowerCase().includes(q) ||
            s.registerNumber.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        );
    });

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setAddingStudent(true);

        try {
            const res = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newStudent, year: parseInt(newStudent.year) }),
            });

            const data = await res.json();
            if (!res.ok) {
                setFormError(data.error ?? "Failed to add student");
                return;
            }

            setStudents((prev) => [...prev, data.student]);
            setShowAddForm(false);
            setNewStudent({ name: "", registerNumber: "", email: "", department: "", year: "1", section: "A" });
        } catch {
            setFormError("Network error. Please try again.");
        } finally {
            setAddingStudent(false);
        }
    };

    const departments = [...new Set(students.map((s) => s.department))];

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Manage students, faculty, and view system analytics.</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Students", value: students.length, icon: "🎓", gradient: "from-blue-600/10 to-blue-700/5" },
                        { label: "Departments", value: departments.length, icon: "🏛️", gradient: "from-violet-600/10 to-violet-700/5" },
                        { label: "System Status", value: "Online", icon: "✅", gradient: "from-emerald-600/10 to-emerald-700/5" },
                    ].map((stat) => (
                        <div key={stat.label} className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${stat.gradient}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-white">{stat.value}</p>
                                </div>
                                <span className="text-3xl">{stat.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-fit">
                    {(["students", "faculty", "analytics"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Students Tab ── */}
                {activeTab === "students" && (
                    <Card className="bg-slate-900/40 border-white/10">
                        <CardHeader className="border-b border-white/10">
                            <div className="flex items-center justify-between gap-4">
                                <CardTitle className="text-white text-base">Student Management</CardTitle>
                                <div className="flex items-center gap-3">
                                    <Input
                                        placeholder="Search students…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-56 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                    />
                                    <Button
                                        variant="gradient"
                                        size="sm"
                                        onClick={() => setShowAddForm(!showAddForm)}
                                    >
                                        + Add Student
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {/* Add student form */}
                            {showAddForm && (
                                <form
                                    onSubmit={handleAddStudent}
                                    className="mb-6 p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4"
                                >
                                    <h3 className="font-semibold text-white text-sm mb-3">Add New Student</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-400 text-xs mb-1 block">Full Name *</Label>
                                            <Input
                                                placeholder="e.g. Priya Sharma"
                                                value={newStudent.name}
                                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                                required
                                                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs mb-1 block">Register Number *</Label>
                                            <Input
                                                placeholder="e.g. 21CSR001"
                                                value={newStudent.registerNumber}
                                                onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                                                required
                                                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs mb-1 block">Email *</Label>
                                            <Input
                                                type="email"
                                                placeholder="student@college.edu"
                                                value={newStudent.email}
                                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                                required
                                                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs mb-1 block">Department *</Label>
                                            <Input
                                                placeholder="e.g. Computer Science"
                                                value={newStudent.department}
                                                onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                                                required
                                                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs mb-1 block">Year</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={newStudent.year}
                                                onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                                                className="bg-slate-800/50 border-white/10 text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-400 text-xs mb-1 block">Section</Label>
                                            <Input
                                                placeholder="A"
                                                value={newStudent.section}
                                                onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                                                className="bg-slate-800/50 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                    {formError && (
                                        <p className="text-red-400 text-sm">{formError}</p>
                                    )}
                                    <div className="flex gap-3">
                                        <Button type="submit" variant="gradient" size="sm" disabled={addingStudent}>
                                            {addingStudent ? "Adding…" : "Add Student"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAddForm(false)}
                                            className="text-slate-400"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Students table */}
                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl shimmer" />)}
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-slate-400">No students found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm attendance-table">
                                        <thead>
                                            <tr>
                                                <th className="text-left p-3 rounded-l-xl">Name</th>
                                                <th className="text-left p-3">Register No.</th>
                                                <th className="text-left p-3">Department</th>
                                                <th className="text-left p-3">Year / Sec</th>
                                                <th className="text-left p-3 rounded-r-xl">Face Data</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.05]">
                                            {filteredStudents.map((student) => (
                                                <tr key={student._id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-3 font-medium text-white">{student.name}</td>
                                                    <td className="p-3 text-slate-400 font-mono">{student.registerNumber}</td>
                                                    <td className="p-3 text-slate-400">{student.department}</td>
                                                    <td className="p-3 text-slate-400">Y{student.year}{student.section}</td>
                                                    <td className="p-3">
                                                        <Badge variant="warning" className="text-xs">No face data</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Faculty Tab ── */}
                {activeTab === "faculty" && (
                    <Card className="bg-slate-900/40 border-white/10">
                        <CardHeader className="border-b border-white/10">
                            <CardTitle className="text-white text-base">Faculty Management</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 text-center py-16">
                            <div className="text-5xl mb-4">👨‍🏫</div>
                            <p className="text-slate-400">Faculty records are managed through the onboarding flow.</p>
                            <p className="text-slate-600 text-sm mt-2">Faculty register via Clerk and create their profile on first login.</p>
                        </CardContent>
                    </Card>
                )}

                {/* ── Analytics Tab ── */}
                {activeTab === "analytics" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-slate-900/40 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white text-base">Department Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {departments.map((dept) => {
                                        const count = students.filter((s) => s.department === dept).length;
                                        const pct = Math.round((count / students.length) * 100);
                                        return (
                                            <div key={dept}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-300">{dept}</span>
                                                    <span className="text-slate-500">{count} students</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {departments.length === 0 && (
                                        <p className="text-slate-500 text-sm text-center py-4">No data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/40 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white text-base">System Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { label: "AI Service URL", value: process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:8000" },
                                        { label: "Database", value: "MongoDB Atlas" },
                                        { label: "Auth Provider", value: "Clerk" },
                                        { label: "Framework", value: "Next.js 14 + FastAPI" },
                                    ].map((item) => (
                                        <div key={item.label} className="flex justify-between py-2 border-b border-white/[0.05]">
                                            <span className="text-slate-400 text-sm">{item.label}</span>
                                            <span className="text-white text-sm font-mono">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
