"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Link from "next/link";

type TestRun = {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string | null;
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
      router.refresh(); // re-fetch from server
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
          <li key={run.id} style={{ marginBottom: 6 }}>
            <Link href={`/test-runs/${run.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              🧪 {run.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
