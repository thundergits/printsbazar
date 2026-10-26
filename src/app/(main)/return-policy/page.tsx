import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";

export const metadata = {
  title: "Return & Refund Policy",
  description:
    "Our 7-day promise: if your personalised PrintsBazar order arrives damaged, defective or with a printing error, we'll reprint it or refund you.",
};

const EMAIL = "hello@printsbazar.in";
const PHONE = "+91 98356 74095";

const SECTIONS: LegalSection[] = [
  {
    id: "promise",
    title: "Our promise",
    content: (
      <>
        <p>
          Every PrintsBazar product is printed specially for you, with your photos and your words. We check each piece before
          it&apos;s packed. If something still isn&apos;t right because of us, we&apos;ll make it right:
        </p>
        <p className="p-4 rounded-2xl bg-brand-50 border border-brand-100 text-gray-800">
          If your order arrives <strong>damaged, defective, with a printing error or as the wrong item</strong>, tell us within{" "}
          <strong>7 days of delivery</strong> and we&apos;ll send a <strong>free reprint</strong> or give you a{" "}
          <strong>full refund</strong>.
        </p>
      </>
    ),
  },
  {
    id: "eligible",
    title: "What's covered",
    content: (
      <>
        <p>You can ask for a free reprint or refund if:</p>
        <ul>
          <li>the product arrived broken, cracked, scratched or otherwise damaged in transit;</li>
          <li>there&apos;s a manufacturing defect, such as peeling print, faulty edges or a clock that doesn&apos;t work;</li>
          <li>the print doesn&apos;t match the design you approved, for example wrong photo, text, size or thickness;</li>
          <li>you received someone else&apos;s order or a different product; or</li>
          <li>part of your order is missing.</li>
        </ul>
      </>
    ),
  },
  {
    id: "not-eligible",
    title: "What's not covered",
    content: (
      <>
        <p>
          Because personalised products can&apos;t be resold, we&apos;re unable to accept returns or exchanges for:
        </p>
        <ul>
          <li>a change of mind, or no longer needing the product;</li>
          <li>choosing the wrong size, thickness, design or quantity;</li>
          <li>spelling mistakes, wrong names or dates, or photo placement that you entered and approved in the preview;</li>
          <li>
            soft or blurry prints from low-resolution photos, screenshots or images saved from social media, after the editor
            has shown a low-quality warning;
          </li>
          <li>
            slight differences in colour or brightness between your screen and the print, or small variations in cut and
            finish that are normal for handmade products;
          </li>
          <li>damage caused after delivery, such as by dropping, incorrect mounting or using harsh cleaners; or</li>
          <li>problems reported more than 7 days after delivery.</li>
        </ul>
        <p>
          Not sure if your issue is covered? Message us anyway. We look at every case individually and will always try to help.
        </p>
      </>
    ),
  },
  {
    id: "how-to",
    title: "How to report a problem",
    content: (
      <>
        <ul>
          <li>
            <strong>Contact us within 7 days of delivery</strong> on WhatsApp at <a href="https://wa.me/919835674095">{PHONE}</a>{" "}
            or by email at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </li>
          <li>
            <strong>Share your order number</strong>. It&apos;s in your confirmation email and on the{" "}
            <Link href="/track-order">Track Order</Link> page.
          </li>
          <li>
            <strong>Send clear photos</strong> of the product showing the problem, plus the outer box and shipping label. If
            you recorded an unboxing video, please send that too. It helps us resolve damage claims faster.
          </li>
          <li>
            <strong>Keep the product and packaging</strong> until your request is resolved. We may ask for the item to be
            returned or picked up. If so, we arrange and pay for it.
          </li>
        </ul>
        <p>
          If a parcel looks badly damaged when it arrives, you can refuse delivery or ask the courier to note the damage, and
          then contact us.
        </p>
      </>
    ),
  },
  {
    id: "resolution",
    title: "What happens next",
    content: (
      <>
        <p>
          We&apos;ll reply within 48 hours (Monday–Saturday) and confirm the next steps. Once your request is approved, you
          choose how we put it right:
        </p>
        <ul>
          <li>
            <strong>Free reprint:</strong> we remake your product using the same photos and design, and ship it at no extra
            cost. Reprints are prioritised and usually dispatched within 1–3 working days.
          </li>
          <li>
            <strong>Full refund:</strong> we refund the amount you paid for the affected item, including any shipping charge
            you paid for it.
          </li>
        </ul>
        <p>For a partly damaged order, for example one piece of a set, we reprint or refund just the affected item.</p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Cancelling an order",
    content: (
      <>
        <p>
          You can cancel an order before production starts. Contact us as soon as possible with your order number. If your
          order is still at the <strong>Order Received</strong>, <strong>Confirmed</strong> or <strong>Artwork Review</strong>{" "}
          stage, we&apos;ll cancel it and refund you in full.
        </p>
        <p>
          Once your order reaches the <strong>Printing</strong> stage, it&apos;s being made just for you and can no longer be
          cancelled or changed. You can check your order&apos;s stage on the <Link href="/track-order">Track Order</Link> page.
        </p>
        <p>
          If we ever have to cancel your order ourselves, for example if a product is unavailable, we&apos;ll refund you in full
          straight away.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "How and when you get your refund",
    content: (
      <>
        <ul>
          <li>
            <strong>UPI, card and other online payments:</strong> refunded to the same account or card you paid with. We start
            the refund within 2 working days of approval, and it usually reaches you in 5–7 working days, depending on your bank.
          </li>
          <li>
            <strong>Cash on Delivery:</strong> we&apos;ll ask for your UPI ID or bank account details and transfer the refund
            within 5–7 working days of receiving them.
          </li>
        </ul>
        <p>
          We&apos;ll confirm by email when your refund has been processed. If it hasn&apos;t arrived after 7 working days,
          please contact us with your order number and we&apos;ll follow up with our payment partner.
        </p>
      </>
    ),
  },
  {
    id: "failed-payments",
    title: "Failed or duplicate payments",
    content: (
      <p>
        If money was deducted but your payment failed, your bank or Razorpay usually reverses it automatically within 5–7
        working days. If you were accidentally charged twice for the same order, contact us with both payment IDs and
        we&apos;ll refund the extra payment.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Need help?",
    content: (
      <>
        <p>We&apos;re happy to help with any return, reprint or refund question:</p>
        <ul>
          <li>
            WhatsApp / Phone: <a href="https://wa.me/919835674095">{PHONE}</a> (Monday–Saturday, 9 AM – 7 PM)
          </li>
          <li>
            Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
        </ul>
        <p>
          This policy is part of our <Link href="/terms">Terms &amp; Conditions</Link>. It doesn&apos;t affect your rights under
          the Consumer Protection Act, 2019.
        </p>
      </>
    ),
  },
];

export default function ReturnPolicyPage() {
  return (
    <LegalPage
      title="Return & Refund Policy"
      updated="26 October 2026"
      intro={
        <p>
          We want you to love what you receive. This page explains what to do if something goes wrong with your order, which
          cases are covered, and how and when you&apos;ll get a reprint or your money back.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
