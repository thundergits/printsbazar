"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

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
    <div className="card p-8">
      <h2 className="font-semibold text-gray-800 text-xl mb-6">Send us a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input required className="input" placeholder="Priya Sharma" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input required type="email" className="input" placeholder="priya@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input type="tel" className="input" placeholder="9876543210" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
            <select required className="input bg-white" value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}>
              <option value="">Select a topic</option>
              <option>Order Status</option>
              <option>Customization Help</option>
              <option>Return / Refund</option>
              <option>Bulk / Corporate Order</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
          <textarea
            required
            rows={5}
            className="input resize-none"
            placeholder="Tell us how we can help…"
            value={form.message}
            onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
          />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-2xl" loading={loading}>
          <Send className="w-5 h-5" />
          {loading ? "Sending…" : "Send Message"}
        </Button>
      </form>
    </div>
  );
}
