"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  Grid,
  Chip,
} from "@mui/material";

type UIReference = {
  id: string;
  title: string;
  imageUrl: string;
  source: "FIGMA" | "SCREENSHOT" | "OTHER";
  description?: string | null;
};

export default function UIReferences({
  projectId,
  canEdit,
}: {
  projectId: string;
  canEdit: boolean;
}) {
  const [refs, setRefs] = useState<UIReference[]>([]);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    source: "SCREENSHOT",
    description: "",
  });

  useEffect(() => {
    fetch(`/api/projects/${projectId}/ui-references`)
      .then((r) => r.json())
      .then((json) => setRefs(json.data || []));
  }, [projectId]);

  async function addReference() {
    const res = await fetch(
      `/api/projects/${projectId}/ui-references`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const json = await res.json();
    setRefs((prev) => [json.data, ...prev]);
    setForm({
      title: "",
      imageUrl: "",
      source: "SCREENSHOT",
      description: "",
    });
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          🎨 UI References
        </Typography>

        {canEdit && (
          <Stack spacing={2} mt={2}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <TextField
              label="Image / Figma URL"
              value={form.imageUrl}
              onChange={(e) =>
                setForm({ ...form, imageUrl: e.target.value })
              }
            />

            <Select
              value={form.source}
              onChange={(e) =>
                setForm({
                  ...form,
                  source: e.target.value as any,
                })
              }
              size="small"
            >
              <MenuItem value="SCREENSHOT">Screenshot</MenuItem>
              <MenuItem value="FIGMA">Figma</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>

            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <Button variant="contained" onClick={addReference}>
              Add Reference
            </Button>
          </Stack>
        )}

        <Grid container spacing={2} mt={2}>
          {refs.map((ref) => (
            <Grid item xs={12} md={6} key={ref.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={600}>
                    {ref.title}
                  </Typography>

                  <Chip
                    label={ref.source}
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                  >
                    {ref.description}
                  </Typography>

                  <Button
                    href={ref.imageUrl}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    Open Reference
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
