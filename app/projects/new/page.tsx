"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
} from "@mui/material";

export default function NewProjectPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createProject() {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to create project");
      }

      // Always go through entry
      router.push("/entry");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 5 }}>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight={700}>
              Create a new project
            </Typography>

            <Typography color="text.secondary">
              This represents the product or application you want to test.
            </Typography>

            <TextField
              label="Project name"
              placeholder="e.g. Payments App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              label="Description (optional)"
              placeholder="What does this product do?"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {error && (
              <Typography color="error">
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={createProject}
              disabled={loading}
            >
              {loading ? "Creating…" : "Create project"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
