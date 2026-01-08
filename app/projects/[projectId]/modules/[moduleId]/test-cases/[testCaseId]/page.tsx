import { getAuthSession } from "@/lib/auth";
/*
  TestCase Page (Server)
  ----------------------
  Server component that loads a single TestCase for viewing/editing.
  It prepares the data (including normalizing JSON `steps`) for the
  corresponding client component.
*/
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import TestCaseClient from "./TestCaseClient";
import ProjectLayout from "@/app/projects/components/ProjectLayout";

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
    select: {
      id: true,
      title: true,
      steps: true,
      expected: true,
      tags: true,
      projectId: true,
      moduleId: true,
      project: {
        select: { name: true },
      },
      module: {
        select: { name: true },
      },
    },
  });

  if (
    !testCase ||
    testCase.projectId !== projectId ||
    testCase.moduleId !== moduleId
  ) {
    return <p style={{ padding: 24 }}>Test case not found</p>;
  }

  return (
    <ProjectLayout
      title={testCase.title}
      // description={project.description ?? "No description"}
      leftContent={<TestCaseClient
        testCase={{
          id: testCase.id,
          title: testCase.title,
          steps: testCase.steps as string[],
          expected: testCase.expected,
          // tags: testCase.tags,
          projectName: testCase.project.name,
          moduleName: testCase.module?.name ?? "",
        }} />} description={""} rightContent={undefined}    />

  );
}
