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

  async function handleDelete(behaviorId: string) {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/behaviours/${behaviorId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete behavior");
      }

      window.location.reload(); // Refresh the page to reflect changes
    } catch (err) {
      console.error("Error deleting behavior:", err);
    }
  }

  return (
    <section style={{ marginTop: "32px" }}>
      <Typography variant="h6" gutterBottom>
        Application Behavior / Flow
      </Typography>

      <Typography variant="body2" color="textSecondary" gutterBottom>
        Describe how the application behaves when a user performs an action.
      </Typography>

      {/* Existing behaviors */}
      {existingBehaviors.length > 0 && (
        <ul style={{ marginBottom: "16px" }}>
          {existingBehaviors.map((behavior) => (
            <li key={behavior.id} style={{ marginBottom: "6px" }}>
              👉 <strong>{behavior.userAction}</strong> → {behavior.systemResult}
              <button
                onClick={() => handleDelete(behavior.id)}
                style={{
                  marginLeft: "10px",
                  color: "red",
                  cursor: "pointer",
                }}
              >
                ✕ Delete
              </button>
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
    </section>
  );
}
