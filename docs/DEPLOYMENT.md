# Preview Delivery

The app is linked to the personal EAS project `@ayenisholah/signex-mobile`. Android and iOS use the native identifier `com.signex.mobile`. GitHub Actions creates internal builds from the `preview` EAS profile and environment after the platform credentials have been bootstrapped interactively.

## Environment contract

- `EXPO_PUBLIC_API_URL` is public client configuration. Set it to `https://signex-api.sholaayeni.xyz` in both the Expo and GitHub `preview` environments.
- `EXPO_TOKEN` is an Expo automation token stored only as a secret in GitHub's `preview` environment.
- `NODE_AUTH_TOKEN` is a classic GitHub PAT with only `read:packages`, stored as a secret in Expo's `preview` environment for remote-builder package installs.
- `EAS_ENABLED` is a repository variable. Keep it `false` until interactive Android and iOS builds succeed, then set it to `true`.

GitHub-hosted `npm ci` steps use the workflow `GITHUB_TOKEN` with `packages: read`; they do not use the Expo-stored PAT. The tracked `.npmrc` contains only the `${NODE_AUTH_TOKEN}` placeholder. Grant this repository Actions read access to the generated API package after its first publication.

## Credential bootstrap

Run the first Android preview build interactively and let EAS create and manage the keystore. Register at least one test device with `eas device:create`, then run the first iOS preview build interactively and let EAS manage the distribution certificate and ad hoc provisioning profile. Passwords, 2FA codes, signing credentials, PATs, and Expo tokens must be entered only into their provider prompts and must never be committed or pasted into logs.

After both builds succeed, create an Expo access token named `Signex M0 GitHub Actions`, store it as the GitHub `preview` environment secret `EXPO_TOKEN`, enable `EAS_ENABLED`, and dispatch `EAS_PREVIEW.yml` from `main`.

Production EAS environments, store submission, production OTA updates, and live backend URLs remain out of scope.
