import { describe, expect, it } from "vitest";

import { isBackendHealth, resolveApiBaseUrl } from "./health";

describe("backend health contract", () => {
  it("accepts only the paper M0 readiness shape", () => {
    expect(isBackendHealth({ status: "OK", mode: "PAPER", stage: "M0_SCAFFOLD" })).toBe(true);
    expect(isBackendHealth({ status: "OK", mode: "LIVE", stage: "M0_SCAFFOLD" })).toBe(false);
  });

  it("normalizes the configured API base URL", () => {
    expect(resolveApiBaseUrl("https://staging.example.test///")).toBe(
      "https://staging.example.test",
    );
  });
});
