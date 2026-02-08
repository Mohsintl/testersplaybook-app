import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";

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

  const references = await prisma.moduleUIReference.findMany({
    where: { moduleId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: references });
}

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
    return NextResponse.json(
      { error: "Only owner can add UI references" },
      { status: 403 }
    );
  }

  const { title, imageUrl, source, description } = await req.json();

  if (!title || !imageUrl) {
    return NextResponse.json(
      { error: "title and imageUrl are required" },
      { status: 400 }
    );
  }

  const ref = await prisma.moduleUIReference.create({
    data: {
      moduleId,
      title,
      imageUrl,
      source,
      description,
    },
  });

  return NextResponse.json({ success: true, data: ref });
}
