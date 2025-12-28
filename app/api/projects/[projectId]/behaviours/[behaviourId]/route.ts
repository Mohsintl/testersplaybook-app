import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* =======================
/* =======================
   DELETE: Remove behavior
======================= */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ projectId: string; behaviourId: string }> }
) {
  try {
    const { params } = context;
    const { projectId, behaviourId } = await params; // Await the params

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!behaviourId) {
      return NextResponse.json({ error: "Behavior ID is required" }, { status: 400 });
    }

    const deletedBehavior = await prisma.projectBehavior.delete({
      where: {
        id: behaviourId, // Only the ID is required for deletion
      },
    });

    return NextResponse.json({ success: true, data: deletedBehavior });
  } catch (error) {
    console.error("Error deleting behavior:", error);
    return NextResponse.json({ error: "Failed to delete behavior" }, { status: 500 });
  }
}
