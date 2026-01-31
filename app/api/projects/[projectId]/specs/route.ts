export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

/* ---------------- GET PRODUCT SPEC ---------------- */
export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Any project member can read
  const role = await getProjectMemberRole(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const spec = await prisma.productSpec.findUnique({
    where: { projectId },
  });

  return NextResponse.json({
    success: true,
    data: spec ?? null,
  });
}

/* ---------------- SAVE / UPDATE PRODUCT SPEC ---------------- */
export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can edit
  const role = await getProjectMemberRole(projectId, session.user.id);
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

  const spec = await prisma.productSpec.upsert({
    where: { projectId },
    create: {
      projectId,
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
