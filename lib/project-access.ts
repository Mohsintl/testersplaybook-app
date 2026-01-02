import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getProjectMemberRole(
  projectId: string,
  userId: string
): Promise<Role | null> {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
    select: { role: true },
  });

  return member?.role ?? null;
}
