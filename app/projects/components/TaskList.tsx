"use client";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
} from "@mui/material";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignedTo?: { name: string | null };
};

export default function TaskList({
  tasks,
  onStatusChange,
}: {
  tasks: Task[];
  onStatusChange: (id: string, status: Task["status"]) => void;
}) {
  return (
    <Stack spacing={2}>
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent>
            <Typography fontWeight={600}>{task.title}</Typography>

            {task.description && (
              <Typography color="text.secondary" mt={1}>
                {task.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1} mt={2}>
              <Chip label={task.status} />
              {task.assignedTo?.name && (
                <Chip label={`👤 ${task.assignedTo.name}`} />
              )}
            </Stack>

            <Stack direction="row" spacing={1} mt={2}>
              {task.status !== "TODO" && (
                <Button size="small" onClick={() => onStatusChange(task.id, "TODO")}>
                  Todo
                </Button>
              )}
              {task.status !== "IN_PROGRESS" && (
                <Button size="small" onClick={() => onStatusChange(task.id, "IN_PROGRESS")}>
                  Start
                </Button>
              )}
              {task.status !== "DONE" && (
                <Button size="small" onClick={() => onStatusChange(task.id, "DONE")}>
                  Done
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
