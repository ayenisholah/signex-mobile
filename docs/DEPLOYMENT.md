# iOS TestFlight Delivery

Perpeto uses EAS project `@ayenisholah/signex-mobile`, Apple bundle identifier `com.signex.mobile`, and App Store Connect app `6790819875`. The `testflight` EAS profile builds only iOS and submits the archive to TestFlight. Android delivery is outside this slice.

Never paste an Apple `.p8` key, OAuth client secret, Expo token, Apple password, two-factor code, certificate private key, or provisioning profile into an issue, pull request, source file, terminal argument, or chat. Client IDs and the reversed Google URL scheme are public identifiers; private keys and client secrets are server or provider credentials.

## Values already configured

- EAS project ID: `de8919c1-03f6-4f0e-b3bc-3a73f130fd29`
- Bundle identifier: `com.signex.mobile`
- App Store Connect app ID: `6790819875`
- EAS `preview` value `EXPO_PUBLIC_API_URL=https://api.perpeto.xyz`
- EAS-managed iOS distribution certificate and App Store provisioning profile
- Sign in with Apple entitlement in the Expo configuration

## 1. Create the Google OAuth clients

Use the same Google Cloud project for both clients.

1. Open [Google Auth Platform](https://console.cloud.google.com/auth/overview) and select or create the Perpeto project.
2. Under **Branding**, set the app name to `Perpeto`, select a support email, add the production home page and privacy-policy URL, and add an operational developer contact.
3. Under **Audience**, choose **External**. While the project is in testing, add every Google account that will test the TestFlight build.
4. Under **Data Access**, request only `openid`, `email`, and `profile` for authentication.
5. Under **Clients**, create an **iOS** OAuth client named `Perpeto iOS` with bundle ID `com.signex.mobile`.
6. Copy the iOS client ID. It has the form `NUMBER-TEXT.apps.googleusercontent.com`.
7. Copy the displayed iOS URL scheme. It has the form `com.googleusercontent.apps.NUMBER-TEXT`.
8. Under **Clients**, create a **Web application** OAuth client named `Perpeto Backend`.
9. Copy the Web client ID and client secret. The Web client ID is used by the mobile SDK to request a server authorization code. The client secret stays on the backend and must never be added to the mobile environment.

Google documents the required iOS client, reversed URL scheme, and separate server client in its [Google Sign-In for iOS guide](https://developers.google.com/identity/sign-in/ios/start-integrating).

Create the three public EAS values from the mobile repository:

```powershell
npx eas-cli@latest env:create --environment preview --visibility plaintext --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "IOS_CLIENT_ID"
npx eas-cli@latest env:create --environment preview --visibility plaintext --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "WEB_CLIENT_ID"
npx eas-cli@latest env:create --environment preview --visibility plaintext --name GOOGLE_IOS_URL_SCHEME --value "REVERSED_IOS_CLIENT_ID"
```

Create the matching GitHub `preview` environment variables:

```powershell
gh variable set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --env preview --repo ayenisholah/signex-mobile --body "IOS_CLIENT_ID"
gh variable set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --env preview --repo ayenisholah/signex-mobile --body "WEB_CLIENT_ID"
gh variable set GOOGLE_IOS_URL_SCHEME --env preview --repo ayenisholah/signex-mobile --body "REVERSED_IOS_CLIENT_ID"
```

Verify both stores without exposing private credentials:

```powershell
npx eas-cli@latest env:list --environment preview
gh api repos/ayenisholah/signex-mobile/environments/preview/variables
```

## 2. Enable Sign in with Apple

1. Open [Apple Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list).
2. Select the explicit App ID for `com.signex.mobile`.
3. Enable **Sign in with Apple**, select **Configure**, and make this the primary App ID unless it must be grouped with an existing Perpeto primary App ID.
4. Optionally enter the Perpeto Apple server-notification endpoint after that backend endpoint exists.
5. Save and confirm the capability change.

Apple notes that changing a capability invalidates affected provisioning profiles. Run `npx eas-cli@latest credentials --platform ios` and let EAS repair or regenerate the App Store profile before the next build. See Apple's [capability instructions](https://developer.apple.com/help/account/identifiers/enable-app-capabilities/).

For server-side Apple authorization-code exchange:

1. In the Apple Developer portal, open **Certificates, Identifiers & Profiles → Keys** and create `Perpeto Apple Authentication`.
2. Enable **Sign in with Apple**, select **Configure**, and associate `com.signex.mobile` with the key.
3. Confirm the key and download its `.p8` file immediately. Apple permits only one download.
4. Record the Apple Team ID and Sign in with Apple Key ID.
5. Store the Team ID, Key ID, `.p8` contents, and client ID `com.signex.mobile` in the backend secret manager when the provider adapter is implemented. Do not store them in Expo or the mobile repository.

See Apple's [Sign in with Apple private-key guide](https://developer.apple.com/help/account/capabilities/create-a-sign-in-with-apple-private-key/).

## 3. Configure App Store Connect submission

1. Open [App Store Connect](https://appstoreconnect.apple.com/) and verify that the Perpeto app has Apple ID `6790819875` and bundle ID `com.signex.mobile`.
2. As Account Holder, open **Users and Access → Integrations → App Store Connect API** and request API access if it is not enabled.
3. As Account Holder or Admin, open **Team Keys**, generate a key named `Perpeto EAS Submit`, and grant only the role needed to upload builds.
4. Record the Issuer ID and Key ID, then download the `.p8` key. The download is available once.
5. From the mobile repository, run `npx eas-cli@latest credentials --platform ios`.
6. Choose the `testflight` profile, then **App Store Connect → Manage your API Key → Set up your project to use an API Key for EAS Submit**. Supply the key only in the protected EAS prompt.

Apple documents key creation in its [App Store Connect API guide](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api). EAS recommends this key for [automated iOS submission](https://docs.expo.dev/submit/ios/).

## 4. Create the Expo automation token

1. Sign in at [expo.dev](https://expo.dev/) as `ayenisholah`.
2. Open **Account settings → Access tokens**.
3. Create a token named `signex-mobile-github-testflight`.
4. Copy it once and immediately add it to the GitHub `preview` environment with the following command. The CLI prompts securely for the value; do not include it in the command itself.

```powershell
gh secret set EXPO_TOKEN --env preview --repo ayenisholah/signex-mobile
```

Confirm only the secret name:

```powershell
gh api repos/ayenisholah/signex-mobile/environments/preview/secrets
```

Expo recommends access tokens instead of account passwords for CI. See [Expo programmatic access](https://docs.expo.dev/accounts/programmatic-access/).

## 5. Preflight and enable delivery

Keep delivery disabled until all preceding values are configured. The workflow validates the HTTPS API URL, both Google client IDs, and the exact reversed scheme before spending an EAS build allocation.

Run a local configuration preflight:

```powershell
$env:EAS_BUILD_PROFILE = "testflight"
$env:EXPO_PUBLIC_API_URL = "https://api.perpeto.xyz"
$env:EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = "IOS_CLIENT_ID"
$env:EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = "WEB_CLIENT_ID"
$env:GOOGLE_IOS_URL_SCHEME = "REVERSED_IOS_CLIENT_ID"
npx expo config --type public
Remove-Item Env:EAS_BUILD_PROFILE, Env:EXPO_PUBLIC_API_URL, Env:EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, Env:EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, Env:GOOGLE_IOS_URL_SCHEME
```

After the preflight succeeds, enable the iOS-only workflow:

```powershell
gh variable set EAS_TESTFLIGHT_ENABLED --repo ayenisholah/signex-mobile --body "true"
gh workflow run IOS_TESTFLIGHT.yml --repo ayenisholah/signex-mobile --ref main
```

The workflow runs `eas build --platform ios --profile testflight --auto-submit --non-interactive`. It does not request an Android build. Keep `EAS_TESTFLIGHT_ENABLED=false` to stop automatic delivery while credentials are rotated or the backend is unavailable.

The generated iOS Podfile marks `GoogleUtilities` and `RecaptchaInterop` as modular-header pods through `expo-build-properties`. This is required because Google Sign-In's Swift `AppCheckCore` pod depends on those Objective-C pods while the managed iOS target links CocoaPods statically. Removing that configuration causes `pod install` to fail before compilation.

## Backend readiness boundary

The Google and Apple verification adapters, token exchange, session handlers, and staging authentication endpoints are not implemented yet. The mobile archive can build and reach TestFlight after provider configuration, but end-to-end social authentication cannot pass until the backend runtime stores its provider secrets and exposes the documented authentication API. A successful archive is delivery evidence only, not M1A authentication certification.
