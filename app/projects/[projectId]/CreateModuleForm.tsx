"use client";

/*
  CreateModuleForm
  ----------------
  Client form for adding a module to a project. Posts form data to the
  projects API and reloads the page on success.
*/
import { useState } from "react";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function CreateModuleForm({
  projectId,
  canCreate,
}: {
  projectId: string;
  canCreate: boolean;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { handleSubmit, register } = form;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(data: { name: string; description: string }) {
    if (!data.name.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Failed to create module");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <div>
      {canCreate && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(!showForm)}
          sx={{ mb: 2 }}
        >
          {showForm ? "Close Form" : "Create Module"}
        </Button>
      )}

      {canCreate && showForm && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ mt: 4 }}>
            <TextField
              label="Module Name"
              variant="outlined"
              {...register("name")}
              placeholder="Module name"
              fullWidth
            />

            <TextField
              label="Module Description"
              variant="outlined"
              {...register("description")}
              placeholder="Module description"
              multiline
              rows={4}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Add Module"}
            </Button>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </Stack>
        </form>
      )}
    </div>
  );
}
