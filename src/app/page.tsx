/**
 * Landing Page — AttendAI home page.
 * Includes: Navbar, Hero, Stats, Features, How It Works, CTA, Footer.
 * Server component — no "use client" needed here.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">AttendAI</span>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
                        <a href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">About</a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link href="/sign-in">
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button variant="gradient" size="sm">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

const stats = [
    { value: "99.8%", label: "Recognition Accuracy" },
    { value: "<2s", label: "Detection Speed" },
    { value: "10k+", label: "Students Tracked" },
    { value: "500+", label: "Classes Managed" },
];

// ─── Features ────────────────────────────────────────────────────────────────

const features = [
    {
        icon: "👁️",
        title: "Real-Time Face Detection",
        description:
            "Advanced OpenCV and face_recognition algorithms detect and identify students within 2 seconds of camera activation.",
        gradient: "from-blue-500/20 to-blue-600/10",
        border: "border-blue-500/20",
    },
    {
        icon: "🤖",
        title: "AI-Powered Recognition",
        description:
            "128-dimensional face embeddings ensure each student is uniquely identified with 99.8% accuracy even in varying lighting conditions.",
        gradient: "from-violet-500/20 to-violet-600/10",
        border: "border-violet-500/20",
    },
    {
        icon: "⚡",
        title: "Automatic Attendance",
        description:
            "Zero manual entry required. Attendance is marked automatically in MongoDB the moment a student face is recognized.",
        gradient: "from-amber-500/20 to-amber-600/10",
        border: "border-amber-500/20",
    },
    {
        icon: "📊",
        title: "Live Dashboards",
        description:
            "Faculty, student, and admin dashboards provide real-time insights, attendance percentages, and exportable reports.",
        gradient: "from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-500/20",
    },
    {
        icon: "🔐",
        title: "Role-Based Access",
        description:
            "Clerk-powered authentication with three distinct roles: Student, Faculty, and Admin. Each with tailored permissions and views.",
        gradient: "from-pink-500/20 to-pink-600/10",
        border: "border-pink-500/20",
    },
    {
        icon: "🎥",
        title: "Webcam to CCTV Ready",
        description:
            "Works with standard webcams in development. Architecture is designed to seamlessly upgrade to CCTV cameras in production.",
        gradient: "from-cyan-500/20 to-cyan-600/10",
        border: "border-cyan-500/20",
    },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────

const steps = [
    { step: "01", title: "Faculty Creates Class", desc: "Enter course details, classroom number, time, and select students from the database." },
    { step: "02", title: "Class Session Starts", desc: "Faculty clicks 'Start Class' to activate the webcam and begin the AI detection loop." },
    { step: "03", title: "AI Detects Faces", desc: "Frames are sent to the Python FastAPI service every 5 seconds. OpenCV detects faces and face_recognition encodes them." },
    { step: "04", title: "Students Matched", desc: "Face embeddings are compared to stored student embeddings. Matches are identified with a confidence score." },
    { step: "05", title: "Attendance Marked", desc: "Matched students are instantly recorded as 'present' in MongoDB with a timestamp and confidence score." },
    { step: "06", title: "Reports Generated", desc: "Faculty export attendance reports. Students view their attendance history and percentage on their dashboard." },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            <Navbar />

            {/* ── Hero ── */}
            <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-950 to-violet-950/30 pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-5xl mx-auto text-center">
                    <Badge variant="info" className="mb-6 px-4 py-1.5 text-xs font-medium animate-fade-in-up">
                        🚀 Powered by OpenCV + face_recognition
                    </Badge>

                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 animate-fade-in-up [animation-delay:0.1s]">
                        <span className="text-white">AI-Powered</span>
                        <br />
                        <span className="gradient-text">Smart Attendance</span>
                        <br />
                        <span className="text-white">for Modern Classrooms</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up [animation-delay:0.2s]">
                        Eliminate manual roll calls forever. AttendAI uses facial recognition
                        to automatically mark attendance in real-time — accurate, instant,
                        and effortless.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up [animation-delay:0.3s]">
                        <Link href="/sign-up">
                            <Button variant="gradient" size="xl" className="w-full sm:w-auto">
                                Start Free Trial →
                            </Button>
                        </Link>
                        <Link href="#how-it-works">
                            <Button variant="outline" size="xl" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                                See How It Works
                            </Button>
                        </Link>
                    </div>

                    {/* Hero visual — live detection mockup */}
                    <div className="mt-20 relative animate-fade-in-up [animation-delay:0.4s]">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="relative mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-500/10">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-800/50">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                <span className="ml-2 text-xs text-slate-400 font-mono">AttendAI — Live Class Monitor</span>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
                                        LIVE
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 divide-x divide-white/10 min-h-64">
                                {/* Webcam placeholder */}
                                <div className="col-span-8 bg-slate-950/50 relative flex items-center justify-center min-h-64">
                                    <div className="absolute inset-4 rounded-xl border-2 border-dashed border-blue-500/30 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-slate-500 text-sm">Webcam Feed Active</p>
                                            <p className="text-slate-600 text-xs mt-1">AI detecting faces every 5s</p>
                                        </div>
                                        {/* Detection boxes */}
                                        <div className="absolute top-8 left-8 w-20 h-24 border-2 border-emerald-400 rounded-lg opacity-70">
                                            <span className="absolute -top-5 left-0 text-xs text-emerald-400 font-mono whitespace-nowrap">Priya S. ✓ 98%</span>
                                        </div>
                                        <div className="absolute top-12 right-12 w-20 h-24 border-2 border-blue-400 rounded-lg opacity-70">
                                            <span className="absolute -top-5 left-0 text-xs text-blue-400 font-mono whitespace-nowrap">Rahul K. ✓ 96%</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Attendance sidebar */}
                                <div className="col-span-4 p-4 space-y-3 bg-slate-900/30">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detected Students</p>
                                    {[
                                        { name: "Priya S.", time: "10:32:15", status: "present" },
                                        { name: "Rahul K.", time: "10:32:20", status: "present" },
                                        { name: "Ananya M.", time: "10:32:45", status: "present" },
                                    ].map((student) => (
                                        <div key={student.name} className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <div>
                                                <p className="text-xs font-medium text-white">{student.name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{student.time}</p>
                                            </div>
                                            <span className="text-xs text-emerald-400">✓</span>
                                        </div>
                                    ))}
                                    <div className="pt-2 border-t border-white/10">
                                        <p className="text-xs text-slate-500">3/28 marked present</p>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                            <div className="h-full w-[11%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="border-y border-white/10 bg-white/[0.02] py-14">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-4xl font-black gradient-text mb-1">{stat.value}</p>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="info" className="mb-4">Features</Badge>
                        <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto">
                            A complete attendance management platform designed for the modern classroom.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className={`relative p-6 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-sm card-hover group`}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:gradient-text transition-all">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-y border-white/10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="info" className="mb-4">Process</Badge>
                        <h2 className="text-4xl font-bold mb-4">How AttendAI Works</h2>
                        <p className="text-slate-400 text-lg">From classroom to report in under 2 seconds.</p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, idx) => (
                            <div key={step.step} className="flex gap-6 items-start group">
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    {step.step}
                                </div>
                                <div className="pt-2">
                                    <h3 className="font-semibold text-white text-lg mb-1">{step.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="absolute left-7 mt-14 w-0.5 h-6 bg-gradient-to-b from-blue-500/50 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="relative p-12 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-violet-600/10 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-violet-600/5 pointer-events-none" />
                        <div className="relative">
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Ready to Modernize Attendance?
                            </h2>
                            <p className="text-slate-400 text-lg mb-8">
                                Join institutions that have eliminated manual roll calls with AttendAI.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/sign-up">
                                    <Button variant="gradient" size="xl">
                                        Get Started Free →
                                    </Button>
                                </Link>
                                <Link href="/sign-in">
                                    <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-white/10 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="font-bold text-white">AttendAI</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            © 2026 AttendAI. AI-Powered Smart Classroom Attendance System.
                        </p>
                        <div className="flex gap-6 text-sm text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
