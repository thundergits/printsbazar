import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";
import { FREE_SHIPPING_MIN, SHIPPING_FEE } from "@/lib/pricing";

export const metadata = {
  title: "Shipping Policy",
  description: `Free shipping across India on orders of ₹${FREE_SHIPPING_MIN} or more. Production times, delivery estimates by region, tracking and more.`,
};

const EMAIL = "hello@printsbazar.in";
const PHONE = "+91 8969179285";

// Courier transit times by region. Keep in line with ZONE_MAP in /api/delivery-estimate.
const TRANSIT = [
  { region: "Delhi NCR, Mumbai, Pune, Bengaluru, Haryana, Punjab and most of Gujarat", days: "3–5" },
  { region: "Uttar Pradesh, Rajasthan, Madhya Pradesh, Telangana, Andhra Pradesh, Karnataka, Tamil Nadu and Kolkata", days: "3–6" },
  { region: "Himachal Pradesh, Uttarakhand, Kerala, Odisha, West Bengal, Bihar, Jharkhand and Chhattisgarh", days: "4–8" },
  { region: "Jammu & Kashmir, Ladakh, Assam and the Northeast", days: "6–10" },
];

const SECTIONS: LegalSection[] = [
  {
    id: "charges",
    title: "Shipping charges",
    content: (
      <>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100">
            <p className="text-2xl font-bold text-gray-800">FREE</p>
            <p className="text-sm">on orders of ₹{FREE_SHIPPING_MIN} or more</p>
          </div>
          <div className="p-4 rounded-2xl bg-cream-50 border border-gray-100">
            <p className="text-2xl font-bold text-gray-800">₹{SHIPPING_FEE}</p>
            <p className="text-sm">flat charge on orders below ₹{FREE_SHIPPING_MIN}</p>
          </div>
        </div>
        <p>
          The order value is your cart total before any coupon discount. Shipping charges are always shown at checkout before
          you pay. There are no extra charges for Cash on Delivery.
        </p>
      </>
    ),
  },
  {
    id: "where",
    title: "Where we deliver",
    content: (
      <p>
        We deliver to addresses across India through trusted courier partners. We don&apos;t ship internationally at the
        moment. Enter your pincode on any design page or at checkout to see the delivery estimate for your address.
      </p>
    ),
  },
  {
    id: "production",
    title: "Production time",
    content: (
      <>
        <p>
          Every product is made to order with your photos and text. Once your order is confirmed, we review your artwork,
          print, finish and quality-check it, and pack it securely. This takes <strong>1–3 working days</strong> (Monday to
          Saturday, excluding public holidays) before your order is handed to the courier.
        </p>
        <p>
          During festivals and sale periods, production can take a little longer. If we expect a delay, we&apos;ll let you know.
        </p>
      </>
    ),
  },
  {
    id: "delivery-times",
    title: "Delivery times",
    content: (
      <>
        <p>After dispatch, courier transit times are usually:</p>
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Delivering to</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Business days</th>
              </tr>
            </thead>
            <tbody>
              {TRANSIT.map((row) => (
                <tr key={row.region} className="border-t border-gray-100">
                  <td className="px-4 py-3">{row.region}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{row.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The estimate shown for your pincode at checkout includes production time. Delivery dates are estimates, not
          guarantees. Courier delays, weather, strikes, public holidays and remote locations can sometimes add a few days.
        </p>
      </>
    ),
  },
  {
    id: "tracking",
    title: "Tracking your order",
    content: (
      <>
        <p>
          You&apos;ll receive an order confirmation email with your order number. To check progress at any time, go to{" "}
          <Link href="/track-order">Track Order</Link> and enter your order number and email address. Your order moves through
          these stages: Order Received, Confirmed, Artwork Review, Printing, Packed, Shipped and Delivered.
        </p>
        <p>
          If you have an account, all your orders are listed on your <Link href="/account">account page</Link>. For courier
          tracking details once your parcel has shipped, message us on WhatsApp.
        </p>
      </>
    ),
  },
  {
    id: "packaging",
    title: "Packaging",
    content: (
      <p>
        Acrylic needs care in transit. Every piece is wrapped in a protective film, cushioned and packed in a sturdy box to
        keep it safe on the way to you. Please peel off the protective film on both sides of acrylic prints after unboxing to
        reveal the glossy finish.
      </p>
    ),
  },
  {
    id: "address",
    title: "Delivery address and failed deliveries",
    content: (
      <>
        <p>
          Please double-check your address, pincode and mobile number at checkout. The courier may call you to arrange delivery.
          If you notice a mistake, contact us right away. We can update the address only before your order is shipped.
        </p>
        <p>
          The courier usually attempts delivery more than once. If a parcel can&apos;t be delivered because the address was
          incorrect or incomplete, no one was available, or the delivery was refused, it&apos;s returned to us. We&apos;ll
          contact you to arrange re-delivery, and the shipping cost for re-delivery may be charged.
        </p>
      </>
    ),
  },
  {
    id: "damaged",
    title: "Damaged or missing parcels",
    content: (
      <p>
        If your parcel looks damaged when it arrives, you can refuse delivery or ask the courier to note the damage. If your
        product is damaged or something is missing, contact us within 7 days of delivery with your order number and photos,
        and we&apos;ll send a free reprint or refund. See our <Link href="/return-policy">Return &amp; Refund Policy</Link> for
        details. If your tracking shows &ldquo;Delivered&rdquo; but you haven&apos;t received the parcel, tell us within 48 hours
        so we can raise it with the courier.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Questions about delivery",
    content: (
      <>
        <p>We&apos;re here to help, Monday to Saturday, 9 AM – 7 PM:</p>
        <ul>
          <li>
            WhatsApp / Phone: <a href="https://wa.me/918969179285">{PHONE}</a>
          </li>
          <li>
            Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
        </ul>
        <p>
          This policy is part of our <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      updated="26 October 2026"
      intro={
        <p>
          Everything you need to know about how we make, pack and deliver your personalised PrintsBazar order, from
          shipping charges and delivery times to tracking and what to do if something goes wrong in transit.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
