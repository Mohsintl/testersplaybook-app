# AI Features

AI in TestersPlaybook is human-in-the-loop. It provides suggestions and analysis but does not auto-save changes.

## Available AI Actions
- Generate test cases for a module
- Improve a specific test case
- Analyze a module for quality, risks, missing coverage, duplicates, and title issues

## Usage Limits
AI usage is tracked per user and per action. The current default limit is:
- Generate: 1 per day
- Improve: 1 per day
- Analyze: 1 per day

When the limit is reached, the API returns a 429 error with a structured response.

## Inputs Used
AI prompts use project description, behaviors, module context, and existing test cases to avoid duplicates and stay in scope.
