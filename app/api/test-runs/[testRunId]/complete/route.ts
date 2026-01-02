import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";

export async function POST(
    req: Request,
    context: { params: Promise<{ testRunId: string }> }
) {
    const { testRunId } = await context.params;

    // Check session
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check project access
    const testRun = await prisma.testRun.findUnique({
        where: { id: testRunId },
        include: { project: true },
    });

    if (!testRun) {
        return NextResponse.json({ error: "Test run not found" }, { status: 404 });
    }

    const role = await getProjectMemberRole(testRun.projectId, session.user.id);
    if (!role) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the status to COMPLETED
    await prisma.testRun.update({
        where: { id: testRunId },
        data: {
            status: "COMPLETED",
            endedAt: new Date(),
        },
    });

    return NextResponse.json({ success: true });
}