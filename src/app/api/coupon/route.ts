import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { validateCoupon } from "@/lib/orders";

const schema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code").max(50),
  orderTotal: z.number().nonnegative(),
});

/** Preview only, for showing the discount at checkout. The order API re-checks
 *  the coupon against server-computed prices when the order is placed. */
export async function POST(req: NextRequest) {
  const limited = rateLimit(`coupon:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    const result = await validateCoupon(data.code, data.orderTotal);
    if ("error" in result) return jsonError(result.error, 400);

    const { coupon, discount } = result;
    return NextResponse.json({ code: coupon.code, discount, type: coupon.type, value: coupon.value });
  } catch (err) {
    console.error(err);
    return jsonError("Server error", 500);
  }
}
