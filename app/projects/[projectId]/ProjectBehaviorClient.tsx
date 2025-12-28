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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <h2 style={{ fontSize: "18px", fontWeight: 600 }}>
        Application Behavior / Flow
      </h2>

      <p style={{ color: "#666", marginBottom: "12px" }}>
        Describe how the application behaves when a user performs an action.
      </p>

      {/* Existing behaviors */}
      {existingBehaviors.length > 0 && (
        <ul style={{ marginBottom: "16px" }}>
          {existingBehaviors.map((behavior) => (
            <li key={behavior.id} style={{ marginBottom: "6px" }}>
              <strong>{behavior.userAction}</strong> → {behavior.systemResult}
              <button
                onClick={() => handleDelete(behavior.id)}
                style={{
                  marginLeft: "10px",
                  color: "red",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Form */}
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
                  <Input
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
                  <Input
                    placeholder="System result (e.g. Redirects to dashboard)"
                    value={systemResult}
                    onChange={(e) => setSystemResult(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "➕ Add Behavior"}
          </Button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </Form>
    </section>
  );
}
