import type {
  AuthTransition,
  CurrentUser,
  SessionCredentials,
  SocialProvider,
} from "@ayenisholah/signex-api-client";

export type AuthState =
  | { readonly kind: "RESTORING" }
  | { readonly kind: "SIGNED_OUT" }
  | { readonly kind: "AUTHORIZING"; readonly provider: SocialProvider }
  | { readonly kind: "PENDING_APPROVAL"; readonly user: CurrentUser }
  | { readonly kind: "BOOTSTRAP_REQUIRED"; readonly user: CurrentUser }
  | { readonly kind: "MFA_ENROLLMENT_REQUIRED"; readonly user: CurrentUser; readonly challengeToken?: string }
  | { readonly kind: "MFA_REQUIRED"; readonly user: CurrentUser; readonly challengeToken: string }
  | { readonly kind: "AUTHENTICATED"; readonly user: CurrentUser }
  | { readonly kind: "OFFLINE_LOCKED"; readonly message: string }
  | { readonly kind: "ERROR"; readonly message: string };

export type AuthEvent =
  | { readonly type: "RESTORE_EMPTY" }
  | { readonly type: "RESTORE_OFFLINE" }
  | { readonly type: "RESTORED"; readonly user: CurrentUser }
  | { readonly type: "AUTHORIZE"; readonly provider: SocialProvider }
  | { readonly type: "CANCEL" }
  | { readonly type: "TRANSITION"; readonly transition: AuthTransition }
  | { readonly type: "SESSION"; readonly session: SessionCredentials; readonly user: CurrentUser }
  | { readonly type: "BOOTSTRAP_AVAILABLE"; readonly user: CurrentUser }
  | { readonly type: "FAIL"; readonly message: string }
  | { readonly type: "REVOKED" }
  | { readonly type: "LOGOUT" };

export const initialAuthState: AuthState = { kind: "RESTORING" };

export function reduceAuthState(_state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case "RESTORE_EMPTY":
    case "REVOKED":
    case "LOGOUT":
    case "CANCEL":
      return { kind: "SIGNED_OUT" };
    case "RESTORE_OFFLINE":
      return {
        kind: "OFFLINE_LOCKED",
        message: "Signex must reach your deployment before restoring private data.",
      };
    case "AUTHORIZE":
      return { kind: "AUTHORIZING", provider: event.provider };
    case "RESTORED":
      return { kind: "AUTHENTICATED", user: event.user };
    case "BOOTSTRAP_AVAILABLE":
      return { kind: "BOOTSTRAP_REQUIRED", user: event.user };
    case "SESSION":
      return { kind: "AUTHENTICATED", user: event.user };
    case "FAIL":
      return { kind: "ERROR", message: event.message };
    case "TRANSITION": {
      const { transition } = event;
      switch (transition.next) {
        case "PENDING_APPROVAL":
          return { kind: "PENDING_APPROVAL", user: transition.user };
        case "MFA_ENROLLMENT_REQUIRED":
          return {
            kind: "MFA_ENROLLMENT_REQUIRED",
            user: transition.user,
            challengeToken: transition.challenge_token,
          };
        case "MFA_REQUIRED":
          if (transition.challenge_token === undefined) {
            return { kind: "ERROR", message: "The MFA challenge was incomplete." };
          }
          return {
            kind: "MFA_REQUIRED",
            user: transition.user,
            challengeToken: transition.challenge_token,
          };
        case "AUTHENTICATED":
          if (transition.session === undefined) {
            return { kind: "ERROR", message: "The authenticated session was incomplete." };
          }
          return { kind: "AUTHENTICATED", user: transition.user };
      }
    }
  }
}

export function canAccessPrivateData(state: AuthState): boolean {
  return state.kind === "AUTHENTICATED" && state.user.status === "ACTIVE";
}
