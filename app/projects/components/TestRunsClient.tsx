"use client";

/*
  TestRunsClient
  --------------
  Client widget that lists test runs for a project and provides a button
  to create a new run. Handles the empty-project case by showing a modal
  if there are no test cases.
*/
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Card, CardContent, TextField, Typography } from "@mui/material";


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
  const [setup, setSetup] = useState<any>({ environment: "", build: "", credentials: "", notes: "" });
  const [tempSetup, setTempSetup] = useState<any>(setup);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // We manage `tempSetup` at the parent level and render the form inline
  // to avoid remounting issues that reset input state.

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

    // This function is retained for direct creation (not used when modal flow is active)
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/test-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, setup }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.success) {
      setName("");
      setRuns((prevRuns) => [
        ...prevRuns,
        {
          id: json.data.id,
          name: json.data.name,
          startedAt: json.data.startedAt,
          endedAt: json.data.endedAt,
          status: "STARTED",
          setup: setup,
        },
      ]);

      router.refresh();
    }
  }

  // Open the setup modal when the user clicks Start Run — user can fill setup then confirm creation
  function openSetupModal() {
    if (!name) return;
    setTempSetup(setup);
    setSetupModalOpen(true);
  }

  async function confirmCreateWithSetup() {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/test-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, setup: tempSetup }),
    });

    const json = await res.json();
    setLoading(false);
    if (json.success) {
      setName("");
      setSetup(tempSetup);
      setRuns((prevRuns) => [
        ...prevRuns,
        {
          id: json.data.id,
          name: json.data.name,
          startedAt: json.data.startedAt,
          endedAt: json.data.endedAt,
          status: "STARTED",
          setup: tempSetup,
        },
      ]);
      setSetupModalOpen(false);
      router.refresh();
    } else {
      alert(json.error || "Failed to create test run");
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
      {/* Create */}
      <div style={{ marginTop: 12 }}>
        {/* <TestRunSetupForm onSave={(s) => setSetup(s)} /> */}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            placeholder="Regression v1"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ padding: 8, flex: 1 }}
          />

          <Button
            variant="contained"
            onClick={openSetupModal}
            disabled={loading}
          >
            {loading ? "Creating…" : "Start Run"}
          </Button>
        </div>
      </div>

      {/* Setup modal shown when user clicks Start Run */}
      <Dialog open={setupModalOpen} onClose={() => setSetupModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Execution Setup (optional)</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Provide execution setup details for this run, or skip to create the run without setup.
          </DialogContentText>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Execution Setup</Typography>

              <TextField
                label="Environment URL"
                fullWidth
                margin="normal"
                value={tempSetup.environment}
                onChange={(e) => setTempSetup({ ...tempSetup, environment: e.target.value })}
              />

              <TextField
                label="Build / Version"
                fullWidth
                margin="normal"
                value={tempSetup.build}
                onChange={(e) => setTempSetup({ ...tempSetup, build: e.target.value })}
              />

              <TextField
                label="Credentials"
                fullWidth
                margin="normal"
                value={tempSetup.credentials}
                onChange={(e) => setTempSetup({ ...tempSetup, credentials: e.target.value })}
              />

              <TextField
                label="Additional Notes"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                value={tempSetup.notes}
                onChange={(e) => setTempSetup({ ...tempSetup, notes: e.target.value })}
              />

            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmCreateWithSetup} disabled={loading}>
            {loading ? "Creating…" : "Create Run"}
          </Button>
        </DialogActions>
      </Dialog>

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
                  const newUserId = (e.target as HTMLSelectElement).value as string;
                  const previousUserId = run.assignedToId ?? "";

                  // Optimistic UI update so the selection appears immediately
                  setRuns(prev =>
                    prev.map(r => (r.id === run.id ? { ...r, assignedToId: newUserId || null } : r))
                  );

                  try {
                    const res = await fetch(`/api/test-runs/${run.id}/assign`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: newUserId }),
                    });

                    if (!res.ok) {
                      // Revert optimistic update on failure
                      setRuns(prev =>
                        prev.map(r => (r.id === run.id ? { ...r, assignedToId: previousUserId || null } : r))
                      );
                      const err = await res.json().catch(() => ({ error: 'Request failed' }));
                      alert(err?.error || 'Failed to assign user');
                    }
                    // If needed, we could call `router.refresh()` here to fully sync.
                  } catch (err) {
                    setRuns(prev =>
                      prev.map(r => (r.id === run.id ? { ...r, assignedToId: previousUserId || null } : r))
                    );
                    alert('Network error while assigning user');
                  }
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
