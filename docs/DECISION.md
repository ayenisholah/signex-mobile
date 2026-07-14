# Decision Log

Accepted entries are append-only. Supersede an earlier decision with a new ID instead of rewriting history.

## DEC-0001 — Two public implementation repositories

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Maintain `signex-backend` and `signex-mobile` as separate public GitHub repositories. Do not create a third governance repository.
- Consequences: Cross-repository contracts and selected documentation require automation and explicit ownership.

## DEC-0002 — Shared documentation ownership

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: The backend repository owns canonical shared sections. Automation opens reviewed synchronization pull requests against the mobile repository.
- Consequences: Direct edits to generated shared sections in mobile are rejected by drift checks.

## DEC-0003 — Development deployment boundary

- Status: Accepted
- Date: 2026-07-14
- Scope: Backend
- Decision: GitHub deploys only staging/paper to one owner-supplied Docker-ready VPS. It performs no VPS, Docker, per-user, or production provisioning.
- Consequences: Host hardening, Docker installation, DNS, TLS prerequisites, deployment user, and runtime secrets are established outside the workflow.

## DEC-0004 — Public artifacts and versioned client

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Backend images are public GHCR packages tagged by immutable commit SHA. Backend API and event schemas generate a semantically versioned TypeScript package consumed at an exact version by mobile.
- Consequences: Images contain no secrets; incompatible contracts require a major package version and an accepted decision.

## DEC-0005 — Strict documentation impact gate

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Every ordinary pull request updates `CHANGELOG.md`. Other control documents are updated whenever their represented facts change.
- Consequences: Documentation drift is a merge failure, not deferred cleanup.
