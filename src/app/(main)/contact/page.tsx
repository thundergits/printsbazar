import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Clock, ChevronRight, ArrowUpRight, Headphones } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with PrintsBazar for support, bulk orders, or any queries.",
};

const ADDRESS = "C.R. Complex, R.K. Bhattacharya Road, Patna – 800001";

const CONTACT_INFO = [
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 8969179285", href: "tel:+918969179285", sub: "Mon–Sat, 9am–7pm" },
  { icon: Mail, label: "Email", value: "hello@printsbazar.in", href: "mailto:hello@printsbazar.in", sub: "Reply within 24 hours" },
  {
    icon: MapPin,
    label: "Office",
    value: ADDRESS,
    href: "https://www.google.com/maps/search/?api=1&query=C.R.+Complex,+R.K.+Bhattacharya+Road,+Patna+800001",
    sub: "Visit by appointment",
  },
  { icon: Clock, label: "Working Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM", href: null, sub: "Sunday: Closed" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-maroon-800 via-maroon-700 to-maroon-800 pt-12 pb-28 sm:pt-16 sm:pb-32">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <Headphones className="hidden md:block absolute right-[8%] top-1/2 -translate-y-1/2 w-40 h-40 text-brand-400/10" strokeWidth={1} />
        <MessageCircle className="hidden md:block absolute left-[7%] top-1/3 w-24 h-24 text-brand-400/10" strokeWidth={1} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex items-center justify-center gap-1 text-xs text-white/50 mb-5">
            <Link href="/" className="hover:text-brand-300 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-300">Contact</span>
          </nav>
          <p className="text-brand-400 font-medium text-xs sm:text-sm uppercase tracking-[0.25em] mb-3">We&apos;re here for you</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Get in <span className="italic font-normal text-gradient">Touch</span>
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm sm:text-base">
            Have questions about your order, customization, or anything else? We&apos;re here to help!
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="relative -mt-20 sm:-mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_INFO.map((item) => {
            const isExternal = item.href?.startsWith("http");
            const body = (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  {item.href && (
                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600 mb-1">{item.label}</p>
                <p className="font-semibold text-maroon-700 text-sm leading-snug break-words">{item.value}</p>
                <p className="text-xs text-gray-400 mt-1.5">{item.sub}</p>
              </>
            );
            const cls = "group block h-full bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-brand-100/60 transition-all duration-300";
            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`${cls} hover:shadow-card-hover hover:-translate-y-1 hover:border-brand-200`}
              >
                {body}
              </a>
            ) : (
              <div key={item.label} className={cls}>{body}</div>
            );
          })}
        </div>
      </section>

      {/* Form + side panel */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Contact form (client component) */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Side panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-800 via-maroon-700 to-maroon-800 p-7 text-white">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-green-500/20 blur-3xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">
                  Need a <span className="italic font-normal text-gradient">quick</span> reply?
                </h3>
                <p className="text-white/60 text-sm mb-6">Mon–Sat, 9am–7pm</p>
                <a
                  href="https://wa.me/918969179285"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-full transition-colors shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="flex-1 min-h-[260px] rounded-3xl overflow-hidden bg-white p-2 shadow-card border border-brand-100/60 flex flex-col">
              <iframe
                title="PrintsBazar office location"
                src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
                className="w-full flex-1 min-h-[220px] rounded-2xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-500">
                <MapPin className="w-4 h-4 flex-shrink-0 text-brand-500" />
                <span className="line-clamp-1">{ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
