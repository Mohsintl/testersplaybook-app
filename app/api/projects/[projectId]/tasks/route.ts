export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMemberRole(projectId, session.user.id);
  if (role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, assignedToId, dueDate } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: task });
}



export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMemberRole(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({ data: tasks });
}
