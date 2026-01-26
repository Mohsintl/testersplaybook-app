 import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

export async function GET(
  _req: Request,
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

  const spec = await prisma.productSpec.findUnique({
    where: { projectId },
  });

  return NextResponse.json({ success: true, data: spec });
}



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
    return NextResponse.json(
      { error: "Only owner can update product specs" },
      { status: 403 }
    );
  }

  const { overview, coreFlows, notes } = await req.json();

  const spec = await prisma.productSpec.upsert({
    where: { projectId },
    update: {
      overview,
      coreFlows,
      notes,
    },
    create: {
      projectId,
      overview,
      coreFlows,
      notes,
    },
  });

  return NextResponse.json({ success: true, data: spec });
}
