export type AIReviewResult = {
  issues: string[];
  missing_scenarios: string[];
  suggested_improvements: string[];
};

export type AIGeneratedTestCase = {
  title: string;
  steps: string[];
  expected: string;
};

export type AIGenerateResult = {
  generated_test_cases: AIGeneratedTestCase[];
};

export type AIImproveResult = {
  improved_title: string;
  improved_steps: string[];
  improved_expected: string;
};
