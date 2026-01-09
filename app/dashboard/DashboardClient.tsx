"use client";

/*
  DashboardClient
  ---------------
  Client component responsible for rendering dashboard UI: quick stats,
  assigned runs, completed runs, and runs created by the user. This file
  manages only presentation and client navigation; all data is passed in
  from the server component.
*/
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";

type AssignedRun = {
  id: string;
  name: string;
  startedAt: Date;
  project: {
    id: string;
    name: string;
  };
};



type CompletedRun = AssignedRun & {
  endedAt: Date;
};

type CreatedRun = {
  id: string;
  name: string;
  startedAt: Date;
  endedAt: Date | null;
  project: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
};

export default function DashboardClient({
  activeAssignedRuns,
  createdRuns,
  projectCount,
  completedAssignedRuns,
}: {
  activeAssignedRuns: AssignedRun[];
  createdRuns: CreatedRun[];
  projectCount: number;
  completedAssignedRuns: CompletedRun[];
}) {
  const router = useRouter();

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700}>
        Dashboard
      </Typography>
      {/* Quick stats derived from loaded runs */}
      <Typography color="text.secondary" mb={3}>
        Your current work and responsibilities
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Your current work and responsibilities
      </Typography>

      {/* QUICK STATS */}
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
                <Typography fontWeight={600}>
                  {run.name}
                </Typography>
                <Typography color="text.secondary">
                  Project: {run.project.name}
                </Typography>

                <Button
                  sx={{ mt: 1 }}
                  variant="contained"
                  onClick={() =>
                    router.push(`/test-runs/${run.id}`)
                  }
                >
                  View Execution
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
      ) : (
        <Stack spacing={2} mb={4}>
          {completedAssignedRuns.map((run) => (
            <Card key={run.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  {run.name}
                </Typography>

                <Typography color="text.secondary">
                  Project: {run.project.name}
                </Typography>

                <Chip
                  sx={{ mt: 1 }}
                  color="success"
                  label="Completed"
                />

                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() =>
                    router.push(`/test-runs/${run.id}`)
                  }
                >
                  View Execution Summary
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
covered-branch


      <Divider sx={{ my: 4 }} />

      {/* CREATED BY ME */}
      <Typography variant="h6" gutterBottom>
        Test Runs I Created
      </Typography>

      {createdRuns.length === 0 ? (
        <Typography color="text.secondary">
          You haven’t created any test runs yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {createdRuns.map((run) => (
            <Card key={run.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  {run.name}
                </Typography>

                <Typography color="text.secondary">
                  Project: {run.project.name}
                </Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    label={
                      run.endedAt ? "Completed" : "Active"
                    }
                    color={run.endedAt ? "success" : "warning"}
                  />
                  <Chip
                    label={
                      run.assignedTo
                        ? `Assigned to ${run.assignedTo.name}`
                        : "Unassigned"
                    }
                  />
                </Stack>

                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() =>
                    router.push(`/test-runs/${run.id}`)
                  }
                >
                  View Execution
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
