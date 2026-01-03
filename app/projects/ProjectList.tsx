"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Project {
  id: string;
  name: string;
  description: string | null;
  // role of the current user on this project (optional)
  role?: "OWNER" | "CONTRIBUTOR" ;
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<
    { id: string; name: string } | null
  >(null);

  const openDeleteModal = (project: { id: string; name: string }) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedProject(null);
    setModalOpen(false);
  };

  async function handleDelete() {
    if (!selectedProject) return;

    setDeleting(selectedProject.id);
    setModalOpen(false);

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
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
    return <Typography sx={{ mt: 2 }}>No projects found. create a new project or accept invite to be contributer </Typography>;
  }

  return (
    <>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {projects.map((project) => (
          <Stack
            key={project.id}
            direction="row"
            spacing={2}
            alignItems="center"
          >
            {project.role === "CONTRIBUTOR" ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(0,0,0,0.6)",
                  cursor: "default",
                }}
                title="Contributors cannot open this project"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Typography variant="h6" component="span">
                    {project.name}
                  </Typography>
                  {project.role && <Chip label={project.role} size="small" />}
                </div>
                {project.description && (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 1, color: "text.secondary" }}
                  >
                    — {project.description}
                  </Typography>
                )}
              </div>
            ) : (
              <a
                href={`/projects/${project.id}`}
                style={{ flex: 1, textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Typography variant="h6" component="span">
                    {project.name}
                  </Typography>
                  {project.role && (
                    <Chip label={project.role} size="small" />
                  )}
                </div>
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
            )}
            {project.role !== "CONTRIBUTOR" && (
              <Button
                variant="contained"
                color="error"
                onClick={() => openDeleteModal(project)}
                disabled={deleting === project.id}
              >
                {deleting === project.id ? "Deleting..." : "Delete"}
              </Button>
            )}
          </Stack>
        ))}
      </Stack>

      {selectedProject && (
        <DeleteConfirmationModal
          open={modalOpen}
          title="Confirm Delete"
          message={`Are you sure you want to delete the project "${selectedProject.name}"? This will also delete all modules and test cases. This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </>
  );
}
