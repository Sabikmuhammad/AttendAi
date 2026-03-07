/**
 * Root Layout — wraps entire app with Clerk authentication provider.
 * Sets up global fonts, metadata, and the Toaster notification component.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={`${inter.variable} font-sans antialiased`}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
