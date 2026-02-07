// app/tasks/[taskId]/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import TaskExecutionClient from "./TaskExecutionClient";
import { getProjectMemberRole } from "@/lib/project-access";

export const runtime = "nodejs";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/entry");
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          members: {
            where: { userId: session.user.id },
            select: { role: true },
          },
        },
      },
      assignedTo: {
        select: { id: true, name: true },
      },
      comment: {
        include: {
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    redirect("/dashboard");
  }

  // Access check
  const isMember = task.project.members.length > 0;
  if (!isMember) {
    redirect("/dashboard");
  }


  const myRole = await getProjectMemberRole(task.project.id, session.user.id);

  return (
    <TaskExecutionClient
      task={{
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectName: task.project.name,
        assignedTo: task.assignedTo,
        comments: task.comment.map((c) => ({
          id: c.id,
          content: c.content,
          authorName: c.author.name,
          createdAt: c.createdAt.toISOString(),
        })),
      }}
      editable={myRole === "OWNER"}
    />
  );
}
