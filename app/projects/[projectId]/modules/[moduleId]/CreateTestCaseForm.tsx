"use client";

import { useState } from "react";

export default function CreateTestCaseForm({
  projectId,
  moduleId,
}: {
  projectId: string;
  moduleId: string;
}) {
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !steps || !expected) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/test-cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        steps: steps.split("\n"),
        expected,
        moduleId,
      }),
    });

    if (!res.ok) {
      setError("Failed to create test case");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
      <h3 style={{ marginBottom: "8px" }}>Create Test Case</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: "8px", width: "300px" }}
      />

      <textarea
        placeholder="Steps (one per line)"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        style={{ display: "block", marginBottom: "8px", width: "300px", height: "80px" }}
      />

      <input
        placeholder="Expected result"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
        style={{ display: "block", marginBottom: "8px", width: "300px" }}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Add Test Case"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
