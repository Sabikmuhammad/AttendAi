/**
 * Sign-Up Page — Clerk-managed registration form.
 */

import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
            <div className="absolute inset-0 bg-mesh-gradient opacity-40 pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">AttendAI</span>
                    </div>
                    <p className="text-slate-400 text-sm">Create your account</p>
                </div>

                <SignUp
                    appearance={{
                        variables: {
                            colorPrimary: "hsl(220, 90%, 60%)",
                            colorBackground: "hsl(222, 47%, 9%)",
                            colorText: "white",
                            colorTextSecondary: "hsl(215, 20%, 65%)",
                            colorInputBackground: "hsl(222, 47%, 12%)",
                            colorInputText: "white",
                            borderRadius: "0.75rem",
                        },
                    }}
                />
            </div>
        </div>
    );
}
