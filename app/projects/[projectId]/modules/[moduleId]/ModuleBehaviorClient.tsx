"use client";

import { useState } from "react";
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
import { useForm } from "react-hook-form";

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
      setBehaviors((prev) => [...prev, newBehavior]);
      setUserAction("");
      setSystemResult("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/modules/${moduleId}/behaviors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete behavior");

      setBehaviors((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

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
            <li key={`${moduleId}-${b.id}`} style={{ marginBottom: "8px" }}>
              👉 <strong>{b.userAction}</strong> → {b.systemResult}
              <button
                onClick={() => handleDelete(b.id)}
                style={{ marginLeft: "8px", color: "red" }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

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
                    placeholder="User action (e.g. Clicks Save button)"
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
                    placeholder="System result (e.g. Shows success toast)"
                    value={systemResult}
                    onChange={(e) => setSystemResult(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "➕ Add Module Behavior"}
          </Button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </Form>
    </section>
  );
}
