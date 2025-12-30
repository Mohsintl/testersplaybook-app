"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function CreateTestCaseForm({
  projectId,
  moduleId,
}: {
  projectId: string;
  moduleId: string;
}) {
  const form = useForm({
    defaultValues: {
      title: "",
      steps: "",
      expected: "",
    },
  });

  const { handleSubmit } = form;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(data: {
    title: string;
    steps: string;
    expected: string;
  }) {
    if (!data.title || !data.steps || !data.expected) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/test-cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        steps: data.steps.split("\n"),
        expected: data.expected,
        moduleId,
      }),
    });

    if (!res.ok) {
      setError("Failed to create test case");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm(!showForm)}
        sx={{ mb: 2 }}
      >
        {showForm ? "Close Form" : "Create Test Case"}
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ mt: 4 }}>
            <h3 className="text-lg font-medium">Create Test Case</h3>

            <TextField
              label="Title"
              variant="outlined"
              {...form.register("title")}
              placeholder="Title"
              fullWidth
            />

            <TextField
              label="Steps (one per line)"
              variant="outlined"
              {...form.register("steps")}
              placeholder="Steps (one per line)"
              multiline
              rows={6}
              fullWidth
            />

            <TextField
              label="Expected Result"
              variant="outlined"
              {...form.register("expected")}
              placeholder="Expected result"
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Add Test Case"}
              </Button>
            </Stack>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </Stack>
        </form>
      )}
    </div>
  );
}
