export function reviewTestCasePrompt(testCase: any): string {
  return `
You are a senior QA engineer.

Review the following test case and identify problems.

Test case:
Title: ${testCase.title}
Steps: ${JSON.stringify(testCase.steps)}
Expected: ${testCase.expected}

Return ONLY valid JSON:
{
  "issues": string[],
  "missing_scenarios": string[],
  "suggested_improvements": string[]
}
`;
}

export function generateTestCasesPrompt(testCases: any[]): string {
  return `
You are a QA engineer.

Based on the following existing test cases, generate 3 NEW test cases
that cover missing edge cases. Do NOT repeat existing scenarios.

Existing test cases:
${JSON.stringify(testCases)}

Return ONLY JSON:
{
  "generated_test_cases": [
    { "title": string, "steps": string[], "expected": string }
  ]
}
`;
}

export function improveTestCasePrompt(testCase: any): string {
  return `
Improve the clarity and correctness of this test case.

Test case:
Title: ${testCase.title}
Steps: ${JSON.stringify(testCase.steps)}
Expected: ${testCase.expected}

Return ONLY JSON:
{
  "improved_title": string,
  "improved_steps": string[],
  "improved_expected": string
}
`;
}
