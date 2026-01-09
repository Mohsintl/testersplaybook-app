-- Add new enum values early so later migrations can safely reference them
ALTER TYPE "TestResultStatus" ADD VALUE IF NOT EXISTS 'UNTESTED';
ALTER TYPE "TestRunExecutionStatus" ADD VALUE IF NOT EXISTS 'STARTED';

