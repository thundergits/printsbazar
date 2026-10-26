"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, X, Check } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Coupon {
  id: string; code: string; type: string; value: number;
  minOrder: number; maxUses: number | null; usedCount: number;
  isActive: boolean; expiresAt: string | null; createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "",
  });

  useEffect(() => {
    fetch("/api/admin/coupons").then(r => r.json()).then(setCoupons).finally(() => setLoading(false));
  }, []);

  const toggle = async (c: Coupon) => {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
    });
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
    toast.success(c.isActive ? "Coupon disabled" : "Coupon enabled");
  };

  const deleteCoupon = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id }),
    });
    setCoupons(prev => prev.filter(x => x.id !== c.id));
    toast.success("Coupon deleted");
  };

  const addCoupon = async () => {
    if (!newCoupon.code || !newCoupon.value) { toast.error("Code and value are required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      if (!res.ok) { const e = await res.json(); toast.error(e.error || "Failed"); return; }
      const c = await res.json();
      setCoupons(prev => [c, ...prev]);
      setShowAdd(false);
      setNewCoupon({ code: "", type: "percent", value: "", minOrder: "", maxUses: "", expiresAt: "" });
      toast.success("Coupon created!");
    } catch { toast.error("Failed to create coupon"); }
    finally { setAdding(false); }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Create New Coupon</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Code *</label>
              <input
                type="text"
                placeholder="e.g. SAVE20"
                value={newCoupon.code}
                onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white uppercase placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
              <select value={newCoupon.type} onChange={e => setNewCoupon(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Value * {newCoupon.type === "percent" ? "(%)" : "(₹)"}
              </label>
              <input type="number" placeholder={newCoupon.type === "percent" ? "20" : "100"}
                value={newCoupon.value} onChange={e => setNewCoupon(p => ({ ...p, value: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Order (₹)</label>
              <input type="number" placeholder="0" value={newCoupon.minOrder}
                onChange={e => setNewCoupon(p => ({ ...p, minOrder: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Max Uses</label>
              <input type="number" placeholder="Unlimited" value={newCoupon.maxUses}
                onChange={e => setNewCoupon(p => ({ ...p, maxUses: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Expires At</label>
              <input type="date" value={newCoupon.expiresAt}
                onChange={e => setNewCoupon(p => ({ ...p, expiresAt: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={addCoupon} disabled={adding}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
              {adding ? "Creating…" : <><Check className="w-4 h-4" /> Create Coupon</>}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 hover:text-white text-sm font-medium rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {/* Coupons list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
          <Tag className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No coupons yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const isFull = c.maxUses !== null && c.usedCount >= c.maxUses;
            return (
              <div key={c.id} className={cn(
                "bg-gray-900 border rounded-2xl p-5 transition-colors",
                c.isActive && !isExpired && !isFull ? "border-gray-800" : "border-gray-800 opacity-60"
              )}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-lg tracking-wider">{c.code}</span>
                      {!c.isActive && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Disabled</span>}
                      {isExpired && <span className="text-xs bg-red-400/10 text-red-400 border border-red-400/20 px-2 py-0.5 rounded-full">Expired</span>}
                      {isFull && <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-full">Limit reached</span>}
                    </div>
                    <p className="text-brand-400 font-semibold text-sm mt-0.5">
                      {c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`}
                      {c.minOrder > 0 && <span className="text-gray-500 font-normal"> · min {formatPrice(c.minOrder)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggle(c)} className="text-gray-400 hover:text-white transition-colors p-1">
                      {c.isActive ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-gray-600" />}
                    </button>
                    <button onClick={() => deleteCoupon(c)} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Used: <span className="text-white font-medium">{c.usedCount}</span>{c.maxUses ? `/${c.maxUses}` : ""}</span>
                  {c.expiresAt && (
                    <span>Expires: <span className={cn("font-medium", isExpired ? "text-red-400" : "text-white")}>
                      {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                    </span></span>
                  )}
                  {!c.expiresAt && <span className="text-gray-600">No expiry</span>}
                </div>

                {/* Usage bar */}
                {c.maxUses && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
