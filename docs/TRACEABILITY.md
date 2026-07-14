# Requirements Traceability

| Requirement | Planned component | Verification | Status |
|---|---|---|---|
| Spec 10 API compatibility | versioned generated client | Exact package pin and schema compatibility CI | Scaffolded |
| Spec 11.1 client boundary | Expo app and API layer | No trading logic/credentials checks | Scaffolded |
| Spec 11.3 authentication | auth, MFA and secure session store | Unit, integration and device E2E | Not started |
| Spec 11.4–11.14 screens | routed feature modules | Component, integration, accessibility and E2E | Not started |
| Spec 11.15 offline behavior | connection/freshness state | Gap, replay, expiry and recovery tests | Not started |
| Spec 11.16 mobile security | secure storage and privacy controls | Device security tests and review | Not started |
| Spec 17.4 mobile tests | CI and device matrix | Required checks and recorded evidence | In progress |
| Spec 18 EAS delivery | preview and TestFlight profiles | Successful iOS store archive and App Store Connect submission | iOS TestFlight delivery verified; CI preview remains scaffolded |
| Spec 12.1–12.2 brand and themes | Convergent S identity and glass-aware theme primitives | Small-size asset proofs, light/dark rendering, reduced-transparency fallback, and device review | In progress |
