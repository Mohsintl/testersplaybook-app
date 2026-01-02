import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  // Check ownership first
  const ownerCount = await prisma.project.count({ where: { ownerId: userId } });
  if (ownerCount > 0) {
    // Owners manage projects
    redirect("/projects");
  }

  // Check contributor memberships
  const memberCount = await prisma.projectMember.count({ where: { userId } });
  if (memberCount > 0) {
    // Render dashboard client for contributors
    return <DashboardClient />;
  }

  // No projects or memberships — send to entry to choose next action
  redirect("/entry");
}
