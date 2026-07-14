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

## DEC-0006 — Solo-maintainer branch-protection bypass

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Required checks, pull requests, code-owner review, and linear history apply normally, but administrator enforcement remains disabled while the repository has only one trusted maintainer. Enable administrator enforcement when an independent reviewer is available.
- Consequences: The owner can perform an auditable emergency or bootstrap push; routine work still uses pull requests. Admin bypass must not be used to conceal a failing check.

## DEC-0007 — Google and Apple identity with Signex-authoritative sessions

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Replace password, magic-link, phone, and guest authentication with native Google and Apple identity. Provider subjects are keyed by `(provider, provider_subject)` and are never matched or merged by email. Signex remains authoritative for pending approval, users, roles, mandatory privileged-role TOTP, recovery codes, devices, rotating sessions, step-up proofs, revocation, and deletion. Access tokens are 15-minute Ed25519 JWTs held in memory; device-bound opaque refresh tokens rotate once and are stored hashed server-side and in mobile Secure Store. The first socially authenticated user consumes a one-use deployment bootstrap token to become Owner.
- Consequences: Open registration creates an isolated `PENDING` account; approval initially grants Viewer. Apple and Google codes/tokens require server-side issuer, audience, signature, expiry, state, nonce, subject, and replay checks. Explicit linking requires fresh authentication (plus TOTP for privileged users), the final provider and final Owner are protected, and deletion erases PII/provider credentials while immutable evidence retains only a non-identifying audit pseudonym. Biometrics and Android authentication are deferred.
