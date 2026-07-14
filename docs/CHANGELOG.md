# Changelog

## [Unreleased]

### Added

- Initial Expo SDK 57 repository, documentation controls, paper-backend status shell, tests, CI, EAS preview workflow, API update workflow, and shared-document drift checks.
- Convergent S brand assets, light/dark theme tokens, accessible Liquid Glass surfaces, and an iOS TestFlight delivery profile.
- Personal EAS project linkage and authenticated GitHub Packages configuration for preview and CI installs.
- iOS exempt-encryption declaration, EAS Updates project URL, and production brand splash configuration.
- M1A Google/Apple authentication state machine and screens for bootstrap, pending approval, TOTP/recovery enrollment and challenge, Owner access approval, linked identities, device sessions, logout, and account deletion.
- Device-only Secure Store refresh credentials, in-memory access-token handling, refresh/revocation cleanup policy, native Apple capability, and Google Sign-In EAS configuration.

### Security

- The scaffold contains no exchange credentials or trading mutations and labels backend entry readiness as blocked.
- Pending users cannot enter the private shell; provider cancellation is non-destructive, and revoked/reused/deleted sessions clear stored credentials.

### Changed

- Moved project-control documentation under `docs/` and recorded the temporary solo-maintainer administrator bypass policy.
- Updated API client automation to record dependency releases so generated pull requests satisfy the documentation impact gate.
- Reworked the M0 status shell around the approved signal-to-execution identity while preserving paper-only safety messaging.
- Linked the iOS submit profile to App Store Connect and delivered the initial branded `0.1.0 (3)` archive for TestFlight processing.
- Documented the preview environment contract and interactive Android/iOS credential bootstrap boundary.
- Pinned the additive `@ayenisholah/signex-api-client@0.2.0` package as a verified vendored tarball until GitHub Packages publication completes.
