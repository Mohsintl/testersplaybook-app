"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
/*
  ModuleList
  ----------
  Renders a project's modules with links. This is a presentational
  component; data should be provided by a server component.
*/
import Typography from "@mui/material/Typography";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface Module {
  id: string;
  name: string;
  description: string | null;
}

export default function ModuleList({
  modules,
  projectId,
  canDelete,
}: {
  modules: Module[];
  projectId: string;
  canDelete: boolean;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<
    { id: string; name: string } | null
  >(null);

  const openDeleteModal = (module: { id: string; name: string }) => {
    setSelectedModule(module);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedModule(null);
    setModalOpen(false);
  };

  async function handleDelete() {
    if (!selectedModule) return;

    setDeleting(selectedModule.id);
    setModalOpen(false);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/modules/${selectedModule.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        alert("Failed to delete module");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete module");
    } finally {
      setDeleting(null);
    }
  }

  if (modules.length === 0) {
    return <Typography sx={{ mt: 2 }}>No modules yet.</Typography>;
  }

  return (
    <>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {modules.map((module) => (
          <Stack
            key={module.id}
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <a
              href={`/projects/${projectId}/modules/${module.id}`}
              style={{ flex: 1, textDecoration: "none", color: "inherit" }}
            >
              <Typography variant="h6" component="span">
                {module.name}
              </Typography>
              {module.description && (
                <Typography
                  variant="body2"
                  component="span"
                  sx={{ ml: 1, color: "text.secondary" }}
                >
                  — {module.description}
                </Typography>
              )}
            </a>
            {canDelete && (
              <Button
                variant="contained"
                color="error"
                onClick={() => openDeleteModal(module)}
                disabled={deleting === module.id}
              >
                {deleting === module.id ? "Deleting..." : "Delete"}
              </Button>
            )}
          </Stack>
        ))}
      </Stack>

      {canDelete && selectedModule && (
        <DeleteConfirmationModal
          open={modalOpen}
          title="Confirm Delete"
          message={`Are you sure you want to delete the module "${selectedModule.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </>
  );
}
