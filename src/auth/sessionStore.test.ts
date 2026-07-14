import { describe, expect, it } from "vitest";

import { isSessionInvalidatingCode } from "./sessionPolicy";

describe("secure-session failure policy", () => {
  it.each(["ACCOUNT_DELETED", "REFRESH_TOKEN_REUSE", "SESSION_REVOKED", "USER_SUSPENDED"])(
    "clears credentials for %s",
    (code) => expect(isSessionInvalidatingCode(code)).toBe(true),
  );

  it("does not erase a rotating token for a generic transient failure", () => {
    expect(isSessionInvalidatingCode("SERVICE_UNAVAILABLE")).toBe(false);
  });
});
