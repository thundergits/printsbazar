"use client";
import { useState } from "react";
import { Send, User, Mail, Phone, Tag, MessageSquare, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

const fieldCls =
  "w-full pl-11 pr-4 py-3 rounded-2xl border border-cream-200 bg-cream-50/60 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const iconCls = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 pointer-events-none";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We’ll get back to you within 24 hours.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden h-full bg-white rounded-3xl shadow-card border border-brand-100/60">
      <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
      <div className="p-6 sm:p-8">
        <div className="mb-7">
          <p className="text-brand-600 font-medium text-xs uppercase tracking-[0.2em] mb-2">Write to us</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-maroon-700">
            Send us a <span className="italic font-normal text-gradient">Message</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Full Name *</label>
              <div className="relative">
                <User className={iconCls} />
                <input required className={fieldCls} placeholder="Priya Sharma" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <div className="relative">
                <Mail className={iconCls} />
                <input required type="email" className={fieldCls} placeholder="priya@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Phone</label>
              <div className="relative">
                <Phone className={iconCls} />
                <input type="tel" className={fieldCls} placeholder="9876543210" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Subject *</label>
              <div className="relative">
                <Tag className={iconCls} />
                <select required className={`${fieldCls} appearance-none pr-10 cursor-pointer`} value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}>
                  <option value="">Select a topic</option>
                  <option>Order Status</option>
                  <option>Customization Help</option>
                  <option>Return / Refund</option>
                  <option>Bulk / Corporate Order</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Message *</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-brand-500 pointer-events-none" />
              <textarea
                required
                rows={5}
                className={`${fieldCls} resize-none`}
                placeholder="Tell us how we can help…"
                value={form.message}
                onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full shadow-lg shadow-brand-500/30" loading={loading}>
            <Send className="w-5 h-5" />
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
