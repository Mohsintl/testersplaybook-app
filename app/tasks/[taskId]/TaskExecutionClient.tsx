"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  TextField,
  Divider,
} from "@mui/material";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export default function TaskExecutionClient({
  task,
  editable,
}: {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    projectName: string;
    assignedTo: { id: string; name: string | null } | null;
    comments: Comment[];
  };
  editable: boolean;
}) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [comments, setComments] = useState<Comment[]>(task.comments);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateStatus(nextStatus: TaskStatus) {
    setStatus(nextStatus);

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
  }

  async function addComment() {
    if (!newComment.trim()) return;

    setSaving(true);

    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    const json = await res.json();
    const created = json.data;
    setComments((prev) => [
      ...prev,
      {
        id: created.id,
        content: created.content,
        authorName: created.author?.name ?? "Unknown",
        createdAt: created.createdAt,
      },
    ]);
    setNewComment("");
    setSaving(false);
  }

  return (
    <Box p={3} maxWidth={900}>
      {/* Header */}
      <Typography variant="h5" fontWeight={700}>
        {task.title}
      </Typography>
      <Typography color="text.secondary">
        Project: {task.projectName}
      </Typography>

      <Stack direction="row" spacing={2} mt={2}>
        <Chip label={`Status: ${status}`} />
        <Chip
          label={
            task.assignedTo
              ? `Assigned to ${task.assignedTo.name}`
              : "Unassigned"
          }
        />
      </Stack>

      {/* Description */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Task Description</Typography>
          <Typography color="text.secondary" mt={1}>
            {task.description || "No description provided."}
          </Typography>
        </CardContent>
      </Card>

      {/* Status Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Update Status</Typography>

          <Stack direction="row" spacing={1} mt={2}>
            {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map(
              (s) => (
                <Button
                  key={s}
                  variant={status === s ? "contained" : "outlined"}
                  onClick={() => updateStatus(s)}
                >
                  {s.replace("_", " ")}
                </Button>
              )
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Comments</Typography>

          {comments.length === 0 ? (
            <Typography color="text.secondary" mt={1}>
              No comments yet.
            </Typography>
          ) : (
            <Stack spacing={2} mt={2}>
              {comments.map((c) => (
                <Box key={c.id}>
                  <Typography fontWeight={600}>
                    {c.authorName}
                  </Typography>
                  <Typography>{c.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Stack>
          )}

          {/* Add Comment */}
          <TextField
            label="Add comment"
            multiline
            minRows={2}
            fullWidth
            sx={{ mt: 3 }}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            disabled={saving}
            onClick={addComment}
          >
            {saving ? "Adding…" : "Add Comment"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
