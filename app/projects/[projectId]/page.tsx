/*
  Project Page (Server)
  ---------------------
  Loads a single project and related data (modules, test cases, runs) and
  renders the project dashboard. Performs auth and access checks on the
  server.
*/
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateModuleForm from "./CreateModuleForm";
import ModuleList from "./ModuleList";
import ProjectLayout from "../components/ProjectLayout";
import ProjectBehaviorClient from "./ProjectBehaviorClient";
import TestRunsClient from "../components/TestRunsClient";
import InviteMember from "../components/InviteMember";
import UIReferences from "./UIReferences";
import { Stack } from "@mui/material";
import ProductSpecEditor from "./ProductSpecEditor";
import ProjectTasksSection from "./ProjectTaskSection";
import TaskList from "../components/TaskList";


import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  console.log("[ProjectPage] Rendering project page"); // Debug log

  const { projectId } = await params; // ✅ REQUIRED FIX
  console.log(`[ProjectPage] projectId: ${projectId}`); // Debug log

  const session = await getAuthSession();

  if (!session?.user?.id) {
    console.warn("[ProjectPage] Unauthorized access, redirecting to signin"); // Debug log
    redirect("/api/auth/signin");
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        modules: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      console.warn(`[ProjectPage] Project not found for id: ${projectId}`); // Debug log
      return <p style={{ padding: "24px" }}>Project not found</p>;
    }

    console.log("[ProjectPage] Project data fetched successfully"); // Debug log

    const behaviors = await prisma.projectBehavior.findMany({
      where: {
        projectId,
        scope: "PROJECT",
      },
      select: {
        id: true,
        userAction: true,
        systemResult: true,
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(`[ProjectPage] Retrieved ${behaviors.length} behaviors`); // Debug log

    const testRuns = await prisma.testRun.findMany({
      where: { projectId },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        assignedToId: true,
        startedAt: true,
        endedAt: true,
      },
    });

    // Convert Date objects to ISO strings
    const formattedTestRuns = testRuns.map((run: { startedAt: { toISOString: () => any; }; endedAt: { toISOString: () => any; }; }) => ({
      ...run,
      startedAt: run.startedAt.toISOString(),
      endedAt: run.endedAt ? run.endedAt.toISOString() : null,
    }));

    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    const tasks = await prisma.task.findMany({
  where: { projectId },
  orderBy: { createdAt: "desc" },
  include: {
    assignedTo: { select: { id: true, name: true } },
  },
});


    // Determine current user's role in this project
    const myRole = projectMembers.find(
      (pm: { user: { id: string; }; }) => pm.user.id === session.user.id,
    )?.role;
    console.log(`[ProjectPage] current user role: ${myRole}`);

    return (
      <ProjectLayout
        title={project.name}
        description={project.description ?? "No description"}
        leftContent={
          <Stack spacing={3} mt={3}>
            <SimpleEditor projectId={projectId} editable={myRole === "OWNER"} />
            {/* <ProductSpecEditor
              projectId={projectId}
              editable={myRole === "OWNER"} // contributor = read-only
            /> */}
            <ProjectBehaviorClient
              projectId={project.id}
              existingBehaviors={behaviors}
            />

            <UIReferences projectId={projectId} canEdit={myRole === "OWNER"} />
          </Stack>
        }
        rightContent={
          <div>
            <CreateModuleForm projectId={projectId} />
            <ProjectTasksSection
              projectId={projectId}
              members={projectMembers}
              canCreate={myRole === "OWNER"}
            />
            <TaskList  tasks={tasks} />
            <TestRunsClient
              projectId={projectId}
              initialRuns={formattedTestRuns} // Use the formatted test runs
              members={projectMembers}
            />
            {myRole === "OWNER" && <InviteMember projectId={projectId} />}
          </div>
        }
        extraRightContent={
          <ModuleList modules={project.modules} projectId={projectId} />
        }
      />
    );
  } catch (error) {
    console.error("[ProjectPage] Error fetching project data:", error); // Debug log
    return (
      <p style={{ padding: "24px" }}>
        An error occurred while loading the project
      </p>
    );
  }
}
