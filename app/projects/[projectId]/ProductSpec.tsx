"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

type ProductSpec = {
  overview?: string | null;
  coreFlows?: string | null;
  notes?: string | null;
};

export default function ProductSpecs({
  projectId,
  canEdit,
}: {
  projectId: string;
  canEdit: boolean;
}) {
  const [spec, setSpec] = useState<ProductSpec>({
    overview: "",
    coreFlows: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/specs`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setSpec(json.data);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  async function saveSpecs() {
    setSaving(true);
    await fetch(`/api/projects/${projectId}/specs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    });
    setSaving(false);
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          📘 Product Specifications
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Product Overview"
            placeholder="What is this product about?"
            multiline
            minRows={2}
            value={spec.overview ?? ""}
            disabled={!canEdit}
            onChange={(e) =>
              setSpec({ ...spec, overview: e.target.value })
            }
          />

          <TextField
            label="Core Flows"
            placeholder="High-level user flows, edge cases, assumptions"
            multiline
            minRows={3}
            value={spec.coreFlows ?? ""}
            disabled={!canEdit}
            onChange={(e) =>
              setSpec({ ...spec, coreFlows: e.target.value })
            }
          />

          <TextField
            label="Additional Notes"
            placeholder="Anything testers / devs should know"
            multiline
            minRows={2}
            value={spec.notes ?? ""}
            disabled={!canEdit}
            onChange={(e) =>
              setSpec({ ...spec, notes: e.target.value })
            }
          />

          {canEdit && (
            <Button
              variant="contained"
              onClick={saveSpecs}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Specs"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
