import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

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

  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600 }}>Your Projects</h1>

      {projects.length === 0 && (
        <p style={{ marginTop: "16px" }}>No projects found.</p>
      )}

      <ul style={{ marginTop: "16px" }}>
        {projects.map((project) => (
          <li key={project.id} style={{ marginBottom: "8px" }}>
           <a href={`/projects/${project.id}`}>{project.name}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
