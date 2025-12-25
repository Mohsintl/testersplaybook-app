export function canEditProject(role: string): boolean {
  return role === 'OWNER' || role === 'CONTRIBUTOR';
}

export function canDeleteProject(role: string): boolean {
  return role === 'OWNER';
}