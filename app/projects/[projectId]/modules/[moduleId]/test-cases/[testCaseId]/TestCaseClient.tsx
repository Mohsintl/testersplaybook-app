"use client";

/*
  TestCaseClient
  --------------
  Client component for viewing and editing a single TestCase. Handles local
  form state and sends updates to server API routes. This is a UI-only file
  and does not perform server-side loading.
*/
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  
} from "@mui/material";
import AIUsageDialog from "@/components/ai/AIUsageDialog";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

type Props = {
  testCase: {
    id: string;
    title: string;
    steps: string[];
    expected: string;
    projectName: string;
    moduleName: string;
  };
  canEdit: boolean;
};

export default function TestCaseClient({ testCase, canEdit }: Props) {
  const form = useForm({
    defaultValues: {
      title: testCase.title,
      steps: testCase.steps.join("\n"),
      expected: testCase.expected,
    },
  });


  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(testCase.title);
  const [steps, setSteps] = useState(testCase.steps.join("\n"));
  const [expected, setExpected] = useState(testCase.expected);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<null | {
    improved_title: string;
    improved_steps: string[];
    improved_expected: string;
  }>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLimitOpen, setAiLimitOpen] = useState(false);
  const [aiLimitMessage, setAiLimitMessage] = useState<string | null>(null);
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);

  /* ---------------- AI ---------------- */

  async function handleImproveWithAI() {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch("/api/ai/testcase/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testCaseId: testCase.id,
          title,
          steps: steps.split("\n"),
          expected,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429 || json?.code === "AI_USAGE_LIMIT") {
          setAiLimitMessage(json?.error ?? "You have reached your AI usage limit.");
          setAiRemaining(typeof json?.remaining === "number" ? json.remaining : null);
          setAiLimitOpen(true);
          setAiLoading(false);
          return;
        }
        throw new Error(json.error || "AI failed");
      }

      setAiResult(json.data);
    } catch (err: any) {
      setAiError(err.message || "AI failed");
    } finally {
      setAiLoading(false);
    }
  }

  /* ---------------- SAVE EDIT ---------------- */

  async function handleSave(data: {
    title: string;
    steps: string;
    expected: string;
  }) {
    setLoading(true);

    const res = await fetch(`/api/testcases/${testCase.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        steps: data.steps.split("\n"),
        expected: data.expected,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to save test case");
      return;
    }

    // Update local state with the new values
    setTitle(data.title);
    setSteps(data.steps);
    setExpected(data.expected);

    setEditMode(false);
  }

  /* ---------------- DELETE ---------------- */

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this test case?")) return;

    const res = await fetch(`/api/testcases/${testCase.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete test case");
      return;
    }

    // Go back to module page
    window.history.back();
  }

  /* ---------------- UI ---------------- */

  return (
    <main style={{ padding: 24 }}>
      {!editMode ? (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>{title}</h1>

          <p style={{ color: "#666" }}>
            Project: {testCase.projectName}
          </p>
          <p style={{ color: "#666" }}>
            Module: {testCase.moduleName}
          </p>

          <h2 style={{ marginTop: 24 }}>Steps</h2>
          <ol>
            {steps.split("\n").map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <h2 style={{ marginTop: 24 }}>Expected Result</h2>
          <p>{expected}</p>

          {/* ACTIONS */}
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {canEdit && (
              <Button variant="contained" onClick={() => setEditMode(true)}>
                ✏️ Edit
              </Button>
            )}
            {canEdit && (
              <Button variant="contained" color="error" onClick={handleDelete}>
                🗑 Delete
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleImproveWithAI}
              disabled={aiLoading}
            >
              🤖 Improve with AI
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave({ title, steps, expected }); }}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              disabled={!canEdit}
            />

            <TextField
              label="Steps"
              variant="outlined"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              multiline
              rows={6}
              fullWidth
              disabled={!canEdit}
            />

            <TextField
              label="Expected Result"
              variant="outlined"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              multiline
              rows={3}
              fullWidth
              disabled={!canEdit}
            />

            <Stack direction="row" spacing={2}>
              {canEdit && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  💾 Save
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      )}

      {/* AI RESULT */}
      {aiResult && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 6,
            background: "#f9fafb",
          }}
        >
          <h3>AI Suggested Improvements</h3>
          <p>
            <b>Title:</b> {aiResult.improved_title}
          </p>

          <ol>
            {aiResult.improved_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <p>
            <b>Expected:</b> {aiResult.improved_expected}
          </p>

          {canEdit && (
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                await fetch(`/api/testcases/${testCase.id}/apply-ai`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(aiResult),
                });
                window.location.reload();
              }}
            >
              ✅ Apply AI Changes
            </Button>
          )}
        </div>
      )}

      {aiError && <p style={{ color: "red" }}>{aiError}</p>}

      <AIUsageDialog
        open={aiLimitOpen}
        onClose={() => setAiLimitOpen(false)}
        message={aiLimitMessage}
        remaining={aiRemaining}
      />
    </main>
  );
}
