"use client";

/**
 * Live Class Page — the core AI attendance capture interface.
 *
 * Flow:
 * 1. Faculty selects an active class from the URL ?classId=xxx
 * 2. Webcam activates via getUserMedia
 * 3. Every 5 seconds, a frame is captured from the video element
 * 4. Frame is sent as base64 to the Python AI service POST /detect
 * 5. Detected student IDs are sent to Next.js POST /api/attendance
 * 6. Attendance records appear in real-time in the sidebar
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? "http://localhost:8000";
const CAPTURE_INTERVAL_MS = 5000; // 5 seconds between captures

interface AttendanceRecord {
    studentId: string;
    name: string;
    registerNumber: string;
    detectedAt: string;
    confidence?: number;
}

interface ClassData {
    _id: string;
    courseName: string;
    courseCode: string;
    classroomNumber: string;
    studentIds: Array<{ _id: string; name: string; registerNumber: string }>;
    isActive: boolean;
}

type CameraStatus = "idle" | "requesting" | "active" | "error";
type SessionStatus = "idle" | "running" | "stopped";

export default function LiveClassPage() {
    const searchParams = useSearchParams();
    const classId = searchParams.get("classId");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [classData, setClassData] = useState<ClassData | null>(null);
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
    const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
    const [processedCount, setProcessedCount] = useState(0);
    const [lastDetected, setLastDetected] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [aiStatus, setAiStatus] = useState<"unknown" | "online" | "offline">("unknown");

    // ── Load class data ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!classId) return;

        fetch(`/api/classes/${classId}`)
            .then((r) => r.json())
            .then((data) => setClassData(data.class))
            .catch(console.error);

        // Also load existing attendance for this class
        fetch(`/api/attendance?classId=${classId}`)
            .then((r) => r.json())
            .then((data) => {
                const records: AttendanceRecord[] = (data.records ?? []).map((r: {
                    studentId: { _id: string; name: string; registerNumber: string };
                    detectedTime: string;
                    confidence?: number;
                }) => ({
                    studentId: r.studentId?._id ?? "",
                    name: r.studentId?.name ?? "Unknown",
                    registerNumber: r.studentId?.registerNumber ?? "",
                    detectedAt: r.detectedTime,
                    confidence: r.confidence,
                }));
                setAttendanceLog(records);
            })
            .catch(console.error);
    }, [classId]);

    // ── Check AI service health ──────────────────────────────────────────────────
    useEffect(() => {
        fetch(`${AI_SERVICE_URL}/health`)
            .then((r) => (r.ok ? setAiStatus("online") : setAiStatus("offline")))
            .catch(() => setAiStatus("offline"));
    }, []);

    // ── Activate webcam ──────────────────────────────────────────────────────────
    const startCamera = async () => {
        setCameraStatus("requesting");
        setErrorMsg("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user",
                },
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraStatus("active");
        } catch (err) {
            setCameraStatus("error");
            setErrorMsg("Camera access denied. Please allow camera permissions and try again.");
            console.error("Camera error:", err);
        }
    };

    // ── Capture frame and send to AI ─────────────────────────────────────────────
    const captureAndDetect = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !classId) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas to video dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64 JPEG (70% quality for performance)
        const imageBase64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

        setProcessedCount((c) => c + 1);

        try {
            // ── Step 1: Send frame to Python AI service ──────────────────────
            const aiResponse = await fetch(`${AI_SERVICE_URL}/detect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageBase64 }),
            });

            if (!aiResponse.ok) {
                console.warn("AI service returned error:", aiResponse.status);
                return;
            }

            const aiData = await aiResponse.json();
            const detectedStudentIds: string[] = aiData.detected_students ?? [];

            setLastDetected(detectedStudentIds);

            if (detectedStudentIds.length === 0) return;

            // ── Step 2: Mark attendance in MongoDB ──────────────────────────
            const attRes = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classId,
                    detectedStudentIds,
                    confidence: aiData.confidence,
                }),
            });

            const attData = await attRes.json();

            // ── Step 3: Update the attendance log in UI ──────────────────────
            if (attData.records && attData.records.length > 0) {
                const newRecords: AttendanceRecord[] = attData.records.map((r: {
                    studentId: string;
                    detectedTime: string;
                    confidence?: number;
                }) => {
                    const studentInfo = classData?.studentIds?.find(
                        (s) => s._id === r.studentId
                    );
                    return {
                        studentId: r.studentId,
                        name: studentInfo?.name ?? "Student",
                        registerNumber: studentInfo?.registerNumber ?? "",
                        detectedAt: r.detectedTime ?? new Date().toISOString(),
                        confidence: r.confidence,
                    };
                });

                setAttendanceLog((prev) => {
                    // Merge without duplicates
                    const existingIds = new Set(prev.map((r) => r.studentId));
                    const fresh = newRecords.filter((r) => !existingIds.has(r.studentId));
                    return [...fresh, ...prev];
                });
            }
        } catch (err) {
            console.error("Detection error:", err);
        }
    }, [classId, classData]);

    // ── Start detection session ──────────────────────────────────────────────────
    const startSession = async () => {
        if (!classId) {
            setErrorMsg("No class selected. Please go back and select a class.");
            return;
        }

        // Activate the class in DB
        await fetch(`/api/classes/${classId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: true }),
        });

        setSessionStatus("running");

        // Start capturing every 5 seconds
        intervalRef.current = setInterval(captureAndDetect, CAPTURE_INTERVAL_MS);

        // Run once immediately
        await captureAndDetect();
    };

    // ── Stop detection session ───────────────────────────────────────────────────
    const stopSession = async () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Mark class as inactive
        if (classId) {
            await fetch(`/api/classes/${classId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: false }),
            });
        }

        // Stop webcam stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setSessionStatus("stopped");
        setCameraStatus("idle");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const presentCount = attendanceLog.length;
    const totalStudents = classData?.studentIds?.length ?? 0;
    const attendancePercent = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return (
        <div className="p-6 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-white">Live Attendance</h1>
                            {sessionStatus === "running" && (
                                <Badge variant="success" className="animate-pulse">● LIVE</Badge>
                            )}
                        </div>
                        {classData && (
                            <p className="text-slate-400 text-sm">
                                {classData.courseName} ({classData.courseCode}) · Room {classData.classroomNumber}
                            </p>
                        )}
                    </div>

                    {/* AI Service Status */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                        <span
                            className={`w-2 h-2 rounded-full ${aiStatus === "online"
                                    ? "bg-emerald-400"
                                    : aiStatus === "offline"
                                        ? "bg-red-400"
                                        : "bg-amber-400"
                                }`}
                        />
                        <span className="text-xs text-slate-400">
                            AI Service: {aiStatus === "online" ? "Online" : aiStatus === "offline" ? "Offline" : "Checking…"}
                        </span>
                    </div>
                </div>
            </div>

            {!classId && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-6">
                    ⚠️ No class selected. Please go to the Dashboard and click &quot;Start Class&quot; on a class.
                </div>
            )}

            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-12 gap-6">
                {/* ── Camera Feed ── */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="bg-slate-900/40 border-white/10 overflow-hidden">
                        <CardHeader className="border-b border-white/10 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-base">Camera Feed</CardTitle>
                                <div className="flex gap-3">
                                    {cameraStatus !== "active" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/20 text-white hover:bg-white/10"
                                            onClick={startCamera}
                                            disabled={cameraStatus === "requesting"}
                                        >
                                            🎥 {cameraStatus === "requesting" ? "Requesting…" : "Enable Camera"}
                                        </Button>
                                    )}
                                    {cameraStatus === "active" && sessionStatus !== "running" && (
                                        <Button
                                            variant="gradient"
                                            size="sm"
                                            onClick={startSession}
                                            disabled={!classId}
                                        >
                                            ▶ Start Detection
                                        </Button>
                                    )}
                                    {sessionStatus === "running" && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={stopSession}
                                        >
                                            ⏹ Stop Session
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative bg-slate-950 aspect-video flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                    style={{ display: cameraStatus === "active" ? "block" : "none" }}
                                />
                                {cameraStatus !== "active" && (
                                    <div className="text-center py-20">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                            <svg className="w-10 h-10 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 002-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500 text-sm">
                                            {cameraStatus === "error" ? "Camera unavailable" : "Camera not started"}
                                        </p>
                                        <p className="text-slate-600 text-xs mt-1">Click &quot;Enable Camera&quot; to begin</p>
                                    </div>
                                )}

                                {/* Overlay: detection stats */}
                                {sessionStatus === "running" && (
                                    <div className="absolute bottom-4 left-4 flex gap-3">
                                        <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-xs text-white font-mono">
                                            Frames: {processedCount}
                                        </div>
                                        {lastDetected.length > 0 && (
                                            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/40 backdrop-blur-sm text-xs text-emerald-300 font-mono">
                                                Last: {lastDetected.length} detected
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hidden canvas for frame capture */}
                            <canvas ref={canvasRef} className="hidden" />
                        </CardContent>
                    </Card>

                    {/* Attendance progress bar */}
                    {totalStudents > 0 && (
                        <div className="mt-4 p-4 rounded-2xl bg-slate-900/40 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Attendance Progress</span>
                                <span className="text-sm font-bold text-white">
                                    {presentCount}/{totalStudents} ({attendancePercent}%)
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                                    style={{ width: `${attendancePercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Attendance Sidebar ── */}
                <div className="col-span-12 lg:col-span-4">
                    <Card className="bg-slate-900/40 border-white/10 h-full">
                        <CardHeader className="border-b border-white/10 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white text-base">Detected Students</CardTitle>
                                <Badge variant="info">{presentCount} present</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                            {attendanceLog.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 text-sm">No attendance recorded yet</p>
                                    <p className="text-slate-600 text-xs mt-1">Start the detection session</p>
                                </div>
                            ) : (
                                attendanceLog.map((record) => (
                                    <div
                                        key={record.studentId}
                                        className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">{record.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{record.registerNumber}</p>
                                            <p className="text-xs text-slate-600">
                                                {new Date(record.detectedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-emerald-400 text-lg">✓</span>
                                            {record.confidence != null && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {Math.round(record.confidence * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Stopped state */}
            {sessionStatus === "stopped" && (
                <div className="mt-6 p-6 rounded-2xl bg-slate-900/40 border border-white/10 text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">Session Ended</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        {presentCount} of {totalStudents} students marked present ({attendancePercent}%)
                    </p>
                    <Button
                        variant="gradient"
                        onClick={() => window.location.href = "/faculty/dashboard"}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            )}
        </div>
    );
}
