"use client";

import { useState } from "react";

interface Module {
  id: string;
  name: string;
  description: string | null;
}

export default function ModuleList({
  modules,
  projectId,
}: {
  modules: Module[];
  projectId: string;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(moduleId: string, moduleName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the module "${moduleName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(moduleId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/modules/${moduleId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        alert("Failed to delete module");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete module");
    } finally {
      setDeleting(null);
    }
  }

  if (modules.length === 0) {
    return <p style={{ marginTop: "12px" }}>No modules yet.</p>;
  }

  return (
    <ul style={{ marginTop: "12px", listStyle: "none", padding: 0 }}>
      {modules.map((module) => (
        <li
          key={module.id}
          style={{
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <a
            href={`/projects/${projectId}/modules/${module.id}`}
            style={{ fontWeight: 500, flex: 1 }}
          >
            {module.name}
            {module.description && (
              <span
                style={{
                  marginLeft: "12px",
                  color: "#666",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                — {module.description}
              </span>
            )}
          </a>
          <button
            onClick={() => handleDelete(module.id, module.name)}
            disabled={deleting === module.id}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: deleting === module.id ? "not-allowed" : "pointer",
              opacity: deleting === module.id ? 0.6 : 1,
              fontSize: "14px",
            }}
          >
            {deleting === module.id ? "Deleting..." : "Delete"}
          </button>
        </li>
      ))}
    </ul>
  );
}
