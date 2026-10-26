import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { isPrismaError } from "@/lib/api";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { isEmailConfigured, sendOrderStatusUpdate, sendsStatusEmail } from "@/lib/email";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: { status?: unknown; paymentStatus?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { status, paymentStatus } = body as { status?: (typeof ORDER_STATUSES)[number]; paymentStatus?: (typeof PAYMENT_STATUSES)[number] };

  // Validate status values
  if (status && !ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    return NextResponse.json(
      { error: `Invalid paymentStatus. Must be one of: ${PAYMENT_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const before = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: { items: true },
    });

    // Let the customer know their order moved to a new stage
    let customerNotified = false;
    if (status && status !== before.status && sendsStatusEmail(status) && order.guestEmail && isEmailConfigured()) {
      await sendOrderStatusUpdate({
        orderNumber: order.orderNumber,
        customerName: order.guestName || "Customer",
        customerEmail: order.guestEmail,
        status,
        paymentStatus: order.paymentStatus,
      });
      customerNotified = true;
    }

    return NextResponse.json({ ...order, customerNotified });
  } catch (err) {
    if (isPrismaError(err, "P2025")) return NextResponse.json({ error: "Not found" }, { status: 404 });
    throw err;
  }
}
