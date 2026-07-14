# Mobile Progress

## Snapshot

- Milestone: M0 — Governance and scaffolding
- Overall state: In progress
- Last verified: 2026-07-14

## Completed

- Expo SDK 57 official template adopted as the native compatibility baseline.
- Documentation hierarchy and strict tracking policy established.
- Paper-backend status screen and narrow health-contract tests added.
- CI, opt-in EAS preview, API update, and documentation drift workflows added.
- Public GitHub repository, required checks, branch protection, preview environment, and disabled-by-default automation switches configured.
- Mobile CI verified green across documentation, lint, strict types, tests, audit threshold, and all Expo diagnostics.
- Convergent S branding, production icon/splash sources, semantic light/dark tokens, and accessible Liquid Glass surfaces implemented for the M0 status shell.
- iOS App Store build `0.1.0 (3)` completed and was accepted by EAS Submit for TestFlight processing; App Store Connect app `6790819875` and the `Team (Expo)` tester group are configured.
- Personal EAS project `@ayenisholah/signex-mobile` initialized with its public project linkage recorded in app configuration.
- Paper API URL configured consistently in the Expo and GitHub `preview` environments; paper readiness verified against the deployed backend.
- Cross-repository automation token configured and documentation/API update switches enabled.
- GitHub Packages authentication prepared for GitHub-hosted and remote EAS package installs without placing tokens in tracked files or the app bundle.
- An iPhone is registered with the personal Apple Developer team for internal distribution.

## Not completed

- No authentication, scanner, strategy, execution, position, portfolio, approval, analytics, alert, audit, or settings flow exists.
- The versioned backend client package is not yet published or consumed.
- No real-device, accessibility, or security certification evidence exists.

## Blockers

- Expo SDK 57 currently resolves 11 moderate upstream advisories with no non-breaking fix; there are no high or critical advisories, and production distribution remains disabled.
- Non-interactive preview automation remains disabled until the GitHub `EXPO_TOKEN` and Expo `NODE_AUTH_TOKEN` environment paths are verified end to end.

## Next verified task

Keep M0 CI green, verify non-interactive EAS preview delivery, publish and pin the backend client package, monitor upstream advisory fixes, and begin the shared authentication foundation under M1.
