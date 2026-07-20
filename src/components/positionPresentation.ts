import type { ExitReason } from "@ayenisholah/perpeto-api-client";

interface OrderCarrier {
  readonly orders: readonly { readonly client_order_id: string }[];
}

interface HedgeAwarePosition {
  readonly long_leg: OrderCarrier;
  readonly short_leg: OrderCarrier;
}

const EXIT_REASON_LABELS: Readonly<Record<ExitReason, string>> = {
  FUNDING_FLIP: "Funding flip",
  THRESHOLD_BREACH: "Threshold breach",
  VENUE_UNHEALTHY: "Venue unhealthy",
  MANUAL: "Manual",
};

export function wasRehedged(position: HedgeAwarePosition): boolean {
  return [...position.long_leg.orders, ...position.short_leg.orders].some((order) =>
    order.client_order_id.includes("-hedge-"),
  );
}

export function exitReasonLabel(reason: ExitReason): string {
  return EXIT_REASON_LABELS[reason];
}
