"use client";

/*
  ModuleAIReview
  --------------
  Client component that displays AI analysis for a module and allows
  the user to accept or apply suggested changes. Uses AI API routes.
*/
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import Section from "@/components/ui/Section";
import AIUsageDialog from "@/components/ai/AIUsageDialog";

type TestCase = {
  id: string;
  title: string;
};

type ReviewResult = {
  overall_quality?: "LOW" | "MEDIUM" | "HIGH";
  risk_areas?: string[];
  missing_coverage?: string[];
  duplicate_test_cases?: {
    test_case_ids: string[];
    reason: string;
  }[];
  title_issues?: {
    testCaseId: string;
    reason: string;
    suggested_title: string;
  }[];
};

export default function ModuleAIReview({
  moduleId,
  testCases = [], // ✅ SAFE DEFAULT
  canReview,
}: {
  moduleId: string;
  testCases?: TestCase[];
  canReview: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [aiLimitOpen, setAiLimitOpen] = useState(false);
  const [aiLimitMessage, setAiLimitMessage] = useState<string | null>(null);
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return (
      <div style={{ padding: 12, color: "#666" }}>
        No test cases available for AI review.
      </div>
    );
  }

  async function handleReview() {
    setLoading(true);

    const res = await fetch("/api/ai/module/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      // structured AI usage response
      if (res.status === 429 || json?.code === "AI_USAGE_LIMIT") {
        setAiLimitMessage(json?.error ?? "You have reached your AI usage limit.");
        setAiRemaining(typeof json?.remaining === "number" ? json.remaining : null);
        setAiLimitOpen(true);
        setLoading(false);
        return;
      }

      alert(json?.error || "AI review failed");
      setLoading(false);
      return;
    }

    // ✅ NORMALIZE RESULT
    setResult({
      overall_quality: json?.data?.overall_quality ?? "LOW",
      risk_areas: json?.data?.risk_areas ?? [],
      missing_coverage: json?.data?.missing_coverage ?? [],
      duplicate_test_cases: json?.data?.duplicate_test_cases ?? [],
      title_issues: json?.data?.title_issues ?? [],
    });

    setLoading(false);
  }

  const getTitle = (id: string) =>
    testCases.find((t) => t.id === id)?.title ?? "Unknown test case";

  return (
    <div style={{ marginTop: 24 }}>
      {canReview && (
        <button onClick={handleReview} disabled={loading}>
          {loading ? "Reviewing…" : "🤖 Review Module"}
        </button>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>
            Overall Quality:{" "}
            <strong>{result.overall_quality}</strong>
          </h3>

          <Section title="✏️ Title Issues">
            {result.title_issues!.length === 0
              ? "None"
              : result.title_issues!.map((t, i) => (
                  <div key={i}>
                    <strong>{getTitle(t.testCaseId)}</strong>
                    <br />
                    Reason: {t.reason}
                    <br />
                    Suggested: <em>{t.suggested_title}</em>
                  </div>
                ))}
          </Section>

          <Section title="🔁 Duplicate Test Cases">
            {result.duplicate_test_cases!.length === 0
              ? "None"
              : result.duplicate_test_cases!.map((d, i) => (
                  <div key={i}>
                    <strong>Cases:</strong>
                    <ul>
                      {d.test_case_ids.map((id) => (
                        <li key={id}>{getTitle(id)}</li>
                      ))}
                    </ul>
                    Reason: {d.reason}
                  </div>
                ))}
          </Section>

          <Section title="🧩 Missing Coverage">
            {result.missing_coverage!.length === 0
              ? "None"
              : result.missing_coverage!.join(", ")}
          </Section>

          <Section title="⚠️ Risk Areas">
            {result.risk_areas!.length === 0
              ? "None"
              : result.risk_areas!.join(", ")}
          </Section>

          <button
            onClick={() => setResult(null)}
            style={{ marginTop: 12, color: "red" }}
          >
            Close
          </button>
        </div>
      )}

      <AIUsageDialog
        open={aiLimitOpen}
        onClose={() => setAiLimitOpen(false)}
        message={aiLimitMessage}
        remaining={aiRemaining}
      />
    </div>
  );
}

// Section extracted to components/ui/Section.tsx
