import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getProjectMemberRole } from "@/lib/project-access";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      assignedToId: true,
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const role = await getProjectMemberRole(task.projectId, session.user.id);
  const isOwner = role === "OWNER";
  const isAssignee = task.assignedToId === session.user.id;

  if (!role || (!isOwner && !isAssignee)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  return NextResponse.json({ success: true, data: updated });
}
