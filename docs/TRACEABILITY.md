# Requirements Traceability

| Requirement | Planned component | Verification | Status |
|---|---|---|---|
| Spec 10 API compatibility | versioned generated client | Exact package pin and schema compatibility CI | `0.2.0` exact vendored pin verified; external publication pending |
| Spec 11.1 client boundary | Expo app and API layer | No trading logic/credentials checks | Scaffolded |
| Spec 11.3 / DEC-0007 authentication | native Apple/Google, auth state machine, MFA, approval and secure session store | Unit, integration and device E2E | State/storage/UI implemented; backend/device E2E pending |
| Spec 11.4–11.14 screens | routed feature modules | Component, integration, accessibility and E2E | Not started |
| Spec 11.15 offline behavior | connection/freshness state | Gap, replay, expiry and recovery tests | Not started |
| Spec 11.16 mobile security | device-only Secure Store, memory access token and privacy controls | Device security tests and review | Credential boundary and invalidation policy implemented; device review pending |
| Spec 17.4 mobile tests | CI and device matrix | Required checks and recorded evidence | In progress |
| Spec 18 EAS delivery | preview and TestFlight profiles | Successful iOS store archive and App Store Connect submission | iOS TestFlight delivery verified; CI preview remains scaffolded |
| Spec 12.1–12.2 brand and themes | Convergent S identity and glass-aware theme primitives | Small-size asset proofs, light/dark rendering, reduced-transparency fallback, and device review | In progress |
