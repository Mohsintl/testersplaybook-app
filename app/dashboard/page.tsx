/*
  Dashboard Page (Server)
  -----------------------
  Server component that aggregates user-centric data (assigned runs,
  created runs, project counts) and renders the `DashboardClient` inside
  the project layout. Performs authentication and prepares stable data
  for the client to render.
*/
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import ProjectLayout from "../projects/components/ProjectLayout";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/entry");
  }

  const userId = session.user.id;

  /**
   * 1️⃣ Test runs ASSIGNED to the user (Contributor flow)
   */
  const activeAssignedRuns = await prisma.testRun.findMany({
    where: {
      assignedToId: userId,
      endedAt: null,
    },
    orderBy: {
      startedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      startedAt: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const completedAssignedRuns = await prisma.testRun.findMany({
    where: {
      assignedToId: userId,
      endedAt: {
        not: null,
      },
    },
    orderBy: {
      endedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      endedAt: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  /**
   * 2️⃣ Test runs CREATED by the user (Owner / Lead flow)
   */
  const createdRuns = await prisma.testRun.findMany({
    where: {
      userId,
    },
    orderBy: {
      startedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      startedAt: true,
      endedAt: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  /**
   * 3️⃣ Project count (for quick stats)
   */
  const projectCount = await prisma.projectMember.count({
    where: { userId },
  });

  return (

    <ProjectLayout
      title="Dashboard"
      description="Manage your testRUns"
      leftContent={
        <DashboardClient
          activeAssignedRuns={activeAssignedRuns}
          createdRuns={createdRuns}
          completedAssignedRuns={completedAssignedRuns}
          projectCount={projectCount}
        />
      }
      rightContent={null}
    />

  );
}
