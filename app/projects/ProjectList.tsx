"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

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
    return <Typography sx={{ mt: 2 }}>No projects found.</Typography>;
  }

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {projects.map((project) => (
        <Stack
          key={project.id}
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <a href={`/projects/${project.id}`} style={{ flex: 1 }}>
            <Typography variant="h6" component="span">
              {project.name}
            </Typography>
            {project.description && (
              <Typography
                variant="body2"
                component="span"
                sx={{ ml: 1, color: "text.secondary" }}
              >
                — {project.description}
              </Typography>
            )}
          </a>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(project.id, project.name)}
            disabled={deleting === project.id}
          >
            {deleting === project.id ? "Deleting..." : "Delete"}
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
