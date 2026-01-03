import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectLayout from "./components/ProjectLayout";
import CreateProjectForm from "./CreateProjectForm";
import ProjectList from "./ProjectList";

export default async function ProjectsPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const projects = await prisma.project.findMany({
    where: {
     members: {
      some: {userId: session.user.id},
     },
    },
    include: {
            owner: true,
      members: {
        where: { userId: session.user.id },
        select:{
          role: true,
        }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectsWithRole = projects.map((project) =>  ({
    id: project.id,
    name: project.name,
    description: project.description,
    role: project.members[0]?.role ?? "CONTRIBUTOR",
  }));  
  
  return (
    <ProjectLayout
      title="Projects"
      description="Manage your projects"
      leftContent={<ProjectList projects={projectsWithRole} />}
      rightContent={<CreateProjectForm />}
    />
  );
}
