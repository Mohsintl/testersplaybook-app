import { getAuthSession } from "@/lib/auth";
/*
  Projects Page (Server)
  ----------------------
  Loads and renders a list of projects for the current user. As a server
  component it performs authentication and queries the database, returning
  prepared data for client components.
*/
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
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: true,
      members: {
        where: { userId: session.user.id },
        select: {
          role: true,
        },
      },
        where: { userId: session.user.id },
        select:{
          role: true,
        }
  const projectsWithRole = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    role: project.ownerId === session.user.id ? "OWNER" : project.members[0]?.role ?? "CONTRIBUTOR",
  }));
=======
  const projectsWithRole = projects.map((project) =>  ({
    id: project.id,
    name: project.name,
    description: project.description,
    role: project.members[0]?.role ?? "CONTRIBUTOR",
  }));  
  
>>>>>>> recovered-branch
  return (
    <ProjectLayout
      title="Projects"
      description="Manage your projects"
      leftContent={<ProjectList projects={projectsWithRole} />}
      rightContent={<CreateProjectForm />}
    />
  );
}
