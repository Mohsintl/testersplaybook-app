import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import ProjectLayout from "@/app/projects/components/ProjectLayout";

export const runtime = "nodejs";

export default async function DashboardPage() {
  /* ---------------- AUTH ---------------- */
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/entry");
  }

  const userId = session.user.id;

  /* ---------------- PROJECT COUNT ---------------- */
  const projects = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });

  /* ---------------- TASKS ---------------- */
  const assignedTasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: { not: "DONE" },
    },
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedTasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: "DONE",
    },
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const createdTasks = await prisma.task.findMany({
    where: { createdById: userId },
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  /* ---------------- TEST RUNS ---------------- */
  const assignedRuns = await prisma.testRun.findMany({
    where: {
      assignedToId: userId,
      endedAt: null,
    },
    select: {
      id: true,
      name: true,
      startedAt: true,
      endedAt: true,
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  const completedRuns = await prisma.testRun.findMany({
    where: {
      assignedToId: userId,
      endedAt: { not: null },
    },
    select: {
      id: true,
      name: true,
      startedAt: true,
      endedAt: true,
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { endedAt: "desc" },
  });

  const createdRuns = await prisma.testRun.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      startedAt: true,
      endedAt: true,
      assignedTo: {
        select: { id: true, name: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  /* ---------------- RENDER ---------------- */
  return (
    <ProjectLayout
      title=""
      description=""
      leftContent={
        <DashboardClient
          assignedTasks={assignedTasks ?? []}
          completedTasks={completedTasks ?? []}
          createdTasks={createdTasks ?? []}
          assignedRuns={assignedRuns ?? []}
          completedRuns={completedRuns ?? []}
          createdRuns={createdRuns ?? []}
          projectCount={projects?.length ?? 0}
        />
      }
      rightContent={null}
    />
  );
}
