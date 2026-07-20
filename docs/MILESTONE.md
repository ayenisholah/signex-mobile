# Product Milestones

<!-- SHARED-CONTENT-VERSION: 2 -->

| ID | Milestone | Exit evidence | Status |
|---|---|---|---|
| M0 | Governance and scaffolding | Two repositories, protected workflow design, synchronized documents, executable scaffolds, contract seed, CI and paper staging automation | Implementation complete; `0.1.0` publication evidence pending |
| M1 | Foundations and simulator | Durable domain, auth, audit, deterministic simulator, ledger, Expo shell and generated client | In progress (M1A social-auth contract/domain) |
| M2 | Scanner and paper trading | Normalized markets, forecasts, opportunity/risk engine, coordinated paper lifecycle and complete mobile monitoring | In progress (Slice 5a: paper re-hedge and auto-exit; recovery/breakers next) |
| M3 | CEX integrations | Binance, Bybit and OKX contract suites, reconciliation and staged certification evidence | Not started |
| M4 | DEX integrations | dYdX, Hyperliquid, isolated signer, nonce/chain recovery and approval flows | Not started |
| M5 | Operational hardening | Fault injection, DR, runbooks, SLOs, accessibility and security review pass | Not started |
| M6 | Controlled live rollout | Approved production automation and venue-by-venue pilot evidence | Not started |

No milestone closes from code completion alone. Its traceability, tests, security evidence, documentation, and backend/mobile compatibility must also pass.

Registration policy: version 1 runs one shared backend with `PERPETO_OPEN_REGISTRATION` enabled so every tester gets immediate full access (DEC-0009). Version 2 provisions an isolated backend per user and restores gated approval and mandatory MFA; per-user backend isolation is tracked as a post-M1 architectural objective.
