/**
 * Faculty Layout — wraps all /faculty/* pages with a shared sidebar navigation.
 * Guards the layout: only faculty and admin roles can access it.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const navItems = [
    {
        href: "/faculty/dashboard",
        label: "Dashboard",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 9h6M9 13h6M9 17h4" />
            </svg>
        ),
    },
    {
        href: "/faculty/create-class",
        label: "Create Class",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
            </svg>
        ),
    },
    {
        href: "/faculty/live-class",
        label: "Live Class",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 002-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
    },
];

export default async function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    // Gate: only faculty or admin can access
    if (role !== "faculty" && role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 fixed left-0 top-0 bottom-0 border-r border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-col z-30">
                {/* Brand */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">AttendAI</p>
                            <p className="text-xs text-slate-500">Faculty Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                        >
                            <span className="group-hover:text-blue-400 transition-colors">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-2">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-slate-500 truncate">Faculty</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-64 flex-1 min-h-screen">
                {children}
            </main>
        </div>
    );
}
