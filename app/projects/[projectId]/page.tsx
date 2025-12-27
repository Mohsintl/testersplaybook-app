import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateModuleForm from "./CreateModuleForm";
import ModuleList from "./ModuleList";
import ProjectLayout from "../components/ProjectLayout";


export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params; // ✅ REQUIRED FIX

  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      modules: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    return <p style={{ padding: "24px" }}>Project not found</p>;
  }

  return (
    <ProjectLayout
      title={project.name}
      description={project.description ?? "No description"}
      leftContent={<ModuleList modules={project.modules} projectId={projectId} />}
      rightContent={<CreateModuleForm projectId={projectId} />}
    />
  );
}
