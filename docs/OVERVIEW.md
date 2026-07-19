# Perpeto Overview

<!-- SHARED-CONTENT-VERSION: 1 -->

## What problem does Perpeto solve?

Funding-rate arbitrage requires continuously comparing incompatible venue data, estimating the return after every cost, coordinating two non-atomic leveraged trades, and recovering safely when one venue fills while the other fails. Doing this manually is slow, difficult to audit, and exposes capital to silent directional, liquidation, venue, and operational risk.

Perpeto centralizes that work in a private server-side control plane. It discovers conservative spot–perpetual and perpetual–perpetual opportunities, applies portfolio and venue risk limits, coordinates both legs, reconciles venue-authoritative state, records accounting evidence, and gives operators an authenticated mobile control surface.

## Primary objectives

- Rank executable opportunities by conservative net return rather than headline funding.
- Keep unmatched exposure bounded and visible during every failure mode.
- Make commands idempotent and every decision, intent, fill, funding payment, risk event, and operator action auditable.
- Separate mobile operations from credentials, signing, trading logic, and reconciliation.
- Certify each venue and route progressively through paper, shadow, pilot, and restricted live operation.

Perpeto does not guarantee profit, atomic cross-venue fills, funding receipt, liquidity, or venue safety.

## Real-world integration

An organization deploys one isolated backend stack on its own low-latency VPS and connects dedicated exchange accounts with withdrawal-disabled trading credentials. The Rust services ingest public and private venue streams, persist durable state in PostgreSQL, use Redis only for rebuildable coordination, and expose versioned TLS REST and WebSocket contracts.

The Expo iOS/Android app consumes those contracts for onboarding, scanner review, strategy controls, approvals, risk monitoring, alerts, health, and audit export. It never receives exchange secrets or runs the execution engine. External systems may consume exports, alerts, metrics, and the versioned API, but trading commands remain authenticated, authorized, idempotent, and policy-checked by the backend.
