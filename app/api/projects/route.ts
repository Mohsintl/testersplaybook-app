export const runtime = "nodejs";

// This file defines the API route for managing projects.
// It handles operations such as creating, updating, and deleting projects.
// The route ensures proper authentication and authorization for project-related actions.

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userEmail = session.user.email;

  const { name, description } = await req.json();

  if (!name) {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const project = await tx.project.create({
        data: {
          name,
          description,
          ownerId: user.id,
        },
      });

      await tx.projectMember.create({
        data: {
          userId: user.id,
          projectId: project.id,
          role: "OWNER",
        },
      });

      return project;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project failed:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
