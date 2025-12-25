export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getProjectMember } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params; // ✅ AWAIT params

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProjectMember(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Module name required" }, { status: 400 });
  }

  const module = await prisma.module.create({
    data: {
      name,
      projectId,
    },
  });

  return NextResponse.json(module, { status: 201 });
}
