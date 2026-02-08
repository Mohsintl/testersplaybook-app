import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ moduleId: string; referenceId: string }> },
) {
  const { moduleId, referenceId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { projectId: true },
  });

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const role = await getProjectMemberRole(module.projectId, session.user.id);
  if (role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owner can delete UI references" },
      { status: 403 },
    );
  }

  const ref = await prisma.moduleUIReference.findUnique({
    where: { id: referenceId },
    select: { moduleId: true },
  });

  if (!ref || ref.moduleId !== moduleId) {
    return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  }

  try {
    await prisma.moduleUIReference.delete({
      where: {
        id: referenceId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete UI reference failed:", error);
    return NextResponse.json(
      { error: "Failed to delete reference" },
      { status: 500 },
    );
  }
}
