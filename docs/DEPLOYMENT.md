# Preview Delivery

GitHub Actions creates internal EAS preview builds only after the project has been initialized once through EAS, native identifiers are confirmed, and the `preview` GitHub environment is enabled.

Required configuration:

- Secret: `EXPO_TOKEN`
- Variable: `EAS_ENABLED=true`
- Variable: `EXPO_PUBLIC_API_URL` pointing to staging/paper
- Variable: `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` matching bundle `com.signex.mobile`
- Variable: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` used for the server authorization-code exchange
- Variable: `GOOGLE_IOS_URL_SCHEME` set to the reversed iOS client ID

The Apple App ID must have Sign in with Apple enabled. Google redirect URIs and the iOS URL scheme must match the same OAuth clients configured on the backend; provider identifiers are configuration, not account-merging keys.

Preview builds use the `preview` EAS profile and staging channel. Production credentials, store submission, production OTA updates, and live backend URLs are not configured during development.
