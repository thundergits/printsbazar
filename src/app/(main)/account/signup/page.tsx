"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, User, UserPlus, Mail, Phone, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import AuthShell, { fieldCls, iconCls, labelCls } from "../AuthShell";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Signup failed");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center md:text-left mb-7">
        <div className="hidden md:inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 mb-5">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-maroon-700">
          Create your <span className="italic font-normal text-gradient">account</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track orders & save your addresses</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className={labelCls}>Full Name</label>
          <div className="relative">
            <User className={iconCls} />
            <input
              id="signup-name"
              required
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              placeholder="Priya Sharma"
              className={fieldCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="signup-email" className={labelCls}>Email</label>
          <div className="relative">
            <Mail className={iconCls} />
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className={fieldCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="signup-phone" className={labelCls}>
            Mobile Number <span className="normal-case tracking-normal font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <Phone className={iconCls} />
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="9876543210"
              className={fieldCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="signup-password" className={labelCls}>Password</label>
          <div className="relative">
            <Lock className={iconCls} />
            <input
              id="signup-password"
              type={showPass ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              placeholder="At least 8 characters"
              className={`${fieldCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full rounded-full shadow-lg shadow-brand-500/30 !mt-6" loading={loading}>
          {loading ? "Creating account…" : <>Create Account <ArrowRight className="w-5 h-5" /></>}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <span className="h-px flex-1 bg-cream-200" />
        <span className="text-xs text-gray-400">Already have an account?</span>
        <span className="h-px flex-1 bg-cream-200" />
      </div>

      <Link
        href="/account/login"
        className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-maroon-700 py-3 text-sm font-semibold text-maroon-700 transition-colors hover:bg-maroon-700 hover:text-white"
      >
        Sign in
      </Link>
    </AuthShell>
  );
}
