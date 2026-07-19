import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import * as Crypto from "expo-crypto";
import type { MfaEnrollment, SocialProvider } from "@ayenisholah/perpeto-api-client";

import { AuthController } from "./controller";
import { secureSessionStore } from "./sessionStore";
import { initialAuthState, reduceAuthState, type AuthState } from "./state";

interface AuthContextValue {
  readonly state: AuthState;
  readonly signIn: (provider: SocialProvider) => Promise<void>;
  readonly bootstrap: (token: string) => Promise<void>;
  readonly verifyMfa: (code: string, recoveryCode: boolean) => Promise<void>;
  readonly beginMfaEnrollment: () => Promise<MfaEnrollment>;
  readonly confirmMfaEnrollment: (code: string) => Promise<readonly string[]>;
  readonly acknowledgeRecoveryCodes: (codes: readonly string[]) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly deleteAccount: () => Promise<void>;
  readonly retry: () => Promise<void>;
  readonly controller: AuthController;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Authentication could not be completed.";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const controller = useMemo(() => new AuthController(secureSessionStore), []);
  const [state, dispatch] = useReducer(reduceAuthState, initialAuthState);

  const restore = useCallback(async () => {
    try {
      const user = await controller.restore();
      if (user === null) dispatch({ type: "RESTORE_EMPTY" });
      else dispatch({ type: "RESTORED", user });
    } catch (error) {
      if (error instanceof TypeError) dispatch({ type: "RESTORE_OFFLINE" });
      else dispatch({ type: "FAIL", message: messageOf(error) });
    }
  }, [controller]);

  useEffect(() => { void restore(); }, [restore]);

  const signIn = useCallback(async (provider: SocialProvider) => {
    dispatch({ type: "AUTHORIZE", provider });
    try {
      const result = await controller.signIn(provider);
      if (result.cancelled) dispatch({ type: "CANCEL" });
      else dispatch({ type: "TRANSITION", transition: result.transition });
    } catch (error) {
      dispatch({ type: "FAIL", message: messageOf(error) });
    }
  }, [controller]);

  const bootstrap = useCallback(async (token: string) => {
    try {
      dispatch({ type: "TRANSITION", transition: await controller.bootstrap(token) });
    } catch (error) {
      dispatch({ type: "FAIL", message: messageOf(error) });
    }
  }, [controller]);

  const verifyMfa = useCallback(async (code: string, recoveryCode: boolean) => {
    if (state.kind !== "MFA_REQUIRED") return;
    try {
      const result = await controller.verifyMfa(state.challengeToken, code, recoveryCode);
      dispatch({ type: "SESSION", ...result });
    } catch (error) {
      dispatch({ type: "FAIL", message: messageOf(error) });
    }
  }, [controller, state]);

  const beginMfaEnrollment = useCallback(async () => await controller.beginMfaEnrollment(), [controller]);

  const confirmMfaEnrollment = useCallback(async (code: string) => {
    if (state.kind !== "MFA_ENROLLMENT_REQUIRED" || state.challengeToken === undefined) {
      throw new Error("The MFA enrollment challenge is unavailable.");
    }
    return await controller.confirmMfaEnrollment(state.challengeToken, code);
  }, [controller, state]);

  const acknowledgeRecoveryCodes = useCallback(async (codes: readonly string[]) => {
    if (state.kind !== "MFA_ENROLLMENT_REQUIRED" || state.challengeToken === undefined) {
      throw new Error("The MFA enrollment challenge is unavailable.");
    }
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(codes),
    );
    const result = await controller.acknowledgeRecoveryCodes(state.challengeToken, digest);
    dispatch({ type: "SESSION", ...result });
  }, [controller, state]);

  const logout = useCallback(async () => {
    await controller.logout();
    dispatch({ type: "LOGOUT" });
  }, [controller]);

  const deleteAccount = useCallback(async () => {
    await controller.deleteAccount();
    dispatch({ type: "LOGOUT" });
  }, [controller]);

  const value = useMemo<AuthContextValue>(() => ({
    state,
    signIn,
    bootstrap,
    verifyMfa,
    beginMfaEnrollment,
    confirmMfaEnrollment,
    acknowledgeRecoveryCodes,
    logout,
    deleteAccount,
    retry: restore,
    controller,
  }), [acknowledgeRecoveryCodes, beginMfaEnrollment, bootstrap, confirmMfaEnrollment, controller, deleteAccount, logout, restore, signIn, state, verifyMfa]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
