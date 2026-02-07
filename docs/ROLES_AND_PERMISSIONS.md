# Roles and Permissions

TestersPlaybook uses project-level roles only. A user can be an Owner in one project and a Contributor in another.

## OWNER
Typical responsibilities:
- Owns the project
- Manages members and invitations
- Creates modules
- Creates and assigns test runs
- Manages Product Specs and UI References

Server-enforced owner-only actions:
- Delete project
- Create modules
- Create test runs
- Edit Product Specs
- Add or remove UI References

## CONTRIBUTOR
Typical responsibilities:
- Execute assigned test runs
- Update test results and notes while a run is IN_PROGRESS
- Create tasks and collaborate via comments
- Create and edit test cases in modules

## Shared Access
Both Owners and Contributors can:
- View project data
- View test cases and test runs
- View Product Specs and UI References

## Notes
- Module behaviors are editable through the module UI; the API currently enforces authentication but does not add role checks.
- Project-level behaviors are owner-managed.
