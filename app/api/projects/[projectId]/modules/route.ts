export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";
import prisma from "@/lib/prisma";
import { canManageProject } from "@/lib/permissions";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params; // ✅ AWAIT params

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMemberRole(projectId, session.user.id);

if (!role) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

if (role !== "OWNER") {
  return NextResponse.json({ error: "Only owner allowed" }, { status: 403 });
}

if (!canManageProject(role)) {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
  const { name, description } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Module name required" }, { status: 400 });
  }

  const module = await prisma.module.create({
    data: {
      name,
      description: description || "",
      projectId,
    },
  });

  return NextResponse.json(module, { status: 201 });
}
