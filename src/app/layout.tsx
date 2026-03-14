/**
 * Root Layout — wraps entire app
 * Includes app-level providers
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "AttendAI — AI-Powered Smart Attendance System",
        template: "%s | AttendAI",
    },
    description:
        "Production-grade facial recognition attendance system for modern educational institutions. Automate attendance with AI.",
    keywords: [
        "attendance system",
        "face recognition",
        "AI classroom",
        "smart attendance",
        "facial recognition",
    ],
    authors: [{ name: "AttendAI" }],
    openGraph: {
        title: "AttendAI — AI-Powered Attendance System",
        description:
            "Automate classroom attendance using facial recognition AI technology.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
            <body className={`${inter.variable} font-sans antialiased`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
