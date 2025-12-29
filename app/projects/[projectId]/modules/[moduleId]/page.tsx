import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateTestCaseForm from "./CreateTestCaseForm";
import ModuleAIReview from "./ModuleAIReview";
import ModuleAIGenerate from "./modelAIGenerate";
import ProjectLayout from "@/app/projects/components/ProjectLayout";
import ModuleBehaviorClient from "./ModuleBehaviorClient";


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

  const testCases = await prisma.testCase.findMany({
    where: { moduleId },
  });

  return (
    <ProjectLayout
      title={module.name}
      description={`Project: ${module.project.name}`}
      leftContent={
        <div>
          <h2 className="text-lg font-medium mb-4">Test Cases</h2>
          {module.testCases.length === 0 ? (
            <p>No test cases yet.</p>
          ) : (
            <ul>
              {module.testCases.map((tc) => (
                <li key={tc.id}>
                  <a
                    href={`/projects/${projectId}/modules/${moduleId}/test-cases/${tc.id}`}
                  >
                    {tc.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      }
      rightContent={
        <div>
          <CreateTestCaseForm projectId={projectId} moduleId={moduleId} />
          <div className="flex gap-4 mt-4">
            <ModuleAIReview
              moduleId={moduleId}
              testCases={(testCases || []).map((tc) => ({
                id: tc.id,
                title: tc.title,
              }))}
            />
            <ModuleAIGenerate moduleId={module.id} />
          </div>
          </div >}
          extraRightContent={

            <ModuleBehaviorClient
               projectId={module.project.id}
                moduleId={module.id}
                existingBehaviors={behaviors}
              />

 
          }
      />
   
  );
}
