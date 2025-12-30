"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface Module {
  id: string;
  name: string;
  description: string | null;
}

export default function ModuleList({
  modules,
  projectId,
}: {
  modules: Module[];
  projectId: string;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(moduleId: string, moduleName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the module "${moduleName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(moduleId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/modules/${moduleId}`,
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
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(module.id, module.name)}
            disabled={deleting === module.id}
          >
            {deleting === module.id ? "Deleting..." : "Delete"}
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
