"use client";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
} from "@mui/material";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
};

export default function TaskList({
  tasks,
}: {
  tasks: Task[];
}) {
  if (tasks.length === 0) {
    return (
      <Typography color="text.secondary">
        No tasks created yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {tasks.map((task) => (
        <Card key={task.id} variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={600}>
                {task.title}
              </Typography>

              {task.description && (
                <Typography color="text.secondary">
                  {task.description}
                </Typography>
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={task.status}
                  size="small"
                />

                {task.assignedTo && (
                  <Chip
                    label={`Assigned to: ${task.assignedTo.name ?? "User"}`}
                    size="small"
                    variant="outlined"
                  />
                )}

                {task.dueDate && (
                  <Chip
                    label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                    size="small"
                    color="warning"
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
