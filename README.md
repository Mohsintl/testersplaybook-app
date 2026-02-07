# TestersPlaybook

TestersPlaybook is an early-stage, production-intended SaaS for indie developers and small teams who need a practical way to manage manual testing, lightweight collaboration, and task work before they outgrow spreadsheets.

It is not an enterprise Jira replacement or a full Agile suite. It is a focused, human-first workspace for test design, execution, and follow-through.

## Who It Is For
- Indie developers testing their own products
- Small product teams without dedicated QA infrastructure
- Contributors who need clear assignments and simple execution flows

## What It Does (Today)
- Projects, modules, and test cases for manual QA
- Test runs with status lifecycle STARTED -> IN_PROGRESS -> COMPLETED
- Execution tracking with per-case status: UNTESTED, PASSED, FAILED, BLOCKED and optional notes
- Task management for generic work items (not test-only)
- Bugs logged during execution, linked to cases/runs/projects
- Product Specs (rich-text) editable by owners, read-only for contributors
- UI References (image-based) to anchor testing against designs/screens
- AI assistance for test case generation, improvement, and module analysis (human-in-the-loop)

## Owners vs Contributors
- Owners manage the project, invite members, create test runs, edit Product Specs, and manage UI references.
- Contributors participate in testing, execute assigned runs, and contribute tasks and comments.

## AI Assistance (Human-in-the-Loop)
AI features are designed to assist, not replace, testers:
- Generate new test cases for a module
- Improve a specific test case
- Analyze a module for risks, gaps, and duplicates

AI usage is rate-limited per user and per action (current default is 1 per day for each action).

## Why Not Jira or TestRail?
- Jira and TestRail are powerful, but heavy.
- TestersPlaybook is intentionally lighter: fewer concepts, less configuration, and faster setup.
- It is for the stage before you need enterprise workflows.

## Current MVP Scope
- Google OAuth authentication
- Projects with Owners and Contributors
- Modules and behaviors (project and module level)
- Manual test cases (steps stored as JSON)
- Test runs with locking after completion
- Test execution with notes per test case
- Bugs linked to runs and cases
- Tasks with assignment, due dates, and comments
- Product Specs (owner editable)
- UI References (owner managed)
- AI test case generation, improvement, and module analysis
- Dashboard for assigned work

## What's Coming Later (Planned / Not Built Yet)
- Payments and subscriptions
- Marketplace for paid testers (idea only)

---

## Local Development

```bash
npm run dev
```

Then open http://localhost:3000.
