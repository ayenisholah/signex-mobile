# Mobile Implementation Plan

## Current objective

Establish an accessible Expo SDK 57 shell that validates the paper backend contract without implying that trading controls exist.

## Ordered implementation

1. Theme/accessibility primitives, typed API client, auth/session lifecycle, MFA, secure storage, and onboarding.
2. Home, scanner, opportunity detail, paper entry confirmation, execution timeline, positions, and freshness/offline behavior.
3. Strategy wizard, portfolio, rebalancing approvals, analytics, activity, exchange health, alerts, audit, and settings.
4. Push deep links, biometric unlock, certificate-pin rotation, screenshot/privacy controls, crash redaction, E2E and accessibility evidence.
5. Internal distribution hardening and controlled release compatibility.

Every mutation requires a current server preview, idempotency key, expected resource version, authorization, freshness, and explicit pending/recovery UI.

## Deferred

Production EAS channels, store submission, live-mode controls, and arbitrary external-wallet signing remain unavailable.
