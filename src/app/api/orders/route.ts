import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerAuth";
import { jsonError, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { cartItemSchema, createOrder, generateOrderNumber, OrderError, quoteOrder } from "@/lib/orders";
import { getRazorpay, razorpayConfigured } from "@/lib/razorpay";

const orderSchema = z.object({
  guestName: z.string().trim().min(1, "Name is required").max(100),
  guestEmail: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  guestPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.object({
    line1: z.string().trim().min(1, "Address is required").max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1, "City is required").max(100),
    state: z.string().trim().min(1, "State is required").max(100),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  }),
  paymentMethod: z.enum(["upi", "card", "cod"]),
  items: z.array(cartItemSchema).min(1, "Your cart is empty").max(50),
  couponCode: z.string().trim().max(50).optional(),
  /** What the customer saw at checkout; the order is refused if the server total differs */
  expectedTotal: z.number().nonnegative(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`orders:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const { data, error } = await parseBody(req, orderSchema);
    if (error) return error;

    const user = await getCustomerSession();
    const quote = await quoteOrder(data.items, data.couponCode || undefined);

    if (Math.abs(quote.total - data.expectedTotal) > 0.5) {
      return jsonError(
        `Prices in your cart have changed. The correct total is ₹${quote.total}. Please review your cart and try again.`,
        409
      );
    }

    const isOnline = data.paymentMethod !== "cod";
    if (isOnline && !razorpayConfigured()) {
      return jsonError("Online payment is being set up. Please use Cash on Delivery for now.", 503);
    }
    if (isOnline && quote.total < 1) {
      return jsonError("Order total is too low for online payment. Please use Cash on Delivery.", 400);
    }

    const orderNumber = generateOrderNumber();

    // The Razorpay order is created first, with the amount we computed, so the
    // customer can only ever pay the server's total for this exact order.
    const rzpOrder = isOnline
      ? await getRazorpay().orders.create({
          amount: Math.round(quote.total * 100),
          currency: "INR",
          receipt: orderNumber,
          notes: { orderNumber },
        })
      : null;

    const order = await createOrder({
      ...quote,
      orderNumber,
      userId: user?.id,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      shippingAddress: JSON.stringify({ name: data.guestName, phone: data.guestPhone, ...data.address }),
      paymentMethod: data.paymentMethod,
      razorpayOrderId: rzpOrder?.id,
    });

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        total: order.total,
        razorpay: rzpOrder
          ? {
              orderId: rzpOrder.id,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency,
              keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof OrderError) return jsonError(err.message, 400);
    console.error("Order creation failed:", err);
    return jsonError("Failed to create order. Please try again.", 500);
  }
}

const trackSchema = z.object({
  // Customers paste it as shown on the success screen ("#MS-…"), so drop the # and stray spaces
  orderNumber: z.string().transform((s) => s.replace(/[#\s]/g, "")).pipe(z.string().min(1).max(50)),
  email: z.string().trim().toLowerCase().email().max(254),
});

/** Order tracking. Needs both the order number and the email used to place it,
 *  and returns only what the tracking page shows — no address or phone. */
export async function GET(req: NextRequest) {
  const limited = rateLimit(`track:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(req.url);
    const parsed = trackSchema.safeParse({
      orderNumber: searchParams.get("orderNumber") ?? "",
      email: searchParams.get("email") ?? "",
    });
    if (!parsed.success) return jsonError("Order number and email are both required", 400);

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: parsed.data.orderNumber.toUpperCase(),
        guestEmail: { equals: parsed.data.email, mode: "insensitive" },
      },
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        subtotal: true,
        shippingCost: true,
        discount: true,
        total: true,
        createdAt: true,
        items: { select: { productName: true, quantity: true, price: true, variantInfo: true } },
      },
    });

    if (!order) return jsonError("Order not found", 404);
    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return jsonError("Server error", 500);
  }
}
