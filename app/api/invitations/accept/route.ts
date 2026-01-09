import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { error: "Invitation token missing" },
      { status: 400 }
    );
  }

  // 1️⃣ Find invitation
  const invite = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Invalid invitation" },
      { status: 404 }
    );
  }

  // 2️⃣ Expiry check
  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invitation expired" },
      { status: 410 }
    );
  }

  // 3️⃣ Ensure email matches
  if (invite.email !== session.user.email) {
    return NextResponse.json(
      { error: "This invite is not for your email" },
      { status: 403 }
    );
  }

  // 4️⃣ Prevent duplicate membership
  const existing = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId: invite.projectId,
      },
    },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      projectId: invite.projectId,
    });
  }

  // 5️⃣ Ensure user row exists and then create member + delete invite (transaction)
  // Upsert user by email to guarantee foreign key integrity
  let user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    // Try to find by email as fallback
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
      },
    });
  }

  await prisma.$transaction([
    prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: invite.projectId,
        role: invite.role,
      },
    }),
    prisma.invitation.delete({ where: { id: invite.id } }),
  ]);

  return NextResponse.json({
    success: true,
    projectId: invite.projectId,
  });
}
