"use client";

import { useState } from "react";

type Props = {
  testCase: {
    id: string;
    title: string;
    steps: string[];
    expected: string;
    projectName: string;
    moduleName: string;
  };
};

export default function TestCaseClient({ testCase }: Props) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<null | {
    improved_title: string;
    improved_steps: string[];
    improved_expected: string;
  }>(null);
  const [aiError, setAiError] = useState<string | null>(null);

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
          title: testCase.title,
          steps: testCase.steps,
          expected: testCase.expected,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "AI failed");
      }

      setAiResult(json.data);
    } catch (err: any) {
      setAiError(err.message || "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600 }}>
        {testCase.title}
      </h1>

      <p style={{ marginTop: "8px", color: "#666" }}>
        Project: {testCase.projectName}
      </p>
      <p style={{ marginTop: "4px", color: "#666" }}>
        Module: {testCase.moduleName}
      </p>

      <h2 style={{ marginTop: "24px", fontSize: "18px" }}>
        Steps
      </h2>

      <ol style={{ marginTop: "8px" }}>
        {testCase.steps.map((step, index) => (
          <li key={index} style={{ marginBottom: "6px" }}>
            {step}
          </li>
        ))}
      </ol>

      <h2 style={{ marginTop: "24px", fontSize: "18px" }}>
        Expected Result
      </h2>

      <p style={{ marginTop: "8px" }}>
        {testCase.expected}
      </p>

      {/* AI Button */}
      <button
        onClick={handleImproveWithAI}
        disabled={aiLoading}
        style={{
          marginTop: "24px",
          padding: "10px 14px",
          background: "black",
          color: "#fff",
          borderRadius: "6px",
          opacity: aiLoading ? 0.6 : 1,
        }}
      >
        {aiLoading ? "Improving…" : "🤖 Improve with AI"}
      </button>

      {/* Errors */}
      {aiError && (
        <p style={{ marginTop: "12px", color: "red" }}>
          {aiError}
        </p>
      )}

      {/* AI Result */}
      {aiResult && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#black",
          }}
        >
          <h3 style={{ fontWeight: 600, marginBottom: "8px" }}>
            AI Suggested Improvements
          </h3>

          <p><strong>Title:</strong> {aiResult.improved_title}</p>

          <p style={{ marginTop: "12px" }}>
            <strong>Steps:</strong>
          </p>
          <ol>
            {aiResult.improved_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <p style={{ marginTop: "12px" }}>
            <strong>Expected:</strong> {aiResult.improved_expected}
          </p>
          {aiResult && (
  <button
    onClick={async () => {
      const res = await fetch(
        `/api/testcases/${testCase.id}/apply-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: aiResult.improved_title,
            steps: aiResult.improved_steps,
            expected: aiResult.improved_expected,
          }),
        }
      );

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to apply AI changes");
      }
    }}
    style={{
      marginTop: "12px",
      padding: "8px 12px",
      background: "#0f172a",
      color: "#fff",
      borderRadius: "6px",
    }}
  >
    ✅ Apply AI Changes
  </button>
)}

        </div>
      )}
    </main>
  );
}
