# Preview Delivery

GitHub Actions creates internal EAS preview builds only after the project has been initialized once through EAS, native identifiers are confirmed, and the `preview` GitHub environment is enabled.

Required configuration:

- Secret: `EXPO_TOKEN`
- Variable: `EAS_ENABLED=true`
- Variable: `EXPO_PUBLIC_API_URL` pointing to staging/paper

Preview builds use the `preview` EAS profile and staging channel. Production credentials, store submission, production OTA updates, and live backend URLs are not configured during development.
