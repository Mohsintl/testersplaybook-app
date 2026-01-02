import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectLayout from "./components/ProjectLayout";
import CreateProjectForm from "./CreateProjectForm";
import ProjectList from "./ProjectList";

export default async function ProjectsPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        {
          members: {
            some: { userId: session.user.id },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
if (projects.length === 0) {
    redirect("/welcome");
  }
  
  return (
    <ProjectLayout
      title="Projects"
      description="Manage your projects"
      leftContent={<ProjectList projects={projects} />}
      rightContent={<CreateProjectForm />}
    />
  );
}
