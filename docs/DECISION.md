# Decision Log

Accepted entries are append-only. Supersede an earlier decision with a new ID instead of rewriting history.

## DEC-0001 — Two public implementation repositories

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Maintain `perpeto-backend` and `perpeto-mobile` as separate public GitHub repositories. Do not create a third governance repository.
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

## DEC-0007 — Google and Apple identity with Perpeto-authoritative sessions

- Status: Accepted
- Date: 2026-07-14
- Scope: Shared
- Decision: Replace password, magic-link, phone, and guest authentication with native Google and Apple identity. Provider subjects are keyed by `(provider, provider_subject)` and are never matched or merged by email. Perpeto remains authoritative for pending approval, users, roles, mandatory privileged-role TOTP, recovery codes, devices, rotating sessions, step-up proofs, revocation, and deletion. Access tokens are 15-minute Ed25519 JWTs held in memory; device-bound opaque refresh tokens rotate once and are stored hashed server-side and in mobile Secure Store. The first socially authenticated user consumes a one-use deployment bootstrap token to become Owner.
- Consequences: Open registration creates an isolated `PENDING` account; approval initially grants Viewer. Apple and Google codes/tokens require server-side issuer, audience, signature, expiry, state, nonce, subject, and replay checks. Explicit linking requires fresh authentication (plus TOTP for privileged users), the final provider and final Owner are protected, and deletion erases PII/provider credentials while immutable evidence retains only a non-identifying audit pseudonym. Biometrics and Android authentication are deferred.

## DEC-0008 — Authentication runtime dependency set

- Status: Accepted
- Date: 2026-07-18
- Scope: Backend
- Decision: Implement the M1 authentication HTTP runtime with `axum`/`tokio`/`tower-http` (transport), `sqlx` with the Postgres/rustls driver (transactional persistence and the migrator behind `funding-arb-migrate`), `jsonwebtoken` (RS256 verification of Apple/Google identity tokens via cached JWKS), `reqwest` with rustls (JWKS fetch), and `ed25519-dalek`, `aes-gcm`, `hmac`/`sha1`, `sha2`, `subtle`, `rand`, and `uuid` for token signing, TOTP-secret encryption, TOTP, hashing, constant-time comparison, and identifiers. Access-token JWTs are minted and verified with Ed25519 directly (compact EdDSA), keeping DEC-0007's asymmetric access-token requirement without a third-party JWT signer. Application logic lives in a transport-free `funding-arb-auth-service` crate; `funding_arb_domain::auth` remains dependency-free and owns the invariants.
- Consequences: The standard library cannot provide asynchronous TLS Postgres access, JWKS signature verification, or authenticated symmetric encryption within the milestone, so these dependencies are justified under the operating contract. Provider verification is expressed through an `IdentityTokenVerifier` trait so handlers are testable with injected verifiers and locally issued tokens. Local Windows builds require a C toolchain and linker for the crypto/async dependencies; compilation and the database-backed test suite run on Linux CI (a Postgres service) and in the release container.

## DEC-0009 — Interim open registration for the shared v1 backend

- Status: Accepted
- Date: 2026-07-19
- Scope: Shared
- Decision: Version 1 runs a single shared backend for development and TestFlight. Gate a self-service registration mode behind `PERPETO_OPEN_REGISTRATION` (default false). When enabled, a new social sign-in is admitted immediately as an active account with the full privileged role set (`OWNER`, `TRADER`, `APPROVER`), and TOTP MFA is waived, so each tester can exercise the complete app without a pending queue, Owner approval, or authenticator setup. This deliberately relaxes DEC-0007's "open registration creates a `PENDING` account; approval initially grants Viewer" and the PRODUCT_SPEC mandatory-privileged-role-MFA rule for this deployment only. Version 2 provisions an isolated backend per user and restores gated approval and MFA; this decision is superseded at that point.
- Consequences: The flag is off by default, so isolated or production deployments keep the strict DEC-0007 flow — the pending-approval and Owner-approval endpoints, screens, and the one-use bootstrap-Owner path remain in the codebase and behave unchanged when the flag is unset. Because every open-registration user is a privileged Owner without MFA, step-up-gated and identity-linking flows that require a TOTP proof are not usable under the flag; they return with v2 isolation. The mobile client shows instant-access sign-in copy for the shared v1 build. The waiver is a documented, reversible deployment policy applied in the service layer (`compute_next`), not in `funding_arb_domain::auth`, whose invariants stay strict.

## DEC-0010 — Deterministic M2 paper supervision thresholds

- Status: Accepted
- Date: 2026-07-20
- Scope: Shared
- Decision: M2 Slice 5a uses the existing effective unmatched-exposure limit (`RiskLimits::max_unmatched()`) and two consecutive scenario ticks to trigger corrective paper re-hedging. The engine separates real scan sleep from a configurable simulated-time step so the four-snapshot `t0→t3` path is exercised deterministically.
- Consequences: This is a paper-fixture simplification for repeatable milestone evidence, not the live risk policy. The PRODUCT_SPEC §6.2 greater-of-USD-100/5-bps threshold with three seconds of elapsed persistence must be implemented before live execution and cannot be inferred from the tick counter.
