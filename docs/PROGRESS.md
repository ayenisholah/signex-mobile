# Mobile Progress

## Snapshot

- Milestone: M1A — Google/Apple authentication and secure sessions
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
- Consumes the verified `@ayenisholah/signex-api-client@0.2.0` tarball exactly while external GitHub Packages publication is blocked.
- Added Apple/Google native entry points, a central fail-closed authentication state machine, first-Owner bootstrap, pending isolation, privileged TOTP/recovery enrollment, Secure Store refresh rotation, Owner access approval, identity linking/unlinking, session revocation, logout, and deletion UI.
- Enabled the Sign in with Apple capability for `com.signex.mobile` and added EAS-supplied Google iOS/Web OAuth configuration.

## Not completed

- The backend provider-verification and session HTTP runtime is not implemented, so device flows cannot complete against staging yet.
- Scanner, strategy, execution, position, portfolio, analytics, alert, audit, and comprehensive settings/role administration do not exist.
- The versioned backend client package is consumed from a checked-in deterministic tarball but is not yet published to GitHub Packages.
- No real-device, accessibility, or security certification evidence exists.

## Blockers

- Expo SDK 57 and native-auth dependencies currently resolve 12 moderate upstream advisories with no accepted non-breaking fix; there are no known high or critical advisories in the verified audit, and production authentication distribution remains disabled.
- EAS project initialization, `EXPO_TOKEN`, and preview environment variables are required before builds are enabled.
- A least-privilege cross-repository token is required before documentation and API-update automation can be enabled.
- EAS preview values for `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and `GOOGLE_IOS_URL_SCHEME` plus matching Google console configuration are required for a native build.
- Client publication awaits the backend merge and versioned release workflow; the next TestFlight archive also awaits the backend runtime and configured provider values.

## Next verified task

Complete the backend authentication runtime, publish client `0.2.0`, configure EAS provider values/capabilities, then execute the real-iPhone social/MFA/session TestFlight matrix.
