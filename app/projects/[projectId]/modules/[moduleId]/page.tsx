import { getAuthSession } from "@/lib/auth";
import { getProjectMemberRole } from "@/lib/project-access";
/*
  Module Page (Server)
  --------------------
  Server component that loads module details and test cases for the
  module. Normalizes data and passes it to client components.
*/
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateTestCaseForm from "./CreateTestCaseForm";
import ModuleAIReview from "./ModuleAIReview";
import ModuleAIGenerate from "./modelAIGenerate";
import ProjectLayout from "../../../components/ProjectLayout";
import ModuleBehaviorClient from "./ModuleBehaviorClient";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ projectId: string; moduleId: string }>;
}) {
  const { projectId, moduleId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      testCases: {
        orderBy: { createdAt: "desc" },
      },
      project: true,
    },
  });

  const behaviors = module
    ? await prisma.projectBehavior.findMany({
        where: {
          moduleId: module.id,
          scope: "MODULE",
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  if (!module || module.projectId !== projectId) {
    return <p style={{ padding: "24px" }}>Module not found</p>;
  }

  const myRole = await getProjectMemberRole(module.projectId, session.user.id);
  const canCreateTestCase = myRole === "OWNER";

  const testCases = await prisma.testCase.findMany({
    where: { moduleId },
  });

  return (
    <ProjectLayout
      title={module.name}
      description={`Project: ${module.project.name}`}
      leftContent={
        <div>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Cases
          </Typography>
          {module.testCases.length === 0 ? (
            <Typography>No test cases yet.</Typography>
          ) : (
            <Stack spacing={1}>
              {module.testCases.map((tc) => (
                <a
                  key={tc.id}
                  href={`/projects/${projectId}/modules/${moduleId}/test-cases/${tc.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {tc.title}
                </a>
              ))}
            </Stack>
          )}
        </div>
      }
      rightContent={
        <div>
          {canCreateTestCase && (
            <CreateTestCaseForm projectId={projectId} moduleId={moduleId} />
          )}
          <div className="flex gap-4 mt-4">
            <ModuleAIReview
              moduleId={moduleId}
              testCases={(testCases || []).map((tc) => ({
                id: tc.id,
                title: tc.title,
              }))}
              canReview={myRole === "OWNER"}
            />
            <ModuleAIGenerate
              moduleId={module.id}
              canAdd={myRole === "OWNER"}
            />
          </div>
        </div>
      }
      extraRightContent={
        <ModuleBehaviorClient
          projectId={module.project.id}
          moduleId={module.id}
          existingBehaviors={behaviors}
          canEdit={myRole === "OWNER"}
        />
      }
    />
  );
}
