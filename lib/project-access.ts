import prisma from '@/lib/prisma';

import { Role } from "@prisma/client";

export async function getProjectMember(
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
  });

  return member?.role ?? null;
}
