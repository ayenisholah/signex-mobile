import { describe, expect, it } from "vitest";

import { exitReasonLabel, wasRehedged } from "./positionPresentation";

describe("position presentation", () => {
  it("detects a corrective hedge on either leg", () => {
    expect(wasRehedged({
      long_leg: { orders: [{ client_order_id: "fa-0190abcd-open-long-1" }] },
      short_leg: { orders: [{ client_order_id: "fa-0190abcd-hedge-short-1" }] },
    })).toBe(true);
    expect(wasRehedged({
      long_leg: { orders: [{ client_order_id: "fa-0190abcd-open-long-1" }] },
      short_leg: { orders: [{ client_order_id: "fa-0190abcd-close-short-1" }] },
    })).toBe(false);
  });

  it("renders every exit reason as readable copy", () => {
    expect(exitReasonLabel("FUNDING_FLIP")).toBe("Funding flip");
    expect(exitReasonLabel("THRESHOLD_BREACH")).toBe("Threshold breach");
    expect(exitReasonLabel("VENUE_UNHEALTHY")).toBe("Venue unhealthy");
    expect(exitReasonLabel("MANUAL")).toBe("Manual");
    expect(exitReasonLabel("RECOVERY_FAILURE")).toBe("Recovery flatten");
    expect(exitReasonLabel("CIRCUIT_BREAKER")).toBe("Circuit breaker");
  });
});
