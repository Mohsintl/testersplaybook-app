"use client";

import { useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(projectId: string, projectName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the project "${projectName}"? This will also delete all modules and test cases. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(projectId);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete project");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  }

  if (projects.length === 0) {
    return <p style={{ marginTop: "16px" }}>No projects found.</p>;
  }

  return (
    <ul style={{ marginTop: "16px", listStyle: "none", padding: 0 }}>
      {projects.map((project) => (
        <li
          key={project.id}
          style={{
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <a
            href={`/projects/${project.id}`}
            style={{ fontWeight: 500, flex: 1 }}
          >
            {project.name}
            {project.description && (
              <span
                style={{
                  marginLeft: "12px",
                  color: "#666",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                — {project.description}
              </span>
            )}
          </a>
          <button
            onClick={() => handleDelete(project.id, project.name)}
            disabled={deleting === project.id}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: deleting === project.id ? "not-allowed" : "pointer",
              opacity: deleting === project.id ? 0.6 : 1,
              fontSize: "14px",
            }}
          >
            {deleting === project.id ? "Deleting..." : "Delete"}
          </button>
        </li>
      ))}
    </ul>
  );
}
