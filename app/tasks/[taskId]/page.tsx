// app/tasks/[taskId]/page.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import TaskExecutionClient from "./TaskExecutionClient";
import { getProjectMemberRole } from "@/lib/project-access";
import ProjectLayout from "@/app/projects/components/ProjectLayout";

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
  const canEditStatus =
    myRole === "OWNER" || task.assignedTo?.id === session.user.id;

  return (
    <ProjectLayout
      title=""
      description=""
      leftContent={
        <TaskExecutionClient
          task={{
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            projectName: task.project.name,
            assignedTo: task.assignedTo,
            comments: task.comment.map((c: { id: any; content: any; author: { name: any; }; createdAt: { toISOString: () => any; }; }) => ({
              id: c.id,
              content: c.content,
              authorName: c.author.name,
              createdAt: c.createdAt.toISOString(),
            })),
          }}
          editable={canEditStatus}
        />
      }
      rightContent={null}
    />
  );
}
