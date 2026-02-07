"use client";

/*
  modelAIGenerate
  ---------------
  Client utility that triggers AI-assisted generation for module content.
  This component is purely UI-triggered and calls the AI API route.
*/
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import AIUsageDialog from "@/components/ai/AIUsageDialog";

type GeneratedTestCase = {
  title: string;
  steps: string[];
  expected: string;
};

export default function ModuleAIGenerate({
  moduleId,
  canAdd,
}: {
  moduleId: string;
  canAdd: boolean;
}) {
  const router = useRouter();

  const [generated, setGenerated] = useState<GeneratedTestCase[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLimitOpen, setAiLimitOpen] = useState(false);
  const [aiLimitMessage, setAiLimitMessage] = useState<string | null>(null);
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);

  // Toggle checkbox
  function toggle(index: number) {
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }

  // 🔹 Generate test cases with AI
  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/testcase/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });

      const json = await res.json().catch(() => ({}));

      // structured AI usage response
      if (!res.ok) {
        if (res.status === 429 || json?.code === "AI_USAGE_LIMIT") {
          setAiLimitMessage(json?.error ?? "You have reached your AI usage limit.");
          setAiRemaining(typeof json?.remaining === "number" ? json.remaining : null);
          setAiLimitOpen(true);
          setLoading(false);
          return;
        }

        throw new Error(json.error || "AI generation failed");
      }

      // IMPORTANT: backend returns { success, data: { generated_test_cases } }
      setGenerated(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Add selected test cases to module
  async function handleAddSelected() {
    if (selected.length === 0) {
      alert("Select at least one test case");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const selectedTestCases = selected.map(
        (index) => generated[index]
      );

      const res = await fetch(
        `/api/modules/${moduleId}/test-cases/bulk-create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testCases: selectedTestCases,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add test cases");
      }

      // Refresh module page to show new test cases
      router.refresh();
      setGenerated([]);
      setSelected([]);
    } catch (err: any) {
      setError(err.message || "Failed to save test cases");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section >
      {/* <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
        🤖 AI Generate Test Cases
      </h3> */}

      {/* Generate Button */}
      {generated.length === 0 && canAdd && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
             marginTop: 24 
          }}
        >
          {/* <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
        🤖 AI Generate Test Cases
      </h3> */}
          {loading ? "Generating…" : <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
        🤖 AI Generate Test Cases
      </h3>}
        </button>
      )}

      {/* Generated list */}
      {generated.map((tc, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginTop: "12px",
            borderRadius: "6px",
          }}
        >
          {canAdd ? (
            <label style={{ display: "block", marginBottom: "6px" }}>
              <input
                type="checkbox"
                checked={selected.includes(index)}
                onChange={() => toggle(index)}
              />{" "}
              <strong>{tc.title}</strong>
            </label>
          ) : (
            <strong>{tc.title}</strong>
          )}

          <ul>
            {tc.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>

          <p>
            <strong>Expected:</strong> {tc.expected}
          </p>
        </div>
      ))}

      {/* Add Selected Button */}
      {generated.length > 0 && canAdd && (
        <button
          onClick={handleAddSelected}
          disabled={saving}
          style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "black",
            color: "white",
            borderRadius: "6px",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Adding…" : "➕ Add Selected Test Cases"}
        </button>
      )}

      {/* Close Button */}
      {generated.length > 0 && (
        <button
          onClick={() => setGenerated([])}
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "red",
            color: "white",
            borderRadius: "6px",
          }}
        >
          Close
        </button>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>
          {error}
        </p>
      )}

      <AIUsageDialog
        open={aiLimitOpen}
        onClose={() => setAiLimitOpen(false)}
        message={aiLimitMessage}
        remaining={aiRemaining}
      />
    </section>
  );
}
