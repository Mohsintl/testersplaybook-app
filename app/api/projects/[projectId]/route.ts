/*
  API: Project Details (DELETE)
  -----------------------------
  Server-side endpoint to delete a project. Only project OWNERs are allowed
  to perform deletions. This header is documentation-only and does not
  change runtime behavior.
*/
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMemberRole(projectId, session.user.id);
  
  // Only OWNER can delete the project
  if (role !== "OWNER") {
    return NextResponse.json(
      { error: "Only project owner can delete the project" },
      { status: 403 }
    );
  }

  try {
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project failed:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
