import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

  const behaviors = await prisma.projectBehavior.findMany({
    where: { projectId: params.projectId },
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

  const { userAction, systemResult } = await req.json();

  if (!userAction || !systemResult) {
    return NextResponse.json(
      { error: "Both userAction and systemResult are required" },
      { status: 400 }
    );
  }

  try {
        const { projectId } = await params; 
    const behavior =  await prisma.projectBehavior.create({
      data: {
        projectId,
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
