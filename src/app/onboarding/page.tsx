"use client";

/**
 * Onboarding Page — shown when a user has no role assigned in Clerk metadata.
 * They select their role, which is then set via an API call.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const roles = [
    {
        id: "student",
        title: "Student",
        description: "View your attendance history and track your attendance percentage.",
        icon: "🎓",
        gradient: "from-blue-600/20 to-blue-700/10",
        border: "border-blue-500/30",
    },
    {
        id: "faculty",
        title: "Faculty",
        description: "Create classes, run live attendance sessions, and view reports.",
        icon: "👨‍🏫",
        gradient: "from-violet-600/20 to-violet-700/10",
        border: "border-violet-500/30",
    },
    {
        id: "admin",
        title: "Administrator",
        description: "Manage students, faculty, classes, and view system analytics.",
        icon: "⚙️",
        gradient: "from-amber-600/20 to-amber-700/10",
        border: "border-amber-500/30",
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!selected) return;
        setLoading(true);

        try {
            await fetch("/api/onboarding/set-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: selected }),
            });

            // Redirect to appropriate dashboard
            if (selected === "faculty") router.push("/faculty/dashboard");
            else if (selected === "admin") router.push("/admin/dashboard");
            else router.push("/student/dashboard");
        } catch (err) {
            console.error("Failed to set role:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">AttendAI</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-3">Welcome! Select Your Role</h1>
                    <p className="text-slate-400">Choose how you&apos;ll be using AttendAI. This determines your dashboard and permissions.</p>
                </div>

                {/* Role cards */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelected(role.id)}
                            className={`w-full text-left p-6 rounded-2xl border transition-all group ${selected === role.id
                                    ? `${role.border} bg-gradient-to-br ${role.gradient} scale-[1.01]`
                                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{role.icon}</span>
                                <div className="flex-1">
                                    <p className="font-bold text-white text-lg">{role.title}</p>
                                    <p className="text-sm text-slate-400 mt-0.5">{role.description}</p>
                                </div>
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected === role.id ? "border-blue-400 bg-blue-500" : "border-slate-600"
                                        }`}
                                >
                                    {selected === role.id && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <Button
                    variant="gradient"
                    size="xl"
                    className="w-full"
                    disabled={!selected || loading}
                    onClick={handleContinue}
                >
                    {loading ? "Setting up your account…" : `Continue as ${selected ? roles.find((r) => r.id === selected)?.title : "…"}`}
                </Button>
            </div>
        </div>
    );
}
