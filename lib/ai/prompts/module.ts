export function analyzeModulePrompt(
  moduleName: string,
  testCases: any[]
): string {
  return `
You are a senior QA lead reviewing a test module.

Module name: ${moduleName}

Existing test cases:
${JSON.stringify(
  testCases.map(tc => ({
    title: tc.title,
    steps: tc.steps,
    expected: tc.expected,
  }))
)}

Analyze the test coverage and return ONLY valid JSON.

{
  "duplicate_test_cases": string[],
  "missing_coverage": string[],
  "risk_areas": string[],
  "overall_quality": "LOW" | "MEDIUM" | "HIGH"
}
`;
}
