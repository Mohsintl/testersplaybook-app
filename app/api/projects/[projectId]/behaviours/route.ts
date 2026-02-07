import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";

/* =======================
   GET: Fetch behaviors
======================= */
export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { projectId } = await params;
  const role = await getProjectMemberRole(projectId, session.user.id);
  if (!role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const behaviors = await prisma.projectBehavior.findMany({
    where: { 
      projectId,
       scope: "PROJECT" ,
      },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: behaviors });
}

/* =======================
   POST: Add behavior
======================= */
export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
const { projectId } = await params;
const role = await getProjectMemberRole(projectId, session.user.id);

if (!role) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

if (role !== "OWNER") {
  return NextResponse.json({ error: "Only owner allowed" }, { status: 403 });
}

  const { userAction, systemResult } = await req.json();

  if (!userAction || !systemResult) {
    return NextResponse.json(
      { error: "Both userAction and systemResult are required" },
      { status: 400 }
    );
  }

  try {
    const { projectId } = await params;
    const behavior = await prisma.projectBehavior.create({
      data: {
        projectId,
        scope: "PROJECT",
        userAction,
        systemResult,
      },
    });
    console.log("Behavior Created:", behavior);
    return NextResponse.json({ success: true, data: behavior });
  } catch (error) {
    console.error("Error Creating Behavior:", error);
    return NextResponse.json({ error: "Failed to create behavior" }, { status: 500 });
  }
}
