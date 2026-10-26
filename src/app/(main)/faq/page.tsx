import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import FaqList from "./FaqList";
import { FAQ_SECTIONS } from "./faqs";

export const metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ordering personalised acrylic photos, wall clocks and name plates — photos, delivery, payments, tracking and returns.",
};

// Lets search engines show these answers directly in results
const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_SECTIONS.flatMap((s) =>
    s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-cream-50 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Everything you need to know about personalising, ordering and receiving your PrintsBazar gifts.
          </p>
        </div>

        <nav aria-label="FAQ sections" className="flex flex-wrap justify-center gap-2 mb-12">
          {FAQ_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 hover:text-gray-900 shadow-card transition-colors"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <FaqList sections={FAQ_SECTIONS} />

        <div className="card p-8 mt-14 text-center">
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Still have a question?</h2>
          <p className="text-gray-500 mb-6">We&apos;re happy to help, Monday to Saturday, 9 AM – 7 PM.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="https://wa.me/919835674095"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
            <a
              href="tel:+919835674095"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:border-brand-300 transition-colors"
            >
              <Phone className="w-4 h-4" /> +91 98356 74095
            </a>
            <a
              href="mailto:hello@printsbazar.in"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:border-brand-300 transition-colors"
            >
              <Mail className="w-4 h-4" /> Email us
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-5">
            Or use our <Link href="/contact" className="text-brand-700 font-semibold hover:underline">contact form</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
