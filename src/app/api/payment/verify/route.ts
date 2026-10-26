import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseBody } from "@/lib/api";
import { markOrderPaid } from "@/lib/orders";
import { verifySignature } from "@/lib/razorpay";

const schema = z.object({
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().min(1).max(200),
});

/** Called by the checkout page after Razorpay's success callback. The webhook
 *  does the same job server-to-server, so a closed tab can't lose a paid order. */
export async function POST(req: NextRequest) {
  try {
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    const valid = verifySignature(
      `${data.razorpayOrderId}|${data.razorpayPaymentId}`,
      data.razorpaySignature,
      process.env.RAZORPAY_KEY_SECRET || ""
    );
    if (!valid) return jsonError("Payment verification failed. Invalid signature.", 400);

    const order = await markOrderPaid(data.razorpayOrderId, data.razorpayPaymentId);
    if (!order) return jsonError("Order not found for this payment", 404);

    return NextResponse.json({ verified: true, orderNumber: order.orderNumber });
  } catch (err) {
    console.error("Payment verification error:", err);
    return jsonError("Payment verification failed", 500);
  }
}
