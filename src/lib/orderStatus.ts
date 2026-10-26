// Single source of truth for order statuses, shared by the order API, the admin
// panel and the customer account page. The Track Order page shows the same stages.

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "artwork_review",
  "printing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"] as const;

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  artwork_review: "Artwork Review",
  printing: "Printing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function statusLabel(status: string): string {
  return LABELS[status as OrderStatus] ?? status;
}

/** Badge classes for the dark admin panel */
export const ADMIN_STATUS_COLOR: Record<string, string> = {
  pending:        "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  confirmed:      "bg-blue-400/10 text-blue-400 border-blue-400/20",
  artwork_review: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  printing:       "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
  packed:         "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  shipped:        "bg-orange-400/10 text-orange-400 border-orange-400/20",
  delivered:      "bg-green-400/10 text-green-400 border-green-400/20",
  cancelled:      "bg-red-400/10 text-red-400 border-red-400/20",
};
