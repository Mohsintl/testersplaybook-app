"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import CreateTaskModal from "./CreateTaskModal";

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

type ProjectMember = {
  role: "OWNER" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function TaskList({
  tasks,
  currentUserId,
  currentUserRole,
  projectId,
  members,
  canCreate,
}: {
  tasks: Task[];
  currentUserId: string;
  currentUserRole: "OWNER" | "CONTRIBUTOR";
  projectId: string;
  members: ProjectMember[];
  canCreate: boolean;
}) {
  const isContributor = currentUserRole === "CONTRIBUTOR";
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleCreated() {
    router.refresh();
  }

  if (tasks.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography fontSize={18} fontWeight={600}>
          Tasks
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{ alignSelf: "flex-start" }}
          >
            New Task
          </Button>
        )}
        <Typography color="text.secondary">
          {isContributor
            ? "No tasks yet. When an owner assigns tasks to you, they will appear here."
            : "No tasks yet. Create a task to get started."}
        </Typography>
        {canCreate && (
          <CreateTaskModal
            open={open}
            onClose={() => setOpen(false)}
            projectId={projectId}
            members={members}
            onCreated={handleCreated}
          />
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography fontSize={18} fontWeight={600}>
        Tasks
      </Typography>
      {canCreate && (
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ alignSelf: "flex-start" }}
        >
          New Task
        </Button>
      )}
      {isContributor && (
        <Typography color="text.secondary">
          You can update tasks assigned to you. Others are read-only.
        </Typography>
      )}
      {tasks.map((task) => {
        const isAssignedToMe = task.assignedTo?.id === currentUserId;
        return (
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

                  {isAssignedToMe && (
                    <Chip
                      label="Assigned to you"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}

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
        );
      })}
      {canCreate && (
        <CreateTaskModal
          open={open}
          onClose={() => setOpen(false)}
          projectId={projectId}
          members={members}
          onCreated={handleCreated}
        />
      )}
    </Stack>
  );
}
