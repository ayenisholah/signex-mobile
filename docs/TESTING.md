# Mobile Testing Strategy

- Unit tests cover formatting, server-time countdowns, permissions, schemas, freshness, masking, cursor deduplication, and reducers.
- Component tests cover loading, empty, error, stale, partial, offline, and unauthorized states in both themes and at 200% text.
- Integration tests cover REST snapshot/WebSocket replay, cursor gaps, expired previews, idempotent pending operations, revocation, and recovery.
- Real-device E2E covers MFA, biometrics, onboarding, scanner-to-entry, strategy controls, unwind, approvals, push deep links, background recovery, and update enforcement.
- Accessibility evidence includes automated checks, VoiceOver, and TalkBack for critical flows.

M1A unit tests cover every server-driven auth transition, pending-user isolation, protected-route admission, revocation cleanup policy, and offline restoration lockout. Native provider cancellation, Secure Store failure/rotation, VoiceOver at 200% text, remote revocation, Apple/Google signup and linking, first-Owner bootstrap, TOTP/recovery, and deletion still require the recorded real-iPhone TestFlight matrix; unit tests are not device evidence or evidence for any trading workflow.
