"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";


type TestRun = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  assignedToId?: string | null;
};

type ProjectMember = {
  role: "OWNER" | "CONTRIBUTOR";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};


export default function TestRunsClient({
  projectId,
  initialRuns,
  members,
}: {
  projectId: string;
  initialRuns: TestRun[];
  members: ProjectMember[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState(initialRuns);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<TestRun | null>(null);
  const [noTestcasesOpen, setNoTestcasesOpen] = useState(false);

  async function fetchRuns() {
    console.log("Fetching updated runs...");
    const res = await fetch(`/api/projects/${projectId}/test-runs`);
    console.log("Fetch response status:", res.status);
    const json = await res.json();
    console.log("Fetch response data:", json);
    if (json.success) {
      setRuns(json.data);
      console.log("Updated runs state:", json.data);
    } else {
      console.error("Failed to fetch updated runs:", json);
    }
  }

  async function handleCreate() {
    if (!name) return;

    // Check if there are any test cases in the project
    try {
      const tcRes = await fetch(`/api/projects/${projectId}/test-cases`);
      if (!tcRes.ok) {
        // If forbidden/unauthorized, still attempt create which will return the proper error
      } else {
        const tcs = await tcRes.json();
        if (Array.isArray(tcs) && tcs.length === 0) {
          setNoTestcasesOpen(true);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to check test cases:", err);
      // proceed to attempt create and let server respond
    }

    setLoading(true);
    const res = await fetch(
      `/api/projects/${projectId}/test-runs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }
    );

    const json = await res.json();
    setLoading(false);

    if (json.success) {
      setName("");
      setRuns(prevRuns => [
        ...prevRuns,
        {
          id: json.data.id, // Assuming the API returns the new test run's ID
          name: json.data.name, // Assuming the API returns the new test run's name
          startedAt: json.data.startedAt, // Assuming the API returns the startedAt timestamp
          endedAt: json.data.endedAt, // Assuming the API returns the endedAt timestamp
          status: "STARTED", // New test runs are typically "STARTED"
        },
      ]);

      // Refresh the page to update initialRuns
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!runToDelete) return;

    console.log("Deleting test run:", runToDelete);
    const res = await fetch(
      `/api/projects/${projectId}/test-runs/${runToDelete.id}`,
      {
        method: "DELETE",
      }
    );

    console.log("Delete response status:", res.status);
    if (res.ok) {
      console.log("Test run deleted successfully.");
      await fetchRuns(); // Fetch updated runs after deletion
      setDeleteModalOpen(false);
      setRunToDelete(null);
    } else {
      console.error("Failed to delete test run:", await res.json());
    }
  }

  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>
        Test Runs
      </h2>

      {/* Create */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          placeholder="Regression v1"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />
        

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating…" : "Start Run"}
        </Button>
      </div>

      {/* List */}
      <ul style={{ marginTop: 16 }}>
        {runs.map(run => (
          <li key={run.id} style={{ marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href={`/test-runs/${run.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                🧪 {run.name}
              </Link>
              <span style={{ fontSize: 12, color: "gray" }}>
                {run.status === "COMPLETED" ? "Completed" : "In Progress"}
              </span>
            </div>
            <div>
              <Select
                size="small"
                value={run.assignedToId ?? ""}
                onChange={async (e) => {
                  await fetch(`/api/test-runs/${run.id}/assign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: e.target.value }),
                  });
                  router.refresh();
                }}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {members.map((m) => (
                  <MenuItem key={m.user.id} value={m.user.id}>
                    {m.user.name || m.user.email }
                    {m.role === "OWNER" ? " (Owner)" : ""}
                  </MenuItem>
                ))}
              </Select>

            </div>

            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                setRunToDelete(run);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>


      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRunToDelete(null);
        }}
        onConfirm={() => {
          handleDelete();
          setDeleteModalOpen(false);
        }}
        title="Delete Test Run"
        message={`Are you sure you want to delete the test run "${runToDelete?.name}"? This action cannot be undone.`}
      />

      <Dialog open={noTestcasesOpen} onClose={() => setNoTestcasesOpen(false)}>
        <DialogTitle>Cannot create test run</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This project has no test cases. Add at least one test case before creating a test run.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoTestcasesOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>

    </section>
  );
}
