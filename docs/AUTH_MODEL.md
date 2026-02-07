# Authorization Model

Authorization is project-level only and uses two roles:
- OWNER
- CONTRIBUTOR

## Owner Capabilities
- Create and delete projects
- Invite members
- Create modules
- Create test runs and assign them
- Edit Product Specs
- Add and remove UI references
- Manage project-level behaviors

## Contributor Capabilities
- View project data
- Create and edit test cases
- Execute assigned test runs
- Update test results while a run is IN_PROGRESS
- Create tasks and add comments

## Notes
- Module-level behaviors are editable through the module UI. The API currently enforces authentication but does not add role checks.
- Some operations are strictly owner-only on the server (project deletion, module creation, test run creation, product spec edits, UI reference management).
