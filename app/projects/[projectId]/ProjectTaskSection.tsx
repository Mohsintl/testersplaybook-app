"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import CreateTaskModal from "../components/CreateTaskModal";

type ProjectMember = {
  role: "OWNER" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function ProjectTasksSection({
  projectId,
  members,
  canCreate,
}: {
  projectId: string;
  members: ProjectMember[];
  canCreate: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleCreated() {
    // Refresh data on the client after a task is created
    router.refresh();
  }

  return (
    <>
      {canCreate && (
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ mb: 2 }}
        >
          ➕ New Task
        </Button>
      )}

      {canCreate && (
        <CreateTaskModal
          open={open}
          onClose={() => setOpen(false)}
          projectId={projectId}
          members={members}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
