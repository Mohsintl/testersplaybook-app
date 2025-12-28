import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { moduleId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await params;
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId missing" }, { status: 400 });
  }

  const { userAction, systemResult } = await req.json();

  if (!userAction || !systemResult) {
    return NextResponse.json(
      { error: "Both fields are required" },
      { status: 400 }
    );
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId  },
    select: { projectId: true },
  });

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const behavior = await prisma.projectBehavior.create({
    data: {
      projectId: module.projectId,
     moduleId,
      scope: "MODULE",
      userAction,
      systemResult,
    },
  });

  return NextResponse.json({ success: true, data: behavior });
}
