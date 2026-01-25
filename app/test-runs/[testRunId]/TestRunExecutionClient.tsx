"use client";

/*
  TestRunExecutionClient
  ----------------------
  Client component for executing a TestRun.

  Responsibilities:
  - Render execution overview and per-module, per-test UI
  - Disable actions when the run is locked or not IN_PROGRESS
  - Start / Finish execution by calling server APIs

  Notes:
  - `isLocked` is derived from `testRun.isLocked` (preferred) or `endedAt` (fallback).
  - `actionsDisabled` prevents status/notes updates before start and after completion.
  This file contains only UI/interaction logic — persistence happens via API routes.
*/

import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";
import SetupModal from "@/components/test-run/SetupModal";

type TestResultStatus = "PASSED" | "FAILED" | "BLOCKED" | "UNTESTED";

type TestResult = {
  id: string;
  status: TestResultStatus;
  notes?: string | null;
  testCase: {
    id: string;
    title: string;
    steps: string[];
    expected: string;
  };
};

type ModuleExecution = {
  id: string;
  name: string;
  results: TestResult[];
};

type ExecutionSummary = {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  untested: number;
  overall: "PASSED" | "FAILED" | "PARTIAL" | "NOT_STARTED";
};

export default function TestRunExecutionClient({
  testRun,
  canEdit,
}: {

    testRun: {
    id: string;
    name: string;
    projectName: string;
      status: string;
      isLocked?: boolean;
      assignedToId?: string | null;
      modules: ModuleExecution[];
      endedAt: string;
      startedAt: string;
      results: TestResult[];
      summary: ExecutionSummary;
      setup?: {
        environment?: string;
        build?: string;
        credentials?: string;
        notes?: string;
      } | null;
  };
  canEdit?: boolean;
}) {
  /* ---------------- STATE ---------------- */
  const [modules, setModules] = useState<ModuleExecution[]>(testRun.modules);
  const [finishing, setFinishing] = useState(false);
  const [endedAt, setEndedAt] = useState<string | null>(testRun.endedAt);

  const isLocked = testRun.isLocked ?? Boolean(endedAt);

  const router = useRouter();
  const [finishError, setFinishError] = useState<string | null>(null);

  // Setup edit modal state (owner-only)
  const [editSetupOpen, setEditSetupOpen] = useState(false);
  const [tempSetup, setTempSetup] = useState<any>(testRun.setup ?? { environment: "", build: "", credentials: "", notes: "" });

  const actionsDisabled = isLocked || testRun.status !== "IN_PROGRESS";

 

  /* ---------------- SUMMARY ---------------- */
  const summary: ExecutionSummary = useMemo(() => {
    const allResults = modules.flatMap((m) => m.results);

    const passed = allResults.filter((r) => r.status === "PASSED").length;
    const failed = allResults.filter((r) => r.status === "FAILED").length;
    const blocked = allResults.filter((r) => r.status === "BLOCKED").length;
    const untested = allResults.filter((r) => r.status === "UNTESTED").length;

    let overall: ExecutionSummary["overall"] = "NOT_STARTED";
    if (failed > 0) overall = "FAILED";
    else if (blocked > 0) overall = "PARTIAL";
    else if (passed === allResults.length && allResults.length > 0)
      overall = "PASSED";

    return {
      total: allResults.length,
      passed,
      failed,
      blocked,
      untested,
      overall,
    };
  }, [modules]);

  /* ---------------- HELPERS ---------------- */
  function updateLocalResult(
    resultId: string,
    updates: Partial<TestResult>
  ) {
    setModules((prev) =>
      prev.map((module) => ({
        ...module,
        results: module.results.map((result) =>
          result.id === resultId
            ? { ...result, ...updates }
            : result
        ),
      }))
    );
  }

  async function updateStatus(
    resultId: string,
    status: TestResultStatus
  ) {
    // Guard: disallow status updates when actions are disabled (locked or not IN_PROGRESS)
    if (actionsDisabled) return;

    const result = findResultById(resultId);
    if (!result) return;

    updateLocalResult(resultId, { status });

    await fetch(`/api/test-results/${resultId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        notes: result.notes ?? "",
      }),
    });
  }

  async function saveNotes(resultId: string, notes: string) {
    // Guard: disallow saving notes when actions are disabled (locked or not IN_PROGRESS)
    if (actionsDisabled) return;

    await fetch(`/api/test-results/${resultId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  function findResultById(id: string): TestResult | null {
    for (const module of modules) {
      const found = module.results.find((r) => r.id === id);
      if (found) return found;
    }
    return null;
  }

  async function finishExecution() {
    // Prevent finishing when any test remains UNTESTED
    if (summary.untested > 0) {
      setFinishError(`Cannot finish execution: ${summary.untested} test(s) are UNTESTED.`);
      return;
    }

    setFinishError(null);
    setFinishing(true);

    await fetch(`/api/test-runs/${testRun.id}/complete`, {
      method: "POST",
    });

    setEndedAt(new Date().toISOString());
    router.refresh();
    setFinishing(false);
  }


  /* ---------------- UI ---------------- */
  return (
    <Box p={3}>
      {/* Header */}
      <Typography variant="h5" fontWeight={600}>
        {testRun.name}
      </Typography>
      <Typography color="text.secondary">
        {testRun.projectName}
      </Typography>

      {isLocked && (
        <Alert severity="info" sx={{ mt: 2 }}>
          This test run is completed and locked.
        </Alert>
      )}

      {/* Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Execution Overview</Typography>

          <Stack direction="row" spacing={2} mt={2}>
            <Chip label={`Total: ${summary.total}`} />
            <Chip color="success" label={`Passed: ${summary.passed}`} />
            <Chip color="error" label={`Failed: ${summary.failed}`} />
            <Chip color="warning" label={`Blocked: ${summary.blocked}`} />
            <Chip label={`Untested: ${summary.untested}`} variant="outlined" />
          </Stack>

          <Typography mt={2}>
            Overall Status: <strong>{testRun.status}</strong>
          </Typography>
          <Stack direction="row" spacing={2} mt={2}>
              {testRun.status === "STARTED" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    await fetch(`/api/test-runs/${testRun.id}/start`, {
                      method: "POST",
                    });
                    router.refresh();
                  }}
                >
                  ▶ Start Execution
                </Button>
              )}

            {!isLocked && testRun.status === "IN_PROGRESS" && (
              <>
                {finishError && (
                  <Alert severity="error">{finishError}</Alert>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  disabled={finishing || summary.untested > 0}
                  onClick={finishExecution}
                >
                  {finishing ? "Finishing…" : "✅ Finish Execution"}
                </Button>
              </>
            )}
          </Stack>

        </CardContent>
      </Card>

      {/* Execution Setup (if provided) */}
      {testRun.setup && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">Execution Setup</Typography>

            <Typography><strong>Environment:</strong> {testRun.setup.environment}</Typography>
            <Typography><strong>Build:</strong> {testRun.setup.build}</Typography>
            <Typography><strong>Credentials:</strong> {testRun.setup.credentials}</Typography>

            {testRun.setup.notes && (
              <Typography sx={{ mt: 1 }}>
                <strong>Notes:</strong> {testRun.setup.notes}
              </Typography>
            )}

            {/* Edit button visible only for owners/canEdit */}
            {canEdit && (
              <Button sx={{ mt: 2 }} onClick={() => { setTempSetup(testRun.setup); setEditSetupOpen(true); }}>
                ✏️ Edit Setup
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Owner edit modal for setup */}
      <SetupModal
        open={editSetupOpen}
        onClose={() => setEditSetupOpen(false)}
        tempSetup={tempSetup}
        setTempSetup={setTempSetup}
        loading={false}
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/test-runs/${testRun.id}/setup`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ setup: tempSetup }),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              alert(json?.error || "Failed to update setup");
              return;
            }

            setEditSetupOpen(false);
            router.refresh();
          } catch (err) {
            alert("Failed to update setup");
          }
        }}
      />

      {/* Module-wise Execution */}
      {modules.map((module) => (
        <Accordion key={module.id} defaultExpanded sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              {module.name} ({module.results.length})
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            {module.results.map((result) => (
              <Accordion key={result.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Typography fontWeight={600}>{result.testCase.title}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={result.status}
                        size="small"
                        variant={result.status === "UNTESTED" ? "outlined" : undefined}
                        color={(
                          result.status === "PASSED"
                            ? "success"
                            : result.status === "FAILED"
                              ? "error"
                              : result.status === "BLOCKED"
                                ? "warning"
                                : "default"
                        ) as any}
                      />
                    </Stack>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Card>
                    <CardContent>
                      <ul>
                        {result.testCase.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>

                      <Typography>
                        <strong>Expected:</strong>{" "}
                        {result.testCase.expected}
                      </Typography>

                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          variant={
                            (result.status ?? "UNTESTED") === "UNTESTED"
                              ? "contained"
                              : "outlined"
                          }
                          color="info"
                          disabled={actionsDisabled}
                          onClick={() => updateStatus(result.id, "UNTESTED")}
                        >
                          Untested
                        </Button>

                        <Button
                          variant={
                            result.status === "PASSED" ? "contained" : "outlined"
                          }
                          color="success"
                          disabled={actionsDisabled}
                          onClick={() => updateStatus(result.id, "PASSED")}
                        >
                          Pass
                        </Button>
                        <Button
                          variant={
                            result.status === "FAILED" ? "contained" : "outlined"
                          }
                          color="error"
                          disabled={actionsDisabled}
                          onClick={() => updateStatus(result.id, "FAILED")}
                        >
                          Fail
                        </Button>
                        <Button
                          variant={
                            result.status === "BLOCKED" ? "contained" : "outlined"
                          }
                          color="warning"
                          disabled={actionsDisabled}
                          onClick={() => updateStatus(result.id, "BLOCKED")}
                        >
                          Block
                        </Button>
                      </Stack>

                        <TextField
                        label="Execution Notes"
                        multiline
                        minRows={2}
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={actionsDisabled}
                        value={result.notes ?? ""}
                        onChange={(e) =>
                          updateLocalResult(result.id, {
                            notes: e.target.value,
                          })
                        }
                        onBlur={(e) => saveNotes(result.id, e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 4 }} />
    </Box>
  );
}
