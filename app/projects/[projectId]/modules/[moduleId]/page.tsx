import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateTestCaseForm from "./CreateTestCaseForm";
import ModuleAIReview from "./ModuleAIReview";
import ModuleAIGenerate from "./modelAIGenerate";


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

  if (!module || module.projectId !== projectId) {
    return <p style={{ padding: "24px" }}>Module not found</p>;
  }
  const testCases = await prisma.testCase.findMany({
  where: { moduleId },
});


  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
        {module.name}
      </h1>

      <p style={{ marginTop: "8px", color: "#666" }}>
        Project: {module.project.name}
      </p>
      <CreateTestCaseForm
  projectId={projectId}
  moduleId={moduleId}
/>


      <h2 style={{ marginTop: "24px", fontSize: "18px" }}>
        Test Cases
      </h2>

      {module.testCases.length === 0 && (
        <p style={{ marginTop: "12px" }}>
          No test cases yet.
        </p>
      )}

      <ul style={{ marginTop: "12px" }}>
        {module.testCases.map((tc) => (
          <li key={tc.id} style={{ marginBottom: "8px" }}>
             <a
    href={`/projects/${projectId}/modules/${moduleId}/test-cases/${tc.id}`}
  >
    {tc.title}
  </a>
          </li>
        ))}
      </ul>
        <ModuleAIReview moduleId={moduleId}   testCases={testCases.map(tc => ({
    id: tc.id,
    title: tc.title,
  }))} />
  <ModuleAIGenerate moduleId={module.id} />


    </main>
  );
}
