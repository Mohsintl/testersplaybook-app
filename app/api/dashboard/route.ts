/*
  API: Dashboard Data (Tasks + Test Runs)
  --------------------------------------
  Returns all dashboard-relevant data for the logged-in user.
*/
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  /* ---------------- RESPONSE ---------------- */
  return NextResponse.json({
    success: true,
    data: {
      projectCount: projects.length,
      assignedTasks,
      completedTasks,
      createdTasks,
      assignedRuns,
      completedRuns,
      createdRuns,
    },
  });
}
