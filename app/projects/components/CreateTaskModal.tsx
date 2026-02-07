"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
} from "@mui/material";


type ProjectMember = {
  role: "OWNER" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function CreateTaskModal({
  open,
  onClose,
  projectId,
  members,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;

    setLoading(true);

    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        assignedToId: assignedToId || null,
        dueDate: dueDate || null,
      }),
    });

    setLoading(false);
    onClose();
    onCreated();

    // reset
    setTitle("");
    setDescription("");
    setAssignedToId("");
    setDueDate("");
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Task</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            select
            label="Assign to"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {members.map((m) => (
              <MenuItem key={m.user.id} value={m.user.id}>
                {m.user.name ?? "Unnamed user"}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Due date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !title.trim()}
        >
          {loading ? "Creating…" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
