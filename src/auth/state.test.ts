import { describe, expect, it } from "vitest";

import { canAccessPrivateData, initialAuthState, reduceAuthState } from "./state";

const pendingUser = {
  id: "user-1",
  status: "PENDING" as const,
  display_name: null,
  email: null,
  roles: [],
  linked_providers: ["APPLE" as const],
  mfa_enrolled: false,
};

describe("authentication state machine", () => {
  it("isolates a newly registered pending account", () => {
    const state = reduceAuthState(initialAuthState, {
      type: "TRANSITION",
      transition: { next: "PENDING_APPROVAL", user: pendingUser },
    });
    expect(state.kind).toBe("PENDING_APPROVAL");
    expect(canAccessPrivateData(state)).toBe(false);
  });

  it("requires an explicit MFA challenge token", () => {
    const state = reduceAuthState(initialAuthState, {
      type: "TRANSITION",
      transition: { next: "MFA_REQUIRED", user: { ...pendingUser, status: "ACTIVE" } },
    });
    expect(state).toEqual({ kind: "ERROR", message: "The MFA challenge was incomplete." });
  });

  it("does not admit authenticated state without session credentials", () => {
    const state = reduceAuthState(initialAuthState, {
      type: "TRANSITION",
      transition: { next: "AUTHENTICATED", user: { ...pendingUser, status: "ACTIVE" } },
    });
    expect(canAccessPrivateData(state)).toBe(false);
  });

  it("clears protected state on revocation", () => {
    const active = reduceAuthState(initialAuthState, {
      type: "SESSION",
      session: {
        access_token: "memory",
        access_token_expires_at: "2026-07-14T12:15:00Z",
        refresh_token: "secure-store",
        session_id: "session",
        device_id: "device",
      },
      user: { ...pendingUser, status: "ACTIVE", roles: ["VIEWER"] },
    });
    expect(canAccessPrivateData(active)).toBe(true);
    expect(reduceAuthState(active, { type: "REVOKED" })).toEqual({ kind: "SIGNED_OUT" });
  });

  it("fails closed during offline restoration", () => {
    expect(reduceAuthState(initialAuthState, { type: "RESTORE_OFFLINE" }).kind).toBe("OFFLINE_LOCKED");
  });
});
