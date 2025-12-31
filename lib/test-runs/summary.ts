import { TestResultStatus } from "@prisma/client";

export function calculateTestRunSummary(
  results: { status: TestResultStatus }[]
) {
  const summary = {
    total: results.length,
    passed: 0,
    failed: 0,
    blocked: 0,
    overall: "NOT_STARTED" as
      | "PASSED"
      | "FAILED"
      | "PARTIAL"
      | "NOT_STARTED",
  };

  for (const r of results) {
    if (r.status === "PASSED") summary.passed++;
    if (r.status === "FAILED") summary.failed++;
    if (r.status === "BLOCKED") summary.blocked++;
  }

  if (summary.failed > 0) summary.overall = "FAILED";
  else if (summary.blocked > 0) summary.overall = "PARTIAL";
  else if (summary.total > 0) summary.overall = "PASSED";

  return summary;
}
