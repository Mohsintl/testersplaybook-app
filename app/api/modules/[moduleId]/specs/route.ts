export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

/* ---------------- GET MODULE SPEC ---------------- */
export async function GET(
  _req: Request,
  context: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await context.params;

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
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const spec = await prisma.moduleSpec.findUnique({
    where: { moduleId },
  });

  return NextResponse.json({
    success: true,
    data: spec ?? null,
  });
}

/* ---------------- SAVE / UPDATE MODULE SPEC ---------------- */
export async function POST(
  req: Request,
  context: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await context.params;

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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content } = await req.json();

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const spec = await prisma.moduleSpec.upsert({
    where: { moduleId },
    create: {
      moduleId,
      content,
    },
    update: {
      content,
    },
  });

  return NextResponse.json({
    success: true,
    data: spec,
  });
}
