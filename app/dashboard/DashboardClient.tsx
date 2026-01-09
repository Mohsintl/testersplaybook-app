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
  Divider,
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
      {/* Quick stats derived from loaded runs */}
      <Typography color="text.secondary" mb={3}>
        Your current work and responsibilities
      </Typography>

      {/* derive simple stats from `runs` so the component is self-contained */}
      {(() => {
        const projectCount = new Set(runs.map(r => r.project.id)).size;
        const activeAssignedRuns = runs.filter(r => !r.endedAt);
        const completedAssignedRuns = runs.filter(r => r.endedAt);
        const createdRuns = runs;

        return (
          <>
            <Stack direction="row" spacing={2} mb={4}>
              <Chip label={`Projects: ${projectCount}`} />
              <Chip label={`Assigned runs: ${activeAssignedRuns.length}`} />
              <Chip label={`Completed runs: ${completedAssignedRuns.length}`} />
              <Chip label={`Created runs: ${createdRuns.length}`} />
            </Stack>

            {/* ASSIGNED TO ME */}
            <Typography variant="h6" gutterBottom>
              Assigned to Me
            </Typography>

            {activeAssignedRuns.length === 0 ? (
              <Typography color="text.secondary" mb={3}>
                No test runs assigned to you.
              </Typography>
            ) : (
              <Stack spacing={2} mb={4}>
                {activeAssignedRuns.map((run) => (
                  <Card key={run.id}>
                    <CardContent>
                      <Typography fontWeight={600}>{run.name}</Typography>
                      <Typography color="text.secondary">Project: {run.project.name}</Typography>
                      <Button sx={{ mt: 1 }} variant="contained" onClick={() => router.push(`/test-runs/${run.id}`)}>
                        Start / Resume Execution
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Completed by me section  */}
            <Typography variant="h6" gutterBottom>
              Completed Test Runs
            </Typography>

            {completedAssignedRuns.length === 0 ? (
              <Typography color="text.secondary" mb={3}>
                You haven’t completed any test runs yet.
              </Typography>
            ) : null}
          </>
        );
      })()}

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
