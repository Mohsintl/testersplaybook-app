"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

type TestRun = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
  status:string;
};

export default function TestRunsClient({
  projectId,
  initialRuns,
}: {
  projectId: string;
  initialRuns: TestRun[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState(initialRuns);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<TestRun | null>(null);

  async function handleCreate() {
    if (!name) return;

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
          status: "IN_PROGRESS", // New test runs are typically "IN_PROGRESS"
        },
      ]);

      // Refresh the page to update initialRuns
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!runToDelete) return;

    const res = await fetch(
      `/api/projects/${projectId}/test-runs/${runToDelete.id}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      setRuns(runs.filter(run => run.id !== runToDelete.id));
      setDeleteModalOpen(false);
      setRunToDelete(null);
    }
    router.refresh();
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
    </section>
  );
}
