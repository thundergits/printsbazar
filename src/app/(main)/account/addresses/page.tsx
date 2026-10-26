"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Star, X, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

interface Address {
  id: string; label: string; name: string; phone: string;
  line1: string; line2?: string | null; city: string; state: string; pincode: string; isDefault: boolean;
}

const EMPTY_FORM = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/account/addresses").then((r) => r.json()).then(setAddresses).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      load();
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast.success("Address added");
    } catch {
      toast.error("Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address deleted");
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to account
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-gray-800">Saved Addresses</h1>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> Add New
          </Button>
        </div>

        {showForm && (
          <div className="card p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">New Address</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Label" placeholder="Home, Office…" value={form.label} onChange={update("label")} />
              <Input label="Full Name *" value={form.name} onChange={update("name")} />
            </div>
            <Input label="Mobile Number *" type="tel" value={form.phone} onChange={update("phone")} />
            <Input label="Address Line 1 *" value={form.line1} onChange={update("line1")} />
            <Input label="Address Line 2" value={form.line2} onChange={update("line2")} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City *" value={form.city} onChange={update("city")} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                <select value={form.state} onChange={update("state")} className="input">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Pincode *" value={form.pincode} onChange={update("pincode")} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} className="w-4 h-4 accent-brand-500" />
              <span className="text-sm text-gray-600">Set as default address</span>
            </label>
            <Button onClick={handleAdd} loading={saving} className="w-full rounded-xl">
              <Check className="w-4 h-4" /> Save Address
            </Button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading…</p>
        ) : addresses.length === 0 && !showForm ? (
          <div className="card p-10 text-center text-gray-400">
            <p className="font-medium">No saved addresses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className="card p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{a.label}</span>
                    {a.isDefault && (
                      <span className="text-xs font-semibold text-gold-700 bg-gold-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Default
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-800">{a.name} · {a.phone}</p>
                  <p className="text-sm text-gray-500">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} – {a.pincode}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {!a.isDefault && (
                    <button onClick={() => handleSetDefault(a.id)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                      Set default
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
