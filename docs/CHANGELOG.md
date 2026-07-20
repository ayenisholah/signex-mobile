# Changelog

## [Unreleased]

### Added

- M2 Slice 5a — position cards now show a persistent **RE-HEDGED** badge when corrective hedge orders are present and a readable funding-flip, threshold, venue-health, or manual exit reason after close. Consumes the verified `@ayenisholah/perpeto-api-client@0.7.0` vendored contract with `residual_breach_ticks` and nullable `exit_reason`.
- M2 Slice 4 — the Positions screen gains realized-PnL and funding display and a **Close position** action on `OPEN` positions (OWNER/TRADER only, via `closePosition`), showing captured funding, realized PnL (green/red), and the close time once closed. Consumes `@ayenisholah/perpeto-api-client@0.6.0`. Paper only — no live orders are placed.
- M2 Slice 3 — a **Positions** tab (segmented `[Scanner | Positions | Security]` home) listing opened paper positions from `GET /api/v1/positions` via a `usePositions` hook, showing state, per-leg venue/symbol/fill/fees, residual delta, and reserved capital. The opportunity detail sheet gains an **Open paper position** action (shown for `within_limits` routes and OWNER/TRADER roles) that calls `createPosition` with an idempotency key and routes to Positions. Consumes `@ayenisholah/perpeto-api-client@0.5.0`. Paper only — no live orders are placed.
- M2 Slice 2 — the Scanner gains route-type filters and a sort control, an **opportunity detail** sheet (tap a route) showing the full cost/forecast breakdown, per-leg forecasts, and the paper capital reservation, and an **Active risk limits** card fed by `GET /api/v1/risk/limits`. Consumes `@ayenisholah/perpeto-api-client@0.4.0` (`getOpportunity`, `getRiskLimits`, richer filters). Monitoring only.
- M2 Slice 1 — a **Scanner** screen for authenticated users: a segmented `[Scanner | Security]` home that lists ranked funding-arbitrage opportunities from the paper backend (`GET /api/v1/opportunities`) via a `useOpportunities` hook, showing net APR, win probability, capacity, venue route, and scan freshness, with manual refresh. Monitoring only — no execution controls. Consumes `@ayenisholah/perpeto-api-client@0.3.0`.
- Initial Expo SDK 57 repository, documentation controls, paper-backend status shell, tests, CI, EAS preview workflow, API update workflow, and shared-document drift checks.
- Convergent S brand assets, light/dark theme tokens, accessible Liquid Glass surfaces, and an iOS TestFlight delivery profile.
- Personal EAS project linkage and authenticated GitHub Packages configuration for preview and CI installs.
- iOS exempt-encryption declaration, EAS Updates project URL, and production brand splash configuration.
- M1A Google/Apple authentication state machine and screens for bootstrap, pending approval, TOTP/recovery enrollment and challenge, Owner access approval, linked identities, device sessions, logout, and account deletion.
- Device-only Secure Store refresh credentials, in-memory access-token handling, refresh/revocation cleanup policy, native Apple capability, and Google Sign-In EAS configuration.
- An iOS-only TestFlight build-and-submit workflow with fail-closed provider configuration validation and a provider credential runbook.

### Security

- The scaffold contains no exchange credentials or trading mutations and labels backend entry readiness as blocked.
- Pending users cannot enter the private shell; provider cancellation is non-destructive, and revoked/reused/deleted sessions clear stored credentials.

### Changed

- Pinned the Perpeto API client package to version `0.7.0`.
- Rebranded the app from **Signex** to **Perpeto** ("The perpetual edge"): a new perpetual-loop mark (interlocking mint/sky ribbon) for the icon, adaptive icon, splash and wordmark; the "Quant Terminal" palette (near-black ink `#0A0C10`, mint accent `#34E0A1`, sky secondary `#38BDF8`); and updated user-facing copy. Brand assets are generated from `assets/brand/perpeto-*.svg` via `npm run brand:render`. The vendored contract package is renamed to `@ayenisholah/perpeto-api-client` (client class `PerpetoClient`). The `com.signex.mobile` bundle ID, `signex://` deep-link scheme, `signex-mobile` slug, EAS linkage, and `signex.auth.*` secure-store keys are intentionally preserved so no re-provisioning or forced sign-out occurs.
- Updated the sign-in copy for the shared v1 open-registration backend (DEC-0009): new accounts get full access immediately, so the screen no longer promises Owner approval. The pending-approval screen and auth state machine remain as the fallback for gated (v2/isolated) deployments.
- Replaced the vendor Apple and Google sign-in widgets with a shared `ProviderButton` that renders both as identical 52pt pills (SF Symbol Apple glyph, official multicolor Google mark) following each provider's brand guidelines, resolving the mismatched styling on the sign-in screen. The underlying `expo-apple-authentication` and Google native sign-in flows are unchanged.
- Moved project-control documentation under `docs/` and recorded the temporary solo-maintainer administrator bypass policy.
- Updated API client automation to record dependency releases so generated pull requests satisfy the documentation impact gate.
- Reworked the M0 status shell around the approved signal-to-execution identity while preserving paper-only safety messaging.
- Linked the iOS submit profile to App Store Connect and delivered the initial branded `0.1.0 (3)` archive for TestFlight processing.
- Documented the preview environment contract and interactive Android/iOS credential bootstrap boundary.
- Pinned the additive `@ayenisholah/signex-api-client@0.2.0` package as a verified vendored tarball until GitHub Packages publication completes.
- Replaced the Android/iOS internal-preview automation with an explicitly gated iOS TestFlight workflow; removed the placeholder Google URL scheme.
- Added Expo's build-properties plugin to generate modular headers for the Google Sign-In transitive iOS pods required by CocoaPods static linking.
