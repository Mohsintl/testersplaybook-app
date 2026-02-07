# Test Run Lifecycle

Test runs are created at the project level and progress through a controlled lifecycle.

## Statuses
- STARTED: The run is created but not yet executing. Results are locked.
- IN_PROGRESS: Execution has begun. Results can be updated.
- COMPLETED: Execution is finished. The run is locked.

## Creation
- Only Owners can create test runs.
- A setup field is required when creating a run.
- All test cases in the project are pre-populated as Test Results with status UNTESTED.
- The run starts locked.

## Starting a Run
- Only the assigned contributor can start a run.
- Starting a run transitions it to IN_PROGRESS and unlocks results.

## Completing a Run
- A run can only be completed when IN_PROGRESS.
- Completing a run sets endedAt and locks the run to prevent further edits.

## Result Editing Rules
- Test results can only be updated when the parent run is IN_PROGRESS.
- Updates are allowed for the assigned contributor or the run creator.
