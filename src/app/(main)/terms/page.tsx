import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";

export const metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you browse PrintsBazar and order personalised acrylic photos, clocks, name plates and gifts.",
};

const EMAIL = "hello@printsbazar.in";
const PHONE = "+91 8969179285";
const ADDRESS = "C.R. Complex, R.K. Bhattacharya Road, Patna – 800001, Bihar, India";

const SECTIONS: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    content: (
      <>
        <p>
          This website is operated by <strong>PrintsBazar</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), {ADDRESS}. These Terms &amp;
          Conditions apply to everyone who visits the website, creates an account or places an order.
        </p>
        <p>
          By using the website or placing an order, you agree to these terms. If you don&apos;t agree, please don&apos;t use the
          website. We may update these terms from time to time. The version shown here when you place an order is the one that
          applies to that order.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility and accounts",
    content: (
      <>
        <p>
          You must be at least 18 years old, or use the website under the supervision of a parent or guardian, to place an
          order. You can order as a guest or create an account.
        </p>
        <p>
          If you create an account, you&apos;re responsible for keeping your password safe and for everything done through your
          account. Please give us accurate details, especially your name, phone number, email and delivery address, so we can
          deliver your order. Tell us straight away if you think someone else has used your account.
        </p>
      </>
    ),
  },
  {
    id: "personalisation",
    title: "Personalised products and your content",
    content: (
      <>
        <p>
          Most of our products are made to order using the photos and text you provide (&ldquo;your content&rdquo;). Before you add
          an item to your cart, please check the preview carefully, including spelling, names, dates, photo placement, size and
          thickness. <strong>We print exactly what you approve in the preview</strong>, and we aren&apos;t responsible for mistakes
          in the content you supply.
        </p>
        <p>When you upload content, you confirm that:</p>
        <ul>
          <li>you own it or have permission to use it, including permission from people who appear in your photos;</li>
          <li>it doesn&apos;t infringe anyone&apos;s copyright, trademark, privacy or other rights; and</li>
          <li>
            it isn&apos;t illegal, obscene, defamatory, hateful, violent or otherwise objectionable, and doesn&apos;t show
            copyrighted characters, logos or artwork you don&apos;t have the rights to.
          </li>
        </ul>
        <p>
          We may refuse or cancel any order whose content breaks these rules, and refund any amount you&apos;ve paid. You give us
          permission to use your content only to make, check and deliver your order and to provide customer support. We
          don&apos;t use your photos for marketing without your separate consent.
        </p>
      </>
    ),
  },
  {
    id: "photo-quality",
    title: "Photo quality and colour",
    content: (
      <>
        <p>
          Print quality depends on the photo you upload. For the best result, use the original photo from your camera or
          gallery. The editor shows a quality indicator for each size, and if you go ahead with a low-resolution photo, a soft
          or blurry print isn&apos;t considered a defect.
        </p>
        <p>
          Screens show colours differently, so the printed product may vary slightly in colour, brightness and contrast from
          what you see on your device. Previews and product images on the website are illustrations. Small differences in
          shade, cut and finish are a normal part of making each piece by hand and aren&apos;t defects.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    title: "Orders",
    content: (
      <>
        <p>
          After you place an order, you&apos;ll see an order number and receive a confirmation email. A contract between you and
          us is formed when we confirm your order. We may decline or cancel an order, for example if a product is unavailable,
          there was a pricing or technical error, the content breaks section 3, or we suspect fraud. If we cancel after you&apos;ve
          paid, we&apos;ll refund you in full.
        </p>
        <p>
          You can follow your order&apos;s progress on the <Link href="/track-order">Track Order</Link> page using your order
          number and email address.
        </p>
      </>
    ),
  },
  {
    id: "pricing",
    title: "Prices and payment",
    content: (
      <>
        <p>
          All prices are in Indian Rupees (₹). The final amount, including any shipping charge and coupon discount, is shown
          at checkout before you pay. Prices and offers can change without notice, but a change never affects an order
          you&apos;ve already placed.
        </p>
        <p>We accept:</p>
        <ul>
          <li>
            <strong>Online payment</strong> by UPI and credit or debit card, processed by our payment partner Razorpay. Your
            card and UPI details are handled by Razorpay and are never stored by us.
          </li>
          <li>
            <strong>Cash on Delivery (COD)</strong>, where available. Please keep the exact amount ready. Refusing a COD order
            for a personalised product without a valid reason may lead us to turn off COD for future orders.
          </li>
        </ul>
        <p>
          Coupon codes have their own conditions, such as a minimum order value, an expiry date or a usage limit. Only one coupon
          can be used per order, and coupons can&apos;t be exchanged for cash.
        </p>
      </>
    ),
  },
  {
    id: "shipping",
    title: "Production and delivery",
    content: (
      <>
        <p>
          Each order is made in 1–3 working days and then shipped. Most orders arrive within 3–7 business days, and remote
          areas can take up to 10 business days. Delivery dates shown on the website are estimates, not guarantees, and may
          be affected by courier delays, weather, holidays or other events outside our control.
        </p>
        <p>
          Shipping is free on orders of ₹499 or more, and a ₹59 charge applies below that. We deliver within India only.
          Please make sure your address and phone number are correct. If a delivery fails because of incorrect details or
          because no one was available to receive it, re-delivery may be charged. See our{" "}
          <Link href="/shipping-policy">Shipping Policy</Link> for details.
        </p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Cancellations",
    content: (
      <p>
        Because every product is made specially for you, you can only cancel an order before it goes into production. Contact
        us as soon as possible with your order number. Once your order reaches the <strong>Printing</strong> stage, it can no
        longer be cancelled or changed. If we accept your cancellation, any amount you&apos;ve paid will be refunded to your
        original payment method.
      </p>
    ),
  },
  {
    id: "returns",
    title: "Returns, replacements and refunds",
    content: (
      <>
        <p>
          Personalised products can&apos;t be returned or exchanged for a change of mind, a wrong size or thickness choice, or
          mistakes in content you approved. However, if your order arrives <strong>damaged, defective or with a printing error
          on our part</strong>, contact us within <strong>7 days of delivery</strong> with your order number and clear photos of
          the product and its packaging. After checking, we&apos;ll reprint the item or refund you, free of charge.
        </p>
        <p>
          Refunds for online payments go back to your original payment method. For COD orders, we&apos;ll ask for your UPI ID or
          bank details. Read the full <Link href="/return-policy">Return &amp; Refund Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Our intellectual property",
    content: (
      <p>
        The website and everything on it, including our designs, templates, layouts, text, graphics, logos and the PrintsBazar
        name, belong to us or our licensors and are protected by law. You may use the website to browse and order for
        personal use. You may not copy, reproduce, sell or use our designs or content for commercial purposes without our
        written permission. Your own photos remain yours.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Using the website",
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>use the website for anything unlawful or fraudulent, or place orders in someone else&apos;s name without permission;</li>
          <li>try to tamper with prices, payments or orders, or get around any security feature;</li>
          <li>upload viruses or harmful code, or try to access parts of the website or systems you&apos;re not authorised to; or</li>
          <li>scrape, copy or overload the website with automated tools.</li>
        </ul>
        <p>We may suspend or close accounts and cancel orders that break these rules.</p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <>
        <p>
          We take great care with every order, but the website is provided &ldquo;as is&rdquo; and we can&apos;t promise it will
          always be available or error-free. To the extent allowed by law, our total liability for any claim relating to an
          order is limited to the amount you paid for that order. We aren&apos;t liable for indirect or consequential losses,
          or for delays and failures caused by events beyond our reasonable control.
        </p>
        <p>
          Nothing in these terms limits any rights you have as a consumer under Indian law, including the Consumer Protection
          Act, 2019.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    content: (
      <p>
        If someone makes a claim against us because content you uploaded infringes their rights, or because you broke these
        terms, you agree to cover the losses and reasonable costs we incur as a result.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    content: (
      <p>
        We collect only the information needed to process and deliver your orders, such as your name, contact details,
        address and uploaded photos. We share it only with the partners who help us do that, like our payment gateway and
        courier. We never sell your personal data. Read our full <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    content: (
      <p>
        These terms are governed by the laws of India. We&apos;ll always try to resolve any concern with you directly first. If
        a dispute can&apos;t be resolved, the courts at Patna, Bihar will have jurisdiction, without affecting your right to
        approach a consumer commission available to you under the Consumer Protection Act, 2019.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and grievances",
    content: (
      <>
        <p>For questions about these terms, or any complaint about an order, please contact us:</p>
        <ul>
          <li>
            Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            Phone / WhatsApp: <a href="tel:+918969179285">{PHONE}</a> (Monday–Saturday, 9 AM – 7 PM)
          </li>
          <li>Address: {ADDRESS}</li>
        </ul>
        <p>
          We acknowledge complaints within 48 hours and aim to resolve them within one month, as required by the Consumer
          Protection (E-Commerce) Rules, 2020.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="26 October 2026"
      intro={
        <p>
          Welcome to PrintsBazar. We make personalised acrylic photos, wall clocks, name plates and photo gifts, printed to
          order with your photos and words. Please read these terms carefully before placing an order. They explain what
          you can expect from us and what we ask of you.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
