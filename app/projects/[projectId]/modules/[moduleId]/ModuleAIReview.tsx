"use client";

import { useState } from "react";

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
}: {
  moduleId: string;
  testCases?: TestCase[];
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

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

    const json = await res.json();

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
      <button onClick={handleReview} disabled={loading}>
        {loading ? "Reviewing…" : "🤖 Review Module"}
      </button>

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
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <h4>{title}</h4>
      <div>{children}</div>
    </div>
  );
}
