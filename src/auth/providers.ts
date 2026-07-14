import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import type { SocialChallenge, SocialProvider } from "@ayenisholah/signex-api-client";

export interface ProviderProof {
  readonly authorizationCode: string;
  readonly identityToken: string;
  readonly displayName?: string;
}

export class ProviderCancellation extends Error {}

function required(value: string | null, label: string): string {
  if (value === null || value.length === 0) throw new Error(`${label} was not returned by the provider.`);
  return value;
}

export function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

export async function createPkce(): Promise<{ verifier: string; challenge: string }> {
  const verifier = base64Url(await Crypto.getRandomBytesAsync(64));
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  return {
    verifier,
    challenge: digest.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, ""),
  };
}

async function authorizeApple(challenge: SocialChallenge): Promise<ProviderProof> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      state: challenge.state,
      nonce: challenge.nonce,
    });
    const displayName = credential.fullName === null
      ? undefined
      : [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(" ") || undefined;
    return {
      authorizationCode: required(credential.authorizationCode, "Apple authorization code"),
      identityToken: required(credential.identityToken, "Apple identity token"),
      displayName,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ERR_REQUEST_CANCELED") {
      throw new ProviderCancellation();
    }
    throw error;
  }
}

async function authorizeGoogle(): Promise<ProviderProof> {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const iosClientId = typeof extra?.googleIosClientId === "string" ? extra.googleIosClientId : undefined;
  const webClientId = typeof extra?.googleWebClientId === "string" ? extra.googleWebClientId : undefined;
  if (iosClientId === undefined || webClientId === undefined) {
    throw new Error("Google Sign-In is not configured for this build.");
  }
  GoogleSignin.configure({ iosClientId, webClientId, offlineAccess: true });
  const response = await GoogleSignin.signIn();
  if (response.type === "cancelled") throw new ProviderCancellation();
  return {
    authorizationCode: required(response.data.serverAuthCode, "Google server authorization code"),
    identityToken: required(response.data.idToken, "Google identity token"),
  };
}

export function authorizeProvider(
  provider: SocialProvider,
  challenge: SocialChallenge,
): Promise<ProviderProof> {
  return provider === "APPLE" ? authorizeApple(challenge) : authorizeGoogle();
}
