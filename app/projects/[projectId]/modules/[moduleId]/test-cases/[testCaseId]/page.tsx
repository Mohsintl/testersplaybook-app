import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import TestCaseClient from "./TestCaseClient";

export default async function TestCaseDetailPage({
  params,
}: {
  params: {
    projectId: string;
    moduleId: string;
    testCaseId: string;
  };
}) {
  // ✅ MUST await params
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
    <TestCaseClient
      testCase={{
        id: testCase.id,
        title: testCase.title,
        steps: testCase.steps as string[],
        expected: testCase.expected,
        projectName: testCase.project.name,
        moduleName: testCase.module?.name ?? "",
      }}
    />
  );
}
