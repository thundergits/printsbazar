import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with PrintsBazar for support, bulk orders, or any queries.",
};

const CONTACT_INFO = [
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 8969179285", href: "tel:+918969179285", sub: "Mon–Sat, 9am–7pm" },
  { icon: Mail, label: "Email", value: "hello@printsbazar.in", href: "mailto:hello@printsbazar.in", sub: "Reply within 24 hours" },
  {
    icon: MapPin,
    label: "Office",
    value: "C.R. Complex, R.K. Bhattacharya Road, Patna – 800001",
    href: "https://www.google.com/maps/search/?api=1&query=C.R.+Complex,+R.K.+Bhattacharya+Road,+Patna+800001",
    sub: "Visit by appointment",
  },
  { icon: Clock, label: "Working Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM", href: "#", sub: "Sunday: Closed" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream-50 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">Get in Touch</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Have questions about your order, customization, or anything else? We&apos;re here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {CONTACT_INFO.map((item) => {
              const isExternal = item.href.startsWith("http");
              return (
                <a
                  key={item.label}
                  href={item.href}
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="card p-5 flex gap-4 hover:border-brand-200 border border-transparent transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                </a>
              );
            })}

            <a
              href="https://wa.me/918969179285"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Contact form (client component) */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}