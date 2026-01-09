
/*
  API: Project Invitations
  ------------------------
  Handles creating and listing invitations for a project. This route
  enforces authentication and project membership checks. Behavior and
  validation are implemented below; this header is documentation-only.
*/
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectMemberRole } from "@/lib/project-access";
import { randomUUID } from "crypto";

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  

  // 🔐 Owner check
  const role = await getProjectMemberRole(projectId, session.user.id);
  if (role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Prevent duplicate invites
  const existing = await prisma.invitation.findFirst({
    where: { projectId, email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Invitation already sent" },
      { status: 409 }
    );
  }
  
const token = randomUUID();
  const invitation = await prisma.invitation.create({
    data: {
      email,
      projectId,
      creatorId: session.user.id,
      role: "CONTRIBUTOR",
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // ⚠️ Email sending later
  // For now we return the invite link

  return NextResponse.json({
    success: true,
    inviteLink: `${process.env.NEXTAUTH_URL}/invite?token=${token}`,
  });
}
