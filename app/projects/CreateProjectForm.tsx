"use client";

import { useState } from "react";

export default function CreateProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      setError("Failed to create project");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        style={{ padding: "8px", width: "240px" }}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Project description"
        style={{ padding: "8px", width: "240px", marginLeft: "8px" }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{ marginLeft: "8px", padding: "8px" }}
      >
        {loading ? "Creating..." : "Add Project"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "8px" }}>{error}</p>
      )}
    </form>
  );
}
