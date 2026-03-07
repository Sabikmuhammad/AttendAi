/**
 * Dashboard Router — redirects authenticated users to their role-specific dashboard.
 * Reads the 'role' from Clerk's public metadata to determine destination.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const user = await currentUser();
    const role = user?.publicMetadata?.role as string | undefined;

    if (role === "admin") {
        redirect("/admin/dashboard");
    } else if (role === "faculty") {
        redirect("/faculty/dashboard");
    } else if (role === "student") {
        redirect("/student/dashboard");
    } else {
        // No role assigned yet — show a role selection screen
        redirect("/onboarding");
    }
}
