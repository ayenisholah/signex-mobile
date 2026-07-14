# Preview Delivery

The app is linked to the personal EAS project `@ayenisholah/signex-mobile`. Android and iOS use the native identifier `com.signex.mobile`. GitHub Actions creates internal builds from the `preview` EAS profile and environment after platform credentials are bootstrapped.

## Environment contract

- `EXPO_PUBLIC_API_URL` is public client configuration. Set it to `https://signex-api.sholaayeni.xyz` in both the Expo and GitHub `preview` environments.
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` is the Google iOS OAuth client for bundle `com.signex.mobile`.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is the Google Web OAuth client used by the server authorization-code exchange.
- `GOOGLE_IOS_URL_SCHEME` is the reversed Google iOS client ID.
- `EXPO_TOKEN` is an Expo automation token stored only as a secret in GitHub's `preview` environment.
- `NODE_AUTH_TOKEN` is a classic GitHub PAT with only `read:packages`, stored as a secret in Expo's `preview` environment for remote-builder package installs.
- `EAS_ENABLED` is a repository variable. Keep it `false` until non-interactive preview builds are verified, then set it to `true`.

The Apple App ID must have Sign in with Apple enabled. Google redirect URIs and the iOS URL scheme must match the OAuth clients configured on the backend; provider identifiers are configuration, not account-merging keys.

GitHub-hosted `npm ci` steps use the workflow `GITHUB_TOKEN` with `packages: read`; they do not use the Expo-stored PAT. The tracked `.npmrc` contains only the `${NODE_AUTH_TOKEN}` placeholder. Grant this repository Actions read access to the generated API package after its first publication.

## Credential bootstrap

Run the first Android preview build interactively and let EAS create and manage the keystore. Register test devices with `eas device:create`; let EAS manage the iOS distribution certificate and ad hoc provisioning profile. Passwords, 2FA codes, signing credentials, PATs, and Expo tokens must be entered only into provider prompts and never committed or pasted into logs.

After platform builds succeed, verify `EXPO_TOKEN` and `NODE_AUTH_TOKEN`, enable `EAS_ENABLED`, and dispatch `EAS_PREVIEW.yml` from `main`.

Production EAS environments, production OTA updates, and live backend URLs remain out of scope for M1A.
