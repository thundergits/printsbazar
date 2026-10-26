import { z } from "zod";
import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDesign, getPrice, lineOf, sizeLabel, sizesFor, type Thickness } from "@/lib/designs";
import { couponDiscount, shippingFor } from "@/lib/pricing";
import { sendOrderConfirmation } from "@/lib/email";

/** Images we accept in orders: our own uploads (local in dev, Cloudinary in production).
 *  Anything else could be a `javascript:` link rendered in the admin panel. */
export function isUploadUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length > 2048) return false;
  if (/^\/uploads\/[\w-]+\.(jpe?g|png|webp)$/.test(url)) return true;
  return url.startsWith("https://res.cloudinary.com/");
}

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(100),
  /** variant id → chosen option value, for regular catalogue products */
  variantSelections: z.record(z.string().max(64), z.string().max(100)).optional(),
  customization: z.string().max(20_000).optional(),
  uploadedImage: z.string().max(2048).optional(),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

export interface PricedLine {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variantInfo: string | null;
  customization: string | null;
  uploadedImage: string | null;
}

export class OrderError extends Error {}

function parseJson(raw?: string): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function parseOptions(raw?: string): { label: string; value: string }[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Prices every cart line from the database and design price tables. Client-sent
 *  prices are never used, so a tampered request can't change what is charged. */
export async function priceCart(items: CartItemInput[]): Promise<{ lines: PricedLine[]; subtotal: number }> {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: ids } }, include: { variants: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const qtyByProduct = new Map<string, number>();
  const lines: PricedLine[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product || !product.isActive) {
      throw new OrderError("A product in your cart is no longer available. Please remove it and try again.");
    }
    if (item.uploadedImage && !isUploadUrl(item.uploadedImage)) {
      throw new OrderError("Invalid image in cart. Please re-add the item.");
    }

    const custom = parseJson(item.customization);
    const design = typeof custom?.design === "string" ? getDesign(custom.design) : undefined;
    let price: number;
    let name = product.name;
    let image = product.imageUrl;
    let variantInfo: string | null = null;

    if (custom?.design !== undefined) {
      // Design-flow item: price comes from the design's size × thickness table
      if (!design || lineOf(design).productSlug !== product.slug) {
        throw new OrderError(`"${product.name}" has an invalid design. Please re-add it to your cart.`);
      }
      const size = sizesFor(design).find((s) => s.id === custom.size);
      const thickness = custom.thickness as Thickness;
      const p = size && getPrice(design, size.id, thickness);
      if (!size || !p) throw new OrderError(`"${design.name}" is not available in that size. Please re-add it.`);

      const photos = Array.isArray(custom.photos) ? custom.photos : [];
      const urls = [...photos.map((ph) => (ph as { originalUrl?: unknown })?.originalUrl), ...(custom.printUrl ? [custom.printUrl] : [])];
      if (!urls.every(isUploadUrl)) throw new OrderError("Invalid photo in cart. Please re-add the item.");

      price = p.price;
      name = design.name;
      image = item.uploadedImage ?? product.imageUrl;
      variantInfo = `Size: ${sizeLabel(design, size)} in, Thickness: ${thickness}`;
    } else {
      // Catalogue item: base price plus any chosen variant adjustments
      price = product.basePrice;
      const chosen: string[] = [];
      for (const [variantId, value] of Object.entries(item.variantSelections ?? {})) {
        const variant = product.variants.find((v) => v.id === variantId);
        const option = parseOptions(variant?.options).find((o) => o.value === value);
        if (!variant || !option) throw new OrderError(`Selected option for "${product.name}" is no longer available.`);
        price += variant.priceAdj;
        chosen.push(`${variant.name}: ${option.label}`);
      }
      variantInfo = chosen.join(", ") || null;
      if (product.isCustomizable && !item.uploadedImage) {
        throw new OrderError(`"${product.name}" needs your photo. Please customise it again.`);
      }
    }

    const qty = (qtyByProduct.get(product.id) ?? 0) + item.quantity;
    qtyByProduct.set(product.id, qty);
    if (product.stock < qty) {
      throw new OrderError(
        product.stock <= 0
          ? `"${product.name}" is out of stock.`
          : `Only ${product.stock} unit${product.stock > 1 ? "s" : ""} of "${product.name}" available.`
      );
    }

    lines.push({
      productId: product.id,
      productName: name,
      productImage: image,
      quantity: item.quantity,
      price,
      variantInfo,
      customization: item.customization ?? null,
      uploadedImage: item.uploadedImage ?? null,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  return { lines, subtotal };
}

/** Looks up a coupon and checks it can be used on this subtotal. */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ coupon: Coupon; discount: number } | { error: string }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) return { error: "Invalid or expired coupon" };
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return { error: "Coupon has expired" };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { error: "Coupon usage limit reached" };
  if (subtotal < coupon.minOrder) return { error: `Minimum order of ₹${coupon.minOrder} required for this coupon` };
  return { coupon, discount: couponDiscount(coupon, subtotal) };
}

export async function quoteOrder(items: CartItemInput[], couponCode?: string) {
  const { lines, subtotal } = await priceCart(items);
  let discount = 0;
  let coupon: Coupon | null = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if ("error" in result) throw new OrderError(result.error);
    coupon = result.coupon;
    discount = result.discount;
  }
  const shippingCost = shippingFor(subtotal);
  const total = Math.max(0, subtotal + shippingCost - discount);
  return { lines, subtotal, shippingCost, discount, total, coupon };
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const rand = Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 6).toUpperCase();
  return `MS-${ts}-${rand}`;
}

/** Decrements stock and counts the coupon use. Inside a COD order's transaction this
 *  must succeed; after an online payment it is best effort, since the money is taken. */
async function commitInventory(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  order: { couponCode: string | null; items: { productId: string; quantity: number }[] },
  strict: boolean
) {
  for (const item of order.items) {
    const { count } = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (count === 0) {
      if (strict) throw new OrderError("An item in your cart just went out of stock.");
      console.warn(`Stock for product ${item.productId} ran out after payment; review this order`);
    }
  }
  if (order.couponCode) {
    const coupon = await tx.coupon.findUnique({ where: { code: order.couponCode } });
    if (!coupon) return;
    const { count } = await tx.coupon.updateMany({
      where: { id: coupon.id, ...(coupon.maxUses !== null && strict ? { usedCount: { lt: coupon.maxUses } } : {}) },
      data: { usedCount: { increment: 1 } },
    });
    if (count === 0 && strict) throw new OrderError("Coupon usage limit reached");
  }
}

type NewOrder = Awaited<ReturnType<typeof quoteOrder>> & {
  orderNumber: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  razorpayOrderId?: string;
};

export async function createOrder(o: NewOrder) {
  const isCod = o.paymentMethod === "cod";
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: o.orderNumber,
        userId: o.userId,
        guestName: o.guestName,
        guestEmail: o.guestEmail,
        guestPhone: o.guestPhone,
        shippingAddress: o.shippingAddress,
        paymentMethod: o.paymentMethod,
        // Online orders stay pending until Razorpay confirms the payment
        status: isCod ? "confirmed" : "pending",
        paymentStatus: "unpaid",
        subtotal: o.subtotal,
        shippingCost: o.shippingCost,
        discount: o.discount,
        total: o.total,
        couponCode: o.coupon?.code ?? null,
        razorpayOrderId: o.razorpayOrderId,
        items: { create: o.lines },
      },
      include: { items: true },
    });
    if (isCod) await commitInventory(tx, created, true);
    return created;
  });
  if (isCod) await sendConfirmation(order);
  return order;
}

/** Marks an online order paid. Safe to call more than once (verify + webhook):
 *  only the first call commits stock and sends the email. */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  const order = await prisma.order.findUnique({ where: { razorpayOrderId }, include: { items: true } });
  if (!order) return null;

  const claimed = await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "paid" } },
      data: {
        paymentStatus: "paid",
        razorpayPaymentId,
        ...(order.status === "pending" ? { status: "confirmed" } : {}),
      },
    });
    if (count === 1) await commitInventory(tx, order, false);
    return count === 1;
  });

  if (claimed) await sendConfirmation(order);
  return order;
}

async function sendConfirmation(order: Awaited<ReturnType<typeof prisma.order.create>> & { items: PricedLine[] }) {
  await sendOrderConfirmation({
    orderNumber: order.orderNumber,
    customerName: order.guestName || "Customer",
    customerEmail: order.guestEmail!,
    items: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
    shippingAddress: order.shippingAddress ?? "{}",
    paymentMethod: order.paymentMethod || "online",
  });
}
