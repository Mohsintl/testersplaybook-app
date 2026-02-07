import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ projectId: string; referenceId: string }> },
) {
  const { projectId, referenceId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMemberRole(projectId, session.user.id);
  if (role !== "OWNER") {
    return NextResponse.json(
      { error: "Only owner can delete UI references" },
      { status: 403 },
    );
  }

  try {
    await prisma.projectUIReference.delete({
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
