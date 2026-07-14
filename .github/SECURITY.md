# Security Policy

Use GitHub private vulnerability reporting rather than public issues for exploitable findings. Never attach access or refresh tokens, TOTP data, exchange credentials, balances, wallet addresses, production screenshots, or unredacted diagnostics.

The application may store only the minimum refresh credential in OS-protected storage. It must not store exchange credentials, wallet keys, signing seeds, or unrestricted download URLs. Sensitive views require privacy controls, logs are deterministically redacted, and stale/offline data cannot authorize a mutation.
