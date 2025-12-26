export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getProjectMember } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; moduleId: string }> }
) {
  const { projectId, moduleId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMember(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete module failed:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}
