import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateModuleForm from "./CreateModuleForm";
import ModuleList from "./ModuleList";


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
    <main style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600 }}>
        {project.name}
      </h1>

      <p style={{ marginTop: "8px", color: "#666" }}>
        {project.description ?? "No description"}
      </p>

      <h2 style={{ marginTop: "24px", fontSize: "18px" }}>
        Modules
      </h2>

      <CreateModuleForm projectId={projectId} />

      <ModuleList modules={project.modules} projectId={projectId} />
    </main>
  );
}
