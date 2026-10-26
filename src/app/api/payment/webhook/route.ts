import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";
import { markOrderPaid } from "@/lib/orders";
import { verifySignature } from "@/lib/razorpay";

// Configure in Razorpay Dashboard → Settings → Webhooks, pointing at
// https://<your-domain>/api/payment/webhook with events payment.captured,
// order.paid and payment.failed, and the same secret as RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set; rejecting webhook");
    return jsonError("Webhook not configured", 503);
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.warn("Razorpay webhook: invalid signature");
      return jsonError("Invalid signature", 400);
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id;

    if (typeof razorpayOrderId !== "string" || !razorpayOrderId) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const order = await markOrderPaid(razorpayOrderId, payment.id);
      if (!order) console.warn(`Webhook: no order for Razorpay order ${razorpayOrderId}`);
    }

    if (eventType === "payment.failed") {
      // The customer can retry in the same Razorpay order, so the order stays open
      await prisma.order.updateMany({
        where: { razorpayOrderId, paymentStatus: "unpaid" },
        data: { paymentStatus: "failed" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return jsonError("Webhook processing failed", 500);
  }
}
