# Workflow - Issue by Issue (Strict Order)

This workflow enforces one issue at a time, in strict roadmap order.

## Core rules
- Only work on the next issue in the Roadmap Index.
- Each issue has a dependency; do not start if dependency is open.
- Every change goes through a PR; direct pushes to `main` are not allowed.
- One issue per branch and per PR.
- Scope is limited to the issue (no drive-by fixes).

## Step-by-step (issue lifecycle)
1) Select the next issue from the Roadmap Index.
2) Analyze the issue (see Analysis checklist).
3) Define a concrete plan (steps + risks + test plan).
4) Create branch from `main`:
   - `issue-<number>-short-slug`
5) Implement changes in small, reviewable commits.
6) Validate (local checks + manual QA where relevant).
7) Open PR with `Closes #<issue-number>` and complete the PR template.
8) CI must pass. Fix failures before merging.
9) Merge (squash), delete the branch, verify deployment.
10) Re-check the issue; close only when acceptance criteria are met.

## Analysis checklist (before coding)
- Read the issue and restate the problem in your own words.
- Identify the exact entry point (UI/action/API).
- Trace the full path:
  - UI component → handler → API route → DB query/policy.
- Inspect related files and data structures.
- Check external dependencies (Supabase/Stripe/Vercel).
- Confirm scope and acceptance criteria.
- Record the plan in the issue or PR.

## Validation checklist (after coding)
- Lint / typecheck / build.
- Manual QA for UI changes.
- Verify edge cases and error states.
- Confirm no regression in related areas.
- Update docs or scripts if needed.

## External systems changes (DB/Stripe/Supabase)
If a change touches external systems:
- Write a minimal, reversible script (SQL) in `cosmococktails-ecommerce/scripts/`.
- Document the change and its impact.
- List affected tables/policies/keys.
- Provide a rollback step.

## Automation in place
- PR Guard checks:
  - PR must include `Closes #<issue-number>`.
  - Dependency must be closed before merge.
- Status labels sync automatically:
  - PR opened → `Status: In Progress`
  - PR merged → `Status: Done`
- CI checks run on every PR for both apps (when relevant).

## Tips
- Keep PRs small; one issue per PR.
- If a dependency is blocked, mark the issue as `Status: Blocked`.
