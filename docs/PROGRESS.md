# Mobile Progress

## Snapshot

- Milestone: M3 — CEX integrations
- Overall state: In progress (mobile monitoring implemented)
- Last verified: 2026-07-20

## Completed

- Expo SDK 57 official template adopted as the native compatibility baseline.
- Documentation hierarchy, CI, branch protection, API update, and shared-document drift workflows established.
- Convergent S branding, production assets, semantic light/dark tokens, and accessible Liquid Glass surfaces implemented.
- Personal EAS project `@ayenisholah/signex-mobile`, paper API environment, GitHub Packages authentication path, iOS registration, and update URL configured.
- iOS App Store build `0.1.0 (3)` accepted by EAS Submit for TestFlight processing; App Store Connect app `6790819875` and the `Team (Expo)` tester group are configured.
- Consumes the locally verified `@ayenisholah/perpeto-api-client@0.13.0` vendored tarball exactly; no remote package publication was performed.
- Added the M2 Scanner (Slices 1–2), Slice 3 Positions/open action, Slice 4 close/funding/PnL display, and Slice 5a persistent re-hedge badges plus auto/manual exit reasons.
- Added Apple/Google native entry points, a fail-closed authentication state machine, first-Owner bootstrap, pending isolation, privileged TOTP/recovery enrollment, Secure Store refresh rotation, Owner access approval, identity linking/unlinking, session revocation, logout, and deletion UI.
- Declared the Sign in with Apple capability for `com.signex.mobile` and the EAS contract for Google iOS/Web OAuth configuration.
- Replaced the cross-platform preview workflow with a gated iOS-only TestFlight build-and-submit workflow that rejects missing or inconsistent Google configuration.
- Configured modular headers for the Google Sign-In iOS dependency chain after the first `0.2.0 (4)` EAS attempt failed during CocoaPods installation; replacement archive verification is pending.

## Not completed

- Credentialed CEX sandbox/shadow evidence and primary connector WebSocket streams are not complete, so M3 and production trading remain unavailable.
- Real-device, accessibility, and security certification evidence is still pending.
- The versioned backend client package is consumed from a checked-in deterministic tarball but is not yet published to GitHub Packages.
- No M1A real-device, accessibility, or security certification evidence exists.

## Blockers

- Expo SDK 57 and native-auth dependencies resolve 12 moderate upstream advisories with no accepted non-breaking fix; there are no known high or critical advisories in the verified audit.
- Non-interactive TestFlight delivery awaits an Expo access token, App Store Connect API key verification, and the three Google public identifiers in both EAS and the GitHub `preview` environment.
- Google authentication builds require `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and `GOOGLE_IOS_URL_SCHEME` plus matching Google console configuration.
- Client publication awaits the backend versioned release workflow; the next authentication TestFlight archive awaits the backend runtime and configured provider values.

## Next verified task

Import least-privilege server-side test credentials, run the M3 sandbox/shadow certification matrix, and verify the Exchanges monitoring path on a real device.
