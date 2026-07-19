# Perpeto Mobile

Perpeto Mobile is the Expo iOS and Android operations client for the private Perpeto funding-rate arbitrage backend. It displays opportunities, execution state, risk, accounting, alerts, approvals, and system health. It never runs trading logic or stores exchange credentials.

## Current status

Milestone 0 is in progress. The application is a paper-status shell connected only to the backend health contract. Scanner, authentication, strategies, positions, and live controls do not exist yet. See [PROGRESS.md](docs/PROGRESS.md).

## Authoritative documents

Read [PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md), [DECISION.md](docs/DECISION.md), [TRACEABILITY.md](docs/TRACEABILITY.md), [IMPLEMENTATION.md](docs/IMPLEMENTATION.md), and [AGENTS.md](AGENTS.md) before changing behavior.

## Development

Requirements: Node.js 24 and npm 11.

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm start
```

Set `EXPO_PUBLIC_API_URL` to the paper backend URL. No mutation is permitted while data is stale, offline, or incompatible.

## Delivery

Pull requests run checks only. The app is linked to `@ayenisholah/signex-mobile`; successful `main` builds may trigger an iOS-only EAS TestFlight build and submission after the provider values and protected automation credentials are configured. Android delivery and production OTA channels are outside this slice. Follow [the credential and TestFlight runbook](docs/DEPLOYMENT.md).

No license has been granted yet. Until a license decision is recorded, all rights are reserved.
