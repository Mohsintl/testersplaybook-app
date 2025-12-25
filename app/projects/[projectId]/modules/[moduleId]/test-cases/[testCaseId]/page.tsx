import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TestCaseDetailPage({
  params,
}: {
  params: Promise<{
    projectId: string;
    moduleId: string;
    testCaseId: string;
  }>;
}) {
  const { projectId, moduleId, testCaseId } = await params;

  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: {
      module: true,
      project: true,
    },
  });

  if (
    !testCase ||
    testCase.projectId !== projectId ||
    testCase.moduleId !== moduleId
  ) {
    return <p style={{ padding: "24px" }}>Test case not found</p>;
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
        {testCase.title}
      </h1>

      <p style={{ marginTop: "8px", color: "#666" }}>
        Project: {testCase.project.name}
      </p>
      <p style={{ marginTop: "4px", color: "#666" }}>
        Module: {testCase.module?.name}
      </p>

      <h2 style={{ marginTop: "24px", fontSize: "18px" }}>
        Steps
      </h2>

      <ol style={{ marginTop: "8px" }}>
        {(testCase.steps as string[]).map((step, index) => (
          <li key={index} style={{ marginBottom: "6px" }}>
            {step}
          </li>
        ))}
      </ol>

      <h2 style={{ marginTop: "24px", fontSize: "18px" }}>
        Expected Result
      </h2>

      <p style={{ marginTop: "8px" }}>
        {testCase.expected}
      </p>
    </main>
  );
}
