// API route: Complete Test Run
// ----------------------------
// Marks a TestRun as COMPLETED and records `endedAt`. This route enforces
// authorization (project membership) and only allows completion when the
// run is IN_PROGRESS to avoid accidental transitions. Completing also
// sets `isLocked = true` to prevent further edits to results.
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";

export const runtime = "nodejs";

export async function POST(
    req: Request,
    context: { params: Promise<{ testRunId: string }> }
) {
    // Auth
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Params
    const { testRunId } = await context.params;
    if (!testRunId) {
        return NextResponse.json({ error: "testRunId missing" }, { status: 400 });
    }

    // Fetch run (include status)
    const testRun = await prisma.testRun.findUnique({
        where: { id: testRunId },
        select: { id: true, projectId: true, endedAt: true, status: true },
    });

    if (!testRun) {
        return NextResponse.json({ error: "Test run not found" }, { status: 404 });
    }

    // Authorization: ensure user is a project member
    const role = await getProjectMemberRole(testRun.projectId, session.user.id);
    if (!role) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already completed, return existing timestamp
    if (testRun.endedAt || testRun.status === "COMPLETED") {
        return NextResponse.json({ success: true, endedAt: testRun.endedAt });
    }

    // Only allow completing when status is IN_PROGRESS
    if (testRun.status !== "IN_PROGRESS") {
        return NextResponse.json(
            { error: "Test run can only be completed when status is IN_PROGRESS" },
            { status: 400 }
        );
    }

    
        
    // Update run to COMPLETED and lock it to prevent further edits
    const updated = await prisma.testRun.update({
        where: { id: testRunId },
        data: {
            status: "COMPLETED",
            endedAt: new Date(),
            isLocked: true,
        },
        select: { endedAt: true, status: true },
    });

    return NextResponse.json({ success: true, endedAt: updated.endedAt, status: updated.status });
}