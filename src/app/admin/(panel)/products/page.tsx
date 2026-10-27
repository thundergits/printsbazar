"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check, Star, Layers } from "lucide-react";
import { formatPrice, cn, slugify } from "@/lib/utils";
import toast from "react-hot-toast";

interface VariantOption { label: string; value: string; }
interface Variant { id: string; name: string; priceAdj: number; options: VariantOption[]; }

interface Product {
  id: string; name: string; slug: string; imageUrl: string;
  basePrice: number; comparePrice?: number | null;
  isActive: boolean; isFeatured: boolean; isCustomizable: boolean;
  stock: number; category?: { name: string };
  variants?: Variant[];
}

interface VariantDraft { name: string; optionsText: string; priceAdj: string; }

interface Category { id: string; name: string; slug: string; }


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", basePrice: "", comparePrice: "",
    imageUrl: "", categoryId: "", isCustomizable: true, isFeatured: false,
  });
  const [addLoading, setAddLoading] = useState(false);

  const fetch_ = (q?: string) => {
    setLoading(true);
    const url = `/api/admin/products${q ? `?search=${encodeURIComponent(q)}` : ""}`;
    fetch(url).then(r => r.json()).then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch_();
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetch_(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleActive = async (p: Product) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (!res.ok) { toast.error("Failed to update product"); return; }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
    toast.success(p.isActive ? "Product hidden" : "Product visible");
  };

  const toggleFeatured = async (p: Product) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !p.isFeatured }),
    });
    if (!res.ok) { toast.error("Failed to update product"); return; }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFeatured: !x.isFeatured } : x));
    toast.success(p.isFeatured ? "Removed from featured" : "Added to featured");
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    const updated = await res.json();
    if (!res.ok) { toast.error(updated.error || "Failed to update product"); return; }
    setProducts(prev => prev.map(x => x.id === id ? { ...x, ...updated } : x));
    setEditingId(null);
    toast.success("Product updated");
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.basePrice || !newProduct.imageUrl || !newProduct.categoryId) {
      toast.error("Please fill all required fields");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const p = await res.json();
      if (!res.ok) { toast.error(p.error || "Failed to add product"); return; }
      setProducts(prev => [p, ...prev]);
      setShowAdd(false);
      setNewProduct({ name: "", description: "", basePrice: "", comparePrice: "", imageUrl: "", categoryId: "", isCustomizable: true, isFeatured: false });
      toast.success("Product added!");
    } catch {
      toast.error("Failed to add product");
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditValues({ name: p.name, basePrice: p.basePrice, comparePrice: p.comparePrice ?? undefined, stock: p.stock });
  };

  const [variantsEditingId, setVariantsEditingId] = useState<string | null>(null);
  const [variantDraft, setVariantDraft] = useState<VariantDraft[]>([]);
  const [savingVariants, setSavingVariants] = useState(false);

  const startVariantsEdit = (p: Product) => {
    setVariantsEditingId(p.id);
    setVariantDraft(
      (p.variants || []).map((v) => ({
        name: v.name,
        optionsText: v.options.map((o) => o.label).join(", "),
        priceAdj: String(v.priceAdj),
      }))
    );
  };

  const addVariantRow = () => setVariantDraft((d) => [...d, { name: "", optionsText: "", priceAdj: "0" }]);
  const removeVariantRow = (i: number) => setVariantDraft((d) => d.filter((_, idx) => idx !== i));
  const updateVariantRow = (i: number, field: keyof VariantDraft, value: string) =>
    setVariantDraft((d) => d.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));

  const saveVariants = async () => {
    if (!variantsEditingId) return;
    const variants = variantDraft
      .filter((v) => v.name.trim() && v.optionsText.trim())
      .map((v) => ({
        name: v.name.trim(),
        priceAdj: Number(v.priceAdj) || 0,
        options: v.optionsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((label) => ({ label, value: slugify(label) })),
      }));
    setSavingVariants(true);
    try {
      const res = await fetch(`/api/admin/products/${variantsEditingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants }),
      });
      const updated = await res.json();
      if (!res.ok) { toast.error(updated.error || "Failed to update variants"); return; }
      setProducts((prev) => prev.map((x) => (x.id === variantsEditingId ? { ...x, variants: updated.variants } : x)));
      setVariantsEditingId(null);
      toast.success("Variants updated");
    } catch {
      toast.error("Failed to update variants");
    } finally {
      setSavingVariants(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <span className="text-sm text-gray-400">{products.length} products</span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Add product form */}
      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Add New Product</h3>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Product Name *", key: "name", placeholder: "e.g. Custom Sticker Sheet" },
              { label: "Image URL *", key: "imageUrl", placeholder: "https://…" },
              { label: "Base Price (₹) *", key: "basePrice", placeholder: "249", type: "number" },
              { label: "Compare Price (₹)", key: "comparePrice", placeholder: "399", type: "number" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                <input
                  type={type || "text"}
                  placeholder={placeholder}
                  value={(newProduct as Record<string, unknown>)[key] as string}
                  onChange={e => setNewProduct(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
              <select
                value={newProduct.categoryId}
                onChange={e => setNewProduct(p => ({ ...p, categoryId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Product description…"
                value={newProduct.description}
                onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              {[{ key: "isCustomizable", label: "Customizable" }, { key: "isFeatured", label: "Featured" }].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(newProduct as Record<string, unknown>)[key] as boolean}
                    onChange={e => setNewProduct(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-brand-500"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={addProduct} disabled={addLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
              {addLoading ? "Adding…" : <><Check className="w-4 h-4" /> Add Product</>}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 border border-gray-700 text-gray-400 hover:text-white text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Variants editor */}
      {variantsEditingId && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              Variants — {products.find((p) => p.id === variantsEditingId)?.name}
            </h3>
            <button onClick={() => setVariantsEditingId(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            {variantDraft.length === 0 && (
              <p className="text-sm text-gray-500">No variants yet — e.g. add a &quot;Shape&quot; group with options like Square, Round, Heart.</p>
            )}
            {variantDraft.map((v, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_120px_auto] gap-3 items-start bg-gray-800/60 border border-gray-700 rounded-xl p-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Variant name</label>
                  <input
                    value={v.name}
                    onChange={(e) => updateVariantRow(i, "name", e.target.value)}
                    placeholder="e.g. Shape"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Options (comma-separated)</label>
                  <input
                    value={v.optionsText}
                    onChange={(e) => updateVariantRow(i, "optionsText", e.target.value)}
                    placeholder="e.g. Square, Round, Heart"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Price adj. (₹)</label>
                  <input
                    type="number"
                    value={v.priceAdj}
                    onChange={(e) => updateVariantRow(i, "priceAdj", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  onClick={() => removeVariantRow(i)}
                  className="self-end sm:self-center text-gray-500 hover:text-red-400 p-2"
                  aria-label="Remove variant group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addVariantRow} className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-medium">
              <Plus className="w-4 h-4" /> Add variant group
            </button>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={saveVariants} disabled={savingVariants}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
              {savingVariants ? "Saving…" : <><Check className="w-4 h-4" /> Save Variants</>}
            </button>
            <button onClick={() => setVariantsEditingId(null)} className="px-5 py-2.5 border border-gray-700 text-gray-400 hover:text-white text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-14 text-sm">No products found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                          {/* unoptimized: a product saved with an image host missing from next.config must not crash the admin table */}
                          <Image src={p.imageUrl} alt={p.name} fill unoptimized className="object-cover" sizes="48px" />
                        </div>
                        <div className="min-w-0">
                          {editingId === p.id ? (
                            <input
                              value={editValues.name ?? ""}
                              onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                              className="px-2 py-1 bg-gray-800 border border-brand-500 rounded-lg text-white text-sm w-48 focus:outline-none"
                            />
                          ) : (
                            <p className="text-white font-medium truncate max-w-[200px]">{p.name}</p>
                          )}
                          {p.isFeatured && (
                            <span className="text-xs text-yellow-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{p.category?.name || "—"}</td>
                    {/* Price */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {editingId === p.id ? (
                        <div className="flex flex-col gap-1">
                          <input type="number" value={editValues.basePrice ?? ""} onChange={e => setEditValues(v => ({ ...v, basePrice: Number(e.target.value) }))}
                            className="px-2 py-1 bg-gray-800 border border-brand-500 rounded-lg text-white text-sm w-24 focus:outline-none" placeholder="Price" />
                          <input type="number" value={editValues.comparePrice ?? ""} onChange={e => setEditValues(v => ({ ...v, comparePrice: Number(e.target.value) }))}
                            className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-xs w-24 focus:outline-none" placeholder="MRP" />
                        </div>
                      ) : (
                        <div>
                          <span className="text-white font-semibold">{formatPrice(p.basePrice)}</span>
                          {p.comparePrice && <span className="text-gray-500 text-xs line-through ml-2">{formatPrice(p.comparePrice)}</span>}
                        </div>
                      )}
                    </td>
                    {/* Stock */}
                    <td className="px-5 py-4">
                      {editingId === p.id ? (
                        <input type="number" value={editValues.stock ?? ""} onChange={e => setEditValues(v => ({ ...v, stock: Number(e.target.value) }))}
                          className="px-2 py-1 bg-gray-800 border border-brand-500 rounded-lg text-white text-sm w-20 focus:outline-none" />
                      ) : (
                        <span className={cn("text-sm", p.stock < 10 ? "text-red-400" : "text-gray-300")}>{p.stock}</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => toggleActive(p)} className="flex items-center gap-1.5 text-xs">
                          {p.isActive
                            ? <><ToggleRight className="w-4 h-4 text-green-400" /><span className="text-green-400">Visible</span></>
                            : <><ToggleLeft className="w-4 h-4 text-gray-500" /><span className="text-gray-500">Hidden</span></>}
                        </button>
                        <button onClick={() => toggleFeatured(p)} className="flex items-center gap-1.5 text-xs">
                          <span className={cn("flex items-center gap-1", p.isFeatured ? "text-yellow-400" : "text-gray-600")}>
                            <Star className={cn("w-3 h-3", p.isFeatured && "fill-current")} />
                            {p.isFeatured ? "Featured" : "Not featured"}
                          </span>
                        </button>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === p.id ? (
                          <>
                            <button onClick={() => saveEdit(p.id)} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-brand-400 transition-colors" aria-label="Edit product"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => startVariantsEdit(p)} className="text-gray-400 hover:text-brand-400 transition-colors" aria-label="Edit variants"><Layers className="w-4 h-4" /></button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete "${p.name}"?`)) return;
                                await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
                                setProducts(prev => prev.filter(x => x.id !== p.id));
                                toast.success("Product deleted");
                              }}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
