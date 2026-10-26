import { createTransport, type Transporter } from "nodemailer";

const BRAND = process.env.NEXT_PUBLIC_SITE_NAME || "PrintsBazar";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const SUPPORT_PHONE = "+91 98356 74095";
const WHATSAPP_URL = "https://wa.me/919835674095";

const GOLD = "#b8860b";
const INK = "#1c1917";
const MUTED = "#6b7280";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    variantInfo?: string | null;
  }>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}

interface StatusEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
}

/** Customer-entered text goes into the HTML, so it must be escaped. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

/** Opens the Track Order page with the order number and email already filled in. */
export function trackOrderUrl(orderNumber: string, email: string) {
  return `${SITE_URL}/track-order?${new URLSearchParams({ order: orderNumber, email })}`;
}

// ── Building blocks ─────────────────────────────────────────────────────────

function layout(opts: { preheader: string; heading: string; subheading: string; body: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#f5f1e8;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;padding:32px 12px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${INK};padding:28px 32px;text-align:center;">
            <p style="margin:0 0 14px;color:#d4af37;font-size:15px;font-weight:700;letter-spacing:4px;">${esc(BRAND.toUpperCase())}</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">${opts.heading}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:15px;">${opts.subheading}</p>
          </td>
        </tr>
        ${opts.body}
        <tr>
          <td style="padding:22px 32px;background:#faf8f3;border-top:1px solid #ede6d3;text-align:center;">
            <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
              Questions? Reply to this email or <a href="${WHATSAPP_URL}" style="color:${GOLD};font-weight:600;">WhatsApp us</a> at ${SUPPORT_PHONE}<br>
              <strong style="color:${INK};">${esc(BRAND)}</strong> — Crafted with ❤️ in India
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** The order number (the customer's tracking ID) and a one-click tracking button. */
function trackingBlock(orderNumber: string, email: string) {
  return `
        <tr>
          <td style="padding:24px 32px;background:#fdf8ec;text-align:center;border-bottom:1px solid #f1e5c4;">
            <p style="margin:0;font-size:12px;color:${GOLD};font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Your Order / Tracking Number</p>
            <p style="margin:6px 0 16px;font-size:24px;font-weight:800;color:${INK};font-family:Consolas,monospace;letter-spacing:1px;">${esc(orderNumber)}</p>
            <a href="${esc(trackOrderUrl(orderNumber, email))}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:10px;">Track your order →</a>
            <p style="margin:12px 0 0;font-size:12px;color:${MUTED};">Or visit ${esc(SITE_URL.replace(/^https?:\/\//, ""))}/track-order and enter this number with your email.</p>
          </td>
        </tr>`;
}

// ── Order confirmation ──────────────────────────────────────────────────────

export function buildOrderEmailHtml(data: OrderEmailData): string {
  const address = (() => {
    try { return JSON.parse(data.shippingAddress); } catch { return {}; }
  })();
  const cell = "padding:10px 0;border-bottom:1px solid #f3f4f6;";

  const itemsHtml = data.items
    .map(
      (item) => `
              <tr>
                <td style="${cell}">
                  <strong style="color:${INK};">${esc(item.productName)}</strong>
                  ${item.variantInfo ? `<br><span style="color:${MUTED};font-size:13px;">${esc(item.variantInfo)}</span>` : ""}
                </td>
                <td style="${cell}text-align:center;color:${MUTED};">×${item.quantity}</td>
                <td style="${cell}text-align:right;font-weight:600;color:${INK};">${formatPrice(item.price * item.quantity)}</td>
              </tr>`
    )
    .join("");

  const isCod = data.paymentMethod === "cod";
  const body = `${trackingBlock(data.orderNumber, data.customerEmail)}
        <tr>
          <td style="padding:28px 32px;">
            <h3 style="margin:0 0 12px;color:${INK};font-size:16px;">Items Ordered</h3>
            <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
              <tr>
                <td style="padding:4px 0;color:${MUTED};">Subtotal</td>
                <td style="padding:4px 0;text-align:right;color:${MUTED};">${formatPrice(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:${MUTED};">Shipping</td>
                <td style="padding:4px 0;text-align:right;color:${MUTED};">${data.shippingCost === 0 ? "FREE" : formatPrice(data.shippingCost)}</td>
              </tr>
              ${data.discount > 0 ? `
              <tr>
                <td style="padding:4px 0;color:#16a34a;">Discount</td>
                <td style="padding:4px 0;text-align:right;color:#16a34a;">−${formatPrice(data.discount)}</td>
              </tr>` : ""}
              <tr>
                <td style="padding:12px 0 0;font-weight:700;color:${INK};font-size:16px;border-top:2px solid #f3f4f6;">${isCod ? "Total (pay on delivery)" : "Total Paid"}</td>
                <td style="padding:12px 0 0;text-align:right;font-weight:800;color:${GOLD};font-size:18px;border-top:2px solid #f3f4f6;">${formatPrice(data.total)}</td>
              </tr>
            </table>

            <div style="margin-top:24px;padding:16px;background:#faf8f3;border-radius:12px;border:1px solid #ede6d3;">
              <p style="margin:0 0 8px;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Delivering To</p>
              <p style="margin:0;font-weight:600;color:${INK};">${esc(address.name || data.customerName)}</p>
              <p style="margin:4px 0 0;color:${MUTED};font-size:14px;">${esc([address.line1, address.line2, address.city, address.state].filter(Boolean).join(", "))} – ${esc(address.pincode)}</p>
              <p style="margin:4px 0 0;color:${MUTED};font-size:14px;">📱 ${esc(address.phone)}</p>
            </div>

            <div style="margin-top:14px;padding:14px 16px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
              <p style="margin:0;color:#075985;font-size:14px;">
                🚚 <strong>What happens next:</strong> we make your order in 1–3 working days, then ship it. We'll email you at every step — and you can track it anytime with the button above.
              </p>
              <p style="margin:6px 0 0;color:#0369a1;font-size:13px;">Payment: ${isCod ? "Cash on Delivery" : "Paid online"}</p>
            </div>
          </td>
        </tr>`;

  return layout({
    preheader: `Order ${data.orderNumber} confirmed — track it anytime.`,
    heading: "🎉 Order Confirmed!",
    subheading: `Thank you for your order, ${esc(firstName(data.customerName))}!`,
    body,
  });
}

// ── Status updates ──────────────────────────────────────────────────────────

const STATUS_MESSAGES: Record<string, { subject: string; heading: string; message: string }> = {
  artwork_review: {
    subject: "We're reviewing your artwork",
    heading: "🎨 Artwork in Review",
    message: "Our design team is checking your photos and text to make sure everything prints perfectly. If anything needs your attention, we'll get in touch.",
  },
  printing: {
    subject: "Your order is being printed",
    heading: "🖨️ Now Printing",
    message: "Good news — your order is in production! We're printing and finishing it with care.",
  },
  packed: {
    subject: "Your order is packed",
    heading: "📦 Packed & Ready",
    message: "Your order has passed our quality check and is securely packed. It will be handed to our courier partner very soon.",
  },
  shipped: {
    subject: "Your order has shipped",
    heading: "🚚 On Its Way!",
    message: "Your order has been shipped and is on its way to you. Delivery usually takes 3–10 business days depending on your location. Need courier tracking details? Just WhatsApp us.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "✅ Delivered!",
    message: "Your order has been delivered. We hope you love it! If anything isn't right, contact us within 7 days of delivery and we'll make it right.",
  },
  cancelled: {
    subject: "Your order has been cancelled",
    heading: "Order Cancelled",
    message: "Your order has been cancelled. If you didn't ask for this or have any questions, please contact us.",
  },
};

/** Statuses that trigger a customer email when an admin moves an order to them. */
export function sendsStatusEmail(status: string): boolean {
  return status in STATUS_MESSAGES;
}

export function buildStatusEmailHtml(data: StatusEmailData): string {
  const info = STATUS_MESSAGES[data.status];
  const refundNote =
    data.status === "cancelled" && data.paymentStatus === "paid"
      ? `<p style="margin:12px 0 0;color:${INK};font-size:15px;line-height:1.6;"><strong>Your refund:</strong> the amount you paid will be refunded to your original payment method, usually within 5–7 working days.</p>`
      : "";
  const body = `${trackingBlock(data.orderNumber, data.customerEmail)}
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0;color:${INK};font-size:15px;line-height:1.6;">Hi ${esc(firstName(data.customerName))},</p>
            <p style="margin:12px 0 0;color:${INK};font-size:15px;line-height:1.6;">${info.message}</p>
            ${refundNote}
          </td>
        </tr>`;
  return layout({
    preheader: `${info.subject} — order ${data.orderNumber}`,
    heading: info.heading,
    subheading: `Order ${esc(data.orderNumber)}`,
    body,
  });
}

// ── Sending ─────────────────────────────────────────────────────────────────

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  if (!smtpUser || !smtpPass || smtpUser === "your-email@gmail.com") {
    return null; // Not configured
  }

  transporter = createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  return transporter;
}

async function sendViaResend(message: { from: string; to: string; subject: string; html: string; text: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || getTransporter());
}

/** Sends an email; failures are logged, never thrown, so they can't break an order. */
async function send(message: { to: string; subject: string; html: string; text: string }, context: string) {
  const mailer = getTransporter();
  const useResend = Boolean(process.env.RESEND_API_KEY);
  if (!useResend && !mailer) {
    console.warn(`⚠️  Email not configured, skipped ${context}. Set RESEND_API_KEY, or SMTP_USER and SMTP_PASS.`);
    return;
  }
  const full = { ...message, from: process.env.SMTP_FROM || `${BRAND} <${process.env.SMTP_USER}>` };
  try {
    if (useResend) await sendViaResend(full);
    else await mailer!.sendMail(full);
  } catch (err) {
    console.error(`Failed to send ${context}:`, err);
  }
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  await send(
    {
      to: data.customerEmail,
      subject: `✅ Order Confirmed — ${data.orderNumber} | ${BRAND}`,
      html: buildOrderEmailHtml(data),
      text: `Hi ${firstName(data.customerName)},

Thank you! Your order has been confirmed.

Order / tracking number: ${data.orderNumber}
Total: ${formatPrice(data.total)}${data.paymentMethod === "cod" ? " (pay on delivery)" : ""}

Track your order anytime: ${trackOrderUrl(data.orderNumber, data.customerEmail)}

We'll make your order in 1–3 working days and email you at every step.

Thank you,
${BRAND}`,
    },
    `order confirmation for ${data.orderNumber}`
  );
}

export async function sendOrderStatusUpdate(data: StatusEmailData): Promise<void> {
  const info = STATUS_MESSAGES[data.status];
  if (!info || !data.customerEmail) return;
  await send(
    {
      to: data.customerEmail,
      subject: `${info.subject} — ${data.orderNumber} | ${BRAND}`,
      html: buildStatusEmailHtml(data),
      text: `Hi ${firstName(data.customerName)},

${info.message}

Order / tracking number: ${data.orderNumber}
Track your order: ${trackOrderUrl(data.orderNumber, data.customerEmail)}

Thank you,
${BRAND}`,
    },
    `"${data.status}" update for ${data.orderNumber}`
  );
}
