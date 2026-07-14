# Mobile Testing Strategy

- Unit tests cover formatting, server-time countdowns, permissions, schemas, freshness, masking, cursor deduplication, and reducers.
- Component tests cover loading, empty, error, stale, partial, offline, and unauthorized states in both themes and at 200% text.
- Integration tests cover REST snapshot/WebSocket replay, cursor gaps, expired previews, idempotent pending operations, revocation, and recovery.
- Real-device E2E covers MFA, biometrics, onboarding, scanner-to-entry, strategy controls, unwind, approvals, push deep links, background recovery, and update enforcement.
- Accessibility evidence includes automated checks, VoiceOver, and TalkBack for critical flows.

The M0 test only proves health-contract parsing. It is not evidence for any trading workflow.
