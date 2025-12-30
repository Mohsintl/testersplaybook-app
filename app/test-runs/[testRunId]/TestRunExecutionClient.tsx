"use client";

type TestRunExecutionClientProps = {
  testRun: {
    id: string;
    name: string;
    projectName: string;
    results: {
      id: string;
      status: "PASSED" | "FAILED" | "BLOCKED";
      notes: string | null;
      testCase: {
        id: string;
        title: string;
        steps: unknown; // Prisma Json
        expected: string;
      };
    }[];
  };
};

export default function TestRunExecutionClient({
  testRun,
}: TestRunExecutionClientProps) {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>
        {testRun.name}
      </h1>

      <p style={{ color: "#666" }}>
        Project: {testRun.projectName}
      </p>

      <hr style={{ margin: "16px 0" }} />

      {testRun.results.length === 0 && (
        <p>No test cases in this run.</p>
      )}

      {testRun.results.map((result) => {
        const steps = Array.isArray(result.testCase.steps)
          ? result.testCase.steps
          : [];

        return (
          <div
            key={result.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 6,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontWeight: 600 }}>
              {result.testCase.title}
            </h3>

            <ol>
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p>
              <strong>Expected:</strong>{" "}
              {result.testCase.expected}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {result.status}
            </p>
          </div>
        );
      })}
    </main>
  );
}
