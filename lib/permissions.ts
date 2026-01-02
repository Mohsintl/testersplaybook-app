import { Role } from "@prisma/client";

export function isOwner(role?: Role | null) {
  return role === "OWNER";
}

export function canManageProject(role?: Role | null) {
  return role === "OWNER";
}

export function canExecuteTestRun(role?: Role | null) {
  return role === "OWNER" || role === "CONTRIBUTOR";
}
