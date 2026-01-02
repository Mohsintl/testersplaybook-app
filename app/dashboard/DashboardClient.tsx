"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";

type TestRun = {
  id: string;
  name: string;
  project: {
    id: string;
    name: string;
  };
  startedAt: string;
  endedAt: string | null;
};

export default function DashboardClient() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setRuns(json.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <Box p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={600}>
        My Assigned Test Runs
      </Typography>

      {runs.length === 0 && (
        <Typography mt={2} color="text.secondary">
          No test runs assigned yet.
        </Typography>
      )}

      <Stack spacing={2} mt={3}>
        {runs.map((run) => (
          <Card key={run.id}>
            <CardContent>
              <Typography fontWeight={600}>
                {run.name}
              </Typography>

              <Typography color="text.secondary">
                Project: {run.project.name}
              </Typography>

              <Stack direction="row" spacing={1} mt={1}>
                {run.endedAt ? (
                  <Chip label="Completed" color="success" />
                ) : (
                  <Chip label="In Progress" color="warning" />
                )}
              </Stack>

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() =>
                  router.push(`/test-runs/${run.id}`)
                }
              >
                Continue Execution
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
