import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/layout/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How PrintsBazar collects, uses, stores and protects your personal data and the photos you upload.",
};

const EMAIL = "hello@printsbazar.in";
const PHONE = "+91 98356 74095";
const ADDRESS = "C.R. Complex, R.K. Bhattacharya Road, Patna – 800001, Bihar, India";

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    content: (
      <p>
        <strong>PrintsBazar</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), {ADDRESS}, runs this website and is
        responsible for the personal data described in this policy. We act as the &ldquo;Data Fiduciary&rdquo; under India&apos;s
        Digital Personal Data Protection Act, 2023, and we follow the Information Technology Act, 2000 and the rules made under it.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    content: (
      <>
        <p>We collect only what we need to make and deliver your order:</p>
        <ul>
          <li>
            <strong>Order and delivery details:</strong> your name, email address, mobile number and delivery address, the
            products you order, and any text you add, such as names and addresses on a name plate.
          </li>
          <li>
            <strong>Photos you upload:</strong> the original photos you choose for printing, plus the preview and print files
            created from them.
          </li>
          <li>
            <strong>Account details</strong>, if you create an account: your name, email, optional mobile number, saved
            addresses and order history. Your password is stored only in encrypted (hashed) form, so we can never see it.
          </li>
          <li>
            <strong>Payment references:</strong> for online payments, the Razorpay order and payment IDs and the payment status.
            We never receive or store your card number, CVV, UPI PIN or bank login.
          </li>
          <li>
            <strong>Messages:</strong> anything you send us by email, phone, WhatsApp or the contact form.
          </li>
          <li>
            <strong>Technical data:</strong> your IP address and basic request information, used briefly to keep the website
            secure, for example to block repeated failed login attempts.
          </li>
        </ul>
        <p>
          You can browse and design without giving us any personal data. Photo previews are drawn in your own browser, and a
          photo is uploaded only when you add a design to your cart.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your data",
    content: (
      <>
        <p>We use your personal data to:</p>
        <ul>
          <li>print, pack and deliver your order, and contact you about it;</li>
          <li>process payments and refunds, and prevent fraud;</li>
          <li>send order confirmations and updates by email;</li>
          <li>manage your account, saved addresses and order history;</li>
          <li>answer your questions and handle complaints, reprints and returns;</li>
          <li>keep the website secure and working properly; and</li>
          <li>meet our legal, tax and accounting obligations.</li>
        </ul>
        <p>
          We process your data because you&apos;ve asked us to fulfil an order or provide a service, because you&apos;ve given
          consent, or because the law requires it. <strong>We don&apos;t sell your data, we don&apos;t show you targeted ads,
          and we never use your photos for marketing</strong> without your separate, explicit permission.
        </p>
      </>
    ),
  },
  {
    id: "photos",
    title: "Your photos",
    content: (
      <>
        <p>
          Your photos are used only to make your order and to check its print quality. They&apos;re stored in secure
          cloud storage and can be seen only by our production team. They&apos;re never shared publicly or used to train
          any software.
        </p>
        <p>
          We keep uploaded photos only as long as we need them to finish your order and handle any reprint or replacement
          request. After that, we delete them. You can ask us to delete your photos sooner, though once printing has started,
          we&apos;ll need them until your order is delivered.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    content: (
      <>
        <p>We share your data only with trusted partners who help us run the shop, and only what they need:</p>
        <ul>
          <li>
            <strong>Razorpay</strong> processes online payments. Your payment details go straight to Razorpay and are handled
            under its own privacy policy.
          </li>
          <li>
            <strong>Courier and logistics partners</strong> receive your name, phone number and delivery address to deliver
            your parcel.
          </li>
          <li>
            <strong>Cloud and technology providers</strong> host the website, database and photo storage, and send our emails.
          </li>
          <li>
            <strong>Government or law enforcement authorities</strong>, when we&apos;re legally required to share information.
          </li>
        </ul>
        <p>
          These partners may only use your data to provide their service to us. Some of them may store data on servers
          outside India, and when that happens we rely on safeguards permitted under Indian law.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    content: (
      <>
        <p>We keep this minimal and don&apos;t use advertising or tracking cookies:</p>
        <ul>
          <li>
            <strong>A sign-in cookie</strong> keeps you logged in to your account for up to 30 days. It&apos;s set only when
            you log in or sign up, and it&apos;s removed when you log out.
          </li>
          <li>
            <strong>Your cart</strong> is saved in your browser&apos;s local storage, so it&apos;s still there when you come
            back. It stays on your device and isn&apos;t sent to us until you check out.
          </li>
          <li>
            <strong>Razorpay&apos;s checkout</strong>, which loads only on the checkout page, may set its own cookies to process
            your payment securely.
          </li>
        </ul>
        <p>You can clear cookies and local storage in your browser settings at any time. Doing so empties your cart and signs you out.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    content: (
      <ul>
        <li>
          <strong>Order records and invoices</strong> are kept for as long as Indian tax and accounting laws require.
        </li>
        <li>
          <strong>Account details</strong> are kept until you ask us to delete your account.
        </li>
        <li>
          <strong>Uploaded photos</strong> are deleted once your order is complete and any reprint or replacement window has
          passed (see section 4).
        </li>
        <li>
          <strong>Messages and complaints</strong> are kept for as long as we need them to resolve your query and any follow-up.
        </li>
      </ul>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    content: (
      <p>
        The website runs over encrypted HTTPS connections. Passwords are stored as one-way hashes, payments are handled by
        Razorpay&apos;s PCI-DSS compliant checkout, and access to order data and photos is limited to the people who need it to
        fulfil your order. No system is completely secure, but if a breach ever affects your personal data, we&apos;ll inform
        you and the authorities as the law requires.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: (
      <>
        <p>Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
        <ul>
          <li>ask what personal data we hold about you and how we use it;</li>
          <li>correct or update inaccurate or incomplete data;</li>
          <li>have your data deleted when it&apos;s no longer needed, unless the law requires us to keep it;</li>
          <li>withdraw your consent at any time, though this won&apos;t affect processing already done;</li>
          <li>nominate someone to exercise these rights for you in case of death or incapacity; and</li>
          <li>raise a grievance with us and, if you&apos;re not satisfied, complain to the Data Protection Board of India.</li>
        </ul>
        <p>
          To use any of these rights, email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> from the email address linked to your
          orders or account. You can also update your saved addresses yourself on your{" "}
          <Link href="/account">account page</Link>. We&apos;ll respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's data",
    content: (
      <p>
        Our website is meant for adults. If you&apos;re under 18, please ask a parent or guardian to order for you. We
        don&apos;t knowingly collect personal data from children without a parent&apos;s or guardian&apos;s consent. Photos of
        children uploaded by a parent or guardian for an order, such as for a baby photo album, are used only to make that order.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy when our services or the law change. The &ldquo;Last updated&rdquo; date at the top shows when
        it was last changed. If we make a significant change, we&apos;ll show a notice on the website or email you.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact and grievance officer",
    content: (
      <>
        <p>For any privacy question, request or complaint, please contact us:</p>
        <ul>
          <li>
            Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            Phone / WhatsApp: <a href="tel:+919835674095">{PHONE}</a> (Monday–Saturday, 9 AM – 7 PM)
          </li>
          <li>Address: {ADDRESS}</li>
        </ul>
        <p>
          We acknowledge grievances within 48 hours and aim to resolve them within 30 days. Also see our{" "}
          <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="26 October 2026"
      intro={
        <p>
          Your photos often hold your most personal memories, and we treat them that way. This policy explains, in plain
          language, what personal data we collect when you use PrintsBazar, why we need it, who we share it with, and the
          choices and rights you have.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
