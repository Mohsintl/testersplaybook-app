"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { Box, Collapse } from "@mui/material";
import TextField from "@mui/material/TextField";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

type Behavior = {
  id: string;
  userAction: string;
  systemResult: string;
};

export default function ModuleBehaviorClient({
  projectId,
  moduleId,
  existingBehaviors,
}: {
  projectId: string;
  moduleId: string;
  existingBehaviors: Behavior[];
}) {
  const [behaviors, setBehaviors] = useState(existingBehaviors);
  const [userAction, setUserAction] = useState("");
  const [systemResult, setSystemResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState<Behavior | null>(null);
  const form = useForm();

  async function handleAdd() {
    if (!userAction || !systemResult) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/modules/${moduleId}/behaviors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAction,
            systemResult,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save behavior");

      const newBehavior = await res.json();
      setBehaviors((prev) => [...prev, newBehavior.data]); // Ensure the new behavior is added to the list dynamically
      setUserAction("");
      setSystemResult("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const openDeleteModal = (behavior: Behavior) => {
    setSelectedBehavior(behavior);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedBehavior(null);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedBehavior) return;

    setDeleting(selectedBehavior.id);
    setModalOpen(false);

    try {
      const res = await fetch(`/api/modules/${moduleId}/behaviors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedBehavior.id }),
      });

      if (!res.ok) {
        alert("Failed to delete behavior");
        return;
      }

      setBehaviors((prev) => prev.filter((b) => b.id !== selectedBehavior.id));
    } catch (err) {
      console.error("Error deleting behavior:", err);
      alert("Failed to delete behavior");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section style={{ marginTop: "32px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
        Module Behavior / Flow
      </h3>

      <p style={{ color: "#666", marginBottom: "12px" }}>
        Describe how this module behaves when users interact with it.
      </p>

      {behaviors.length > 0 && (
        <ul style={{ marginBottom: "16px" }}>
          {behaviors.map((b) => (
            <li key={`${b.id}`} style={{ marginBottom: "8px" }}>
              👉 <strong>{b.userAction}</strong> → {b.systemResult}
              <Button
                onClick={() => openDeleteModal(b)}
                style={{ marginLeft: "8px", color: "red" }}
              >
                ✕ Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm((prev) => !prev)}
        style={{ marginBottom: "16px", backgroundColor: "#ADD8E6", color: "#000" }}
      >
        {showForm ? "Close Add Behavior Form" : "Add Module-Level Behaviors"}
      </Button>

      <Collapse in={showForm} timeout="auto" unmountOnExit>
        <Box mt={2}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <TextField
              label="User Action"
              placeholder="User action (e.g. Clicks Save button)"
              value={userAction}
              onChange={(e) => setUserAction(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              label="System Result"
              placeholder="System result (e.g. Shows success toast)"
              value={systemResult}
              onChange={(e) => setSystemResult(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? "Saving…" : "➕ Add Module Behavior"}
            </Button>

            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </Box>
      </Collapse>

      {selectedBehavior && (
        <DeleteConfirmationModal
          open={modalOpen}
          title="Confirm Delete"
          message={`Are you sure you want to delete the behavior "${selectedBehavior.userAction}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </section>
  );
}
