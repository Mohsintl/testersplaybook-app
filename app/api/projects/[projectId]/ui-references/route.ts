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

  const references = await prisma.projectUIReference.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: references });
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

  const ref = await prisma.projectUIReference.create({
    data: {
      projectId,
      title,
      imageUrl,
      source,
      description,
    },
  });

  return NextResponse.json({ success: true, data: ref });
}
