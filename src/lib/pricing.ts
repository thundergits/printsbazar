// Pricing rules shared by the checkout page (display) and the order API (source of truth).

export const FREE_SHIPPING_MIN = 499;
export const SHIPPING_FEE = 59;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

/** Discount for a coupon, never more than the subtotal it applies to. */
export function couponDiscount(coupon: { type: string; value: number }, subtotal: number): number {
  const raw = coupon.type === "percent" ? Math.round(subtotal * (coupon.value / 100)) : coupon.value;
  return Math.max(0, Math.min(raw, subtotal));
}
