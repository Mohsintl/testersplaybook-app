"use client";

import { useState } from "react";

export default function CreateModuleForm({
  projectId,
}: {
  projectId: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      setError("Failed to create module");
      setLoading(false);
      return;
    }

    // simple + reliable
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Module name"
        style={{ padding: "8px", width: "240px" }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Module description"
        style={{ padding: "8px", width: "240px", marginLeft: "8px" }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{ marginLeft: "8px", padding: "8px" }}
      >
        {loading ? "Creating..." : "Add Module"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "8px" }}>{error}</p>
      )}
    </form>
  );
}
