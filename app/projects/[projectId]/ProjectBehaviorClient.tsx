"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Button from "@mui/material/Button";
import { Box, Collapse, TextField, Typography } from "@mui/material";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

type Behavior = {
  id: string;
  userAction: string;
  systemResult: string;
};

export default function ProjectBehaviorClient({
  projectId,
  existingBehaviors,
}: {
  projectId: string;
  existingBehaviors: Behavior[];
}) {
  const [userAction, setUserAction] = useState("");
  const [systemResult, setSystemResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [behaviors, setBehaviors] = useState(existingBehaviors);
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
        `/api/projects/${projectId}/behaviours`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAction, systemResult }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save behavior");
      }

      setUserAction("");
      setSystemResult("");
      window.location.reload(); // simple & safe for MVP
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
      const res = await fetch(
        `/api/projects/${projectId}/behaviours/${selectedBehavior.id}`,
        {
          method: "DELETE",
        }
      );

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
      <Typography variant="h6" gutterBottom>
        Application Behavior / Flow
      </Typography>

      <Typography variant="body2" color="textSecondary" gutterBottom>
        Describe how the application behaves when a user performs an action.
      </Typography>

      {/* Existing behaviors */}
      {behaviors.length > 0 && (
        <ul style={{ marginBottom: "16px" }}>
          {behaviors.map((behavior) => (
            <li key={behavior.id} style={{ marginBottom: "6px" }}>
              👉 <strong>{behavior.userAction}</strong> → {behavior.systemResult}
              <Button
                onClick={() => openDeleteModal(behavior)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                ✕ Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Toggle Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm((prev) => !prev)}
        style={{ backgroundColor: "#ADD8E6", color: "#000" }} // Light blue background with black text
      >
        {showForm ? "Close Add Behavior Form" : "Add Project-Level Behaviors"}
      </Button>

      {/* Form */}
      <Collapse in={showForm} timeout="auto" unmountOnExit>
        <Box mt={2}>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="space-y-4"
            >
              <FormField
                name="userAction"
                render={() => (
                  <FormItem>
                    <FormLabel>User Action</FormLabel>
                    <FormControl>
                      <TextField
                        fullWidth
                        placeholder="User action (e.g. Clicks Login button)"
                        value={userAction}
                        onChange={(e) => setUserAction(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="systemResult"
                render={() => (
                  <FormItem>
                    <FormLabel>System Result</FormLabel>
                    <FormControl>
                      <TextField
                        fullWidth
                        placeholder="System result (e.g. Redirects to dashboard)"
                        value={systemResult}
                        onChange={(e) => setSystemResult(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                style={{ backgroundColor: "#ADD8E6", color: "#000" }}
              >
                {loading ? "Saving…" : "➕ Add Behavior"}
              </Button>

              {error && (
                <Typography color="error" mt={2}>
                  {error}
                </Typography>
              )}
            </form>
          </Form>
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
