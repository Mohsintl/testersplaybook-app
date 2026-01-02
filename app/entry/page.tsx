import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export default async function EntryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const userId = session.user.id;

  // 1️⃣ Owner projects
  const ownedProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  if (ownedProjects.length > 0) {
    redirect("/projects");
  }

  // 2️⃣ Contributor memberships
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });

  // 3️⃣ Assigned test runs
  const assignedRuns = await prisma.testRun.findMany({
    where: {
      assignedToId: userId,
      endedAt: null,
    },
    select: { id: true },
  });

  if (assignedRuns.length > 0) {
    redirect("/dashboard");
  }

  // 4️⃣ Contributor but no work yet
  if (memberships.length > 0) {
    redirect("/waiting");
  }

  // 5️⃣ Brand new user
  redirect("/projects/new");
}
