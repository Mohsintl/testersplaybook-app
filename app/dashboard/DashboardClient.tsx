"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  project: {
    id: string;
    name: string;
  };
};

type TestRun = {
  id: string;
  name: string;
  startedAt: Date;
  endedAt: Date | null;
  project: {
    id: string;
    name: string;
  };
};

/* ---------------- COMPONENT ---------------- */

export default function DashboardClient({
  assignedTasks = [],
  assignedRuns = [],
  completedTasks = [],
  completedRuns = [],
  createdTasks = [],
  createdRuns = [],
  projectCount = 0,
}: {
  assignedTasks?: Task[];
  assignedRuns?: TestRun[];
  completedTasks?: Task[];
  completedRuns?: TestRun[];
  createdTasks?: Task[];
  createdRuns?: TestRun[];
  projectCount?: number;
}) {
  const router = useRouter();

  return (
    <Box p={3}>
      {/* Header */}
      <Typography variant="h5" fontWeight={700}>
        Dashboard
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Your tasks and test executions across all projects
      </Typography>

      {/* QUICK STATS */}
      <Stack direction="row" spacing={2} mb={4}>
        <Chip label={`Projects: ${projectCount}`} />
        <Chip label={`Assigned tasks: ${assignedTasks.length}`} />
        <Chip label={`Assigned runs: ${assignedRuns.length}`} />
      </Stack>

      {/* ASSIGNED TO ME */}
      <Typography variant="h6" gutterBottom>
        Assigned to Me
      </Typography>

      {assignedTasks.length === 0 && assignedRuns.length === 0 ? (
        <Typography color="text.secondary" mb={3}>
          Nothing assigned to you right now 🎉
        </Typography>
      ) : (
        <Stack spacing={2} mb={4}>
          {assignedTasks.map((task) => (
            <Card key={task.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  🧩 {task.title}
                </Typography>
                <Typography color="text.secondary">
                  Project: {task.project.name}
                </Typography>
                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() =>
                    router.push(`/projects/${task.project.id}?tab=tasks`)
                  }
                >
                  View Task
                </Button>
              </CardContent>
            </Card>
          ))}

          {assignedRuns.map((run) => (
            <Card key={run.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  🧪 {run.name}
                </Typography>
                <Typography color="text.secondary">
                  Project: {run.project.name}
                </Typography>
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  onClick={() => router.push(`/test-runs/${run.id}`)}
                >
                  Open Execution
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 4 }} />

      {/* COMPLETED */}
      <Typography variant="h6" gutterBottom>
        Completed by Me
      </Typography>

      {completedTasks.length === 0 && completedRuns.length === 0 ? (
        <Typography color="text.secondary">
          No completed work yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {completedTasks.map((task) => (
            <Card key={task.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  ✅ {task.title}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {completedRuns.map((run) => (
            <Card key={run.id}>
              <CardContent>
                <Typography fontWeight={600}>
                  🧪 {run.name}
                </Typography>
                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() => router.push(`/test-runs/${run.id}`)}
                >
                  View Summary
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      <Divider sx={{ my: 4 }} />

      {/* ================= CREATED BY ME ================= */}
      <Typography variant="h6" gutterBottom>
        Created by Me
      </Typography>

      {createdTasks.length === 0 && createdRuns.length === 0 ? (
        <Typography color="text.secondary">
          You haven’t created any tasks or test runs yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {createdTasks.map((task) => (
            <Card key={`created-task-${task.id}`}>
              <CardContent>
                <Typography fontWeight={600}>
                  🧩 {task.title}
                </Typography>

                <Typography color="text.secondary">
                  Project: {task.project.name}
                </Typography>

                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() =>
                    router.push(
                      `/tasks/${task.id}`
                    )
                  }
                >
                  Manage Task
                </Button>
              </CardContent>
            </Card>
          ))}

          {createdRuns.map((run) => (
            <Card key={`created-run-${run.id}`}>
              <CardContent>
                <Typography fontWeight={600}>
                  🧪 {run.name}
                </Typography>

                <Typography color="text.secondary">
                  Project: {run.project.name}
                </Typography>

                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={() => router.push(`/test-runs/${run.id}`)}
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
