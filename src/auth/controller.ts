import Constants from "expo-constants";
import * as Device from "expo-device";
import {
  PerpetoApiError,
  PerpetoClient,
  type AuthTransition,
  type CurrentUser,
  type MfaEnrollment,
  type SessionCredentials,
  type SocialProvider,
} from "@ayenisholah/perpeto-api-client";

import { authorizeProvider, createPkce, ProviderCancellation } from "./providers";
import { isSessionInvalidatingCode, type SessionStore } from "./sessionStore";

export interface AuthResult {
  readonly transition: AuthTransition;
  readonly cancelled: boolean;
}

export class AuthController {
  #accessToken: string | undefined;
  readonly #client: PerpetoClient;

  public constructor(private readonly store: SessionStore) {
    const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
    const baseUrl = typeof extra?.apiBaseUrl === "string" ? extra.apiBaseUrl : "https://staging.perpeto.invalid";
    this.#client = new PerpetoClient({
      baseUrl,
      getAccessToken: () => this.#accessToken,
    });
  }

  public get client(): PerpetoClient {
    return this.#client;
  }

  async #acceptSession(session: SessionCredentials): Promise<void> {
    this.#accessToken = session.access_token;
    try {
      await this.store.write({ refreshToken: session.refresh_token, deviceId: session.device_id });
    } catch (error) {
      this.#accessToken = undefined;
      await this.store.clear();
      throw new Error("Perpeto could not protect the refresh credential on this device.", { cause: error });
    }
  }

  public async restore(): Promise<CurrentUser | null> {
    const stored = await this.store.read();
    if (stored === null) return null;
    try {
      const session = await this.#client.refresh(stored.refreshToken, stored.deviceId);
      await this.#acceptSession(session);
      return await this.#client.me();
    } catch (error) {
      if (error instanceof PerpetoApiError && isSessionInvalidatingCode(error.code)) {
        await this.clear();
      }
      throw error;
    }
  }

  public async signIn(provider: SocialProvider): Promise<AuthResult> {
    const pkce = await createPkce();
    const challenge = await this.#client.createSocialChallenge(provider, "signex://auth/callback", pkce.challenge);
    try {
      const proof = await authorizeProvider(provider, challenge);
      const installationId = await this.store.installationId();
      const transition = await this.#client.exchangeSocialAuthorization({
        challenge_id: challenge.id,
        authorization_code: proof.authorizationCode,
        identity_token: proof.identityToken,
        code_verifier: pkce.verifier,
        apple_profile: proof.displayName === undefined ? undefined : { display_name: proof.displayName },
        device: {
          installation_id: installationId,
          platform: "IOS",
          app_version: Constants.expoConfig?.version ?? "0.2.0",
          display_name: Device.deviceName ?? "iPhone",
        },
      });
      if (transition.session !== undefined) await this.#acceptSession(transition.session);
      return { transition, cancelled: false };
    } catch (error) {
      if (error instanceof ProviderCancellation) {
        return {
          cancelled: true,
          transition: {
            next: "PENDING_APPROVAL",
            user: {
              id: "",
              status: "PENDING",
              display_name: null,
              email: null,
              roles: [],
              linked_providers: [],
              mfa_enrolled: false,
            },
          },
        };
      }
      throw error;
    }
  }

  public async bootstrap(token: string): Promise<AuthTransition> {
    return await this.#client.bootstrap(token);
  }

  public async linkIdentity(provider: SocialProvider, totpCode?: string): Promise<void> {
    const pkce = await createPkce();
    const challenge = await this.#client.createSocialChallenge(
      provider,
      "signex://auth/link",
      pkce.challenge,
      "LINK_IDENTITY",
    );
    const proof = await authorizeProvider(provider, challenge);
    await this.#client.linkIdentity({
      challenge_id: challenge.id,
      authorization_code: proof.authorizationCode,
      identity_token: proof.identityToken,
      code_verifier: pkce.verifier,
      totp_code: totpCode,
    });
  }

  public async verifyMfa(
    challengeToken: string,
    code: string,
    recoveryCode: boolean,
    recoveryCodesAcknowledged = false,
  ): Promise<{ session: SessionCredentials; user: CurrentUser }> {
    const session = await this.#client.verifyMfa(
      challengeToken,
      code,
      recoveryCode,
      recoveryCodesAcknowledged,
    );
    await this.#acceptSession(session);
    return { session, user: await this.#client.me() };
  }

  public async beginMfaEnrollment(): Promise<MfaEnrollment> {
    return await this.#client.enrollMfa();
  }

  public async confirmMfaEnrollment(
    challengeToken: string,
    code: string,
  ): Promise<readonly string[]> {
    const result = await this.#client.confirmMfa(challengeToken, code);
    return result.recovery_codes;
  }

  public async acknowledgeRecoveryCodes(
    challengeToken: string,
    codeSetDigest: string,
  ): Promise<{ session: SessionCredentials; user: CurrentUser }> {
    const session = await this.#client.acknowledgeRecoveryCodes(challengeToken, codeSetDigest);
    await this.#acceptSession(session);
    return { session, user: await this.#client.me() };
  }

  public async logout(): Promise<void> {
    try {
      await this.#client.logout();
    } finally {
      await this.clear();
    }
  }

  public async deleteAccount(): Promise<void> {
    try {
      await this.#client.deleteAccount();
    } finally {
      await this.clear();
    }
  }

  public async clear(): Promise<void> {
    this.#accessToken = undefined;
    await this.store.clear();
  }
}
