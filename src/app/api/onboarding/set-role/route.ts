/**
 * API Route: /api/onboarding/set-role
 * POST — sets the user's role in Clerk's public metadata.
 *
 * This endpoint is called from the onboarding page.
 * It uses the Clerk Backend API to update user metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const VALID_ROLES = ["student", "faculty", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { role } = body as { role: Role };

        if (!role || !VALID_ROLES.includes(role)) {
            return NextResponse.json(
                { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
                { status: 400 }
            );
        }

        // Update Clerk user's public metadata with the selected role
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: { role },
        });

        return NextResponse.json({ success: true, role }, { status: 200 });
    } catch (error) {
        console.error("[POST /api/onboarding/set-role]", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
