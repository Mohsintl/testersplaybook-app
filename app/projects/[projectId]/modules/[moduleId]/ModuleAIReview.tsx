"use client";

import { useState } from "react";


export default function ModuleAIReview({
  moduleId,testCases=[],
}: {
  moduleId: string;
   testCases?: {
    id: string;
    title: string;
  }[];
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  type ModuleReviewResult = {
  overall_quality: "LOW" | "MEDIUM" | "HIGH";
  risk_areas: string[];
  missing_coverage: string[];
  duplicate_test_cases: string[];
};
if (!testCases || testCases.length === 0) {
  return (
    <div style={{ padding: "12px", color: "#666" }}>
      No test cases available for AI review.
    </div>
  );
}

  async function handleReview() {
    setLoading(true);

    const res = await fetch("/api/ai/module/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId }),
    });

    const json = await res.json();
    setResult(json.data);
    setLoading(false);
  }
  function QualityBadge({ quality }: { quality: string }) {
  const color =
    quality === "HIGH" ? "green" :
    quality === "MEDIUM" ? "orange" :
    "red";

  return (
    <span style={{ color, fontWeight: 600 }}>
      {quality}
    </span>
  );
}

const getTitleById = (id: string) => {
  if (!testCases || testCases.length === 0) return "Unknown test case";
  return (
    testCases.find(tc => tc.id === id)?.title ??
    "Unknown test case"
  );
};

function renderItem(item: any) {
  if (typeof item === "string") {
    return item;
  }

  // Duplicate test case object
  if (item.test_case_ids && item.reason) {
    return (
      <>
        <strong>Cases:</strong> <ul>
        {item.test_case_ids.map((id: string) => (
          <li key={id}>{getTitleById(id)}</li>
        ))}
      </ul> <br />
        <strong>Reason:</strong> {item.reason}
      </>
    );
  }

  // Fallback (safe)
  return JSON.stringify(item);
}

function Section({
  title,
  items,
}: {
  title: string;
  items: any[];
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <h4>{title}</h4>

      {items.length === 0 ? (
        <p style={{ color: "#666" }}>None</p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}




  return (
    <div style={{ marginTop: 24 }}>
      
      <button onClick={handleReview} disabled={loading}>
        {loading ? "Reviewing…" : "🤖 Review module"}
      </button>
{result && (
  <div style={{ marginTop: 20 }}>
    <h3>
      Overall Quality:{" "}
      <QualityBadge quality={result.overall_quality} />
    </h3>

    <Section title="⚠️ Risk Areas" items={result.risk_areas} />
    <Section title="🧩 Missing Coverage" items={result.missing_coverage} />
    <Section title="🔁 Duplicate Test Cases" items={result.duplicate_test_cases} />

    <button onClick={() => setResult(null)} style={{ marginTop: 12, color: 'red' }}>
      Close
    </button>
  </div>
)}

    </div>
  );
}

