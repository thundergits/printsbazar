"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, User, Mail, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import AuthShell, { fieldCls, iconCls, labelCls } from "../AuthShell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid email or password");
        return;
      }
      router.push(searchParams.get("from") || "/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center md:text-left mb-8">
        <div className="hidden md:inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 mb-5">
          <User className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-maroon-700">
          Welcome <span className="italic font-normal text-gradient">back</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to your PrintsBazar account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className={labelCls}>Email</label>
          <div className="relative">
            <Mail className={iconCls} />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={fieldCls}
            />
          </div>
        </div>
        <div>
          <label htmlFor="login-password" className={labelCls}>Password</label>
          <div className="relative">
            <Lock className={iconCls} />
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <Button type="submit" size="lg" className="w-full rounded-full shadow-lg shadow-brand-500/30" loading={loading}>
          {loading ? "Signing in…" : <>Sign In <ArrowRight className="w-5 h-5" /></>}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-7">
        <span className="h-px flex-1 bg-cream-200" />
        <span className="text-xs text-gray-400">New here?</span>
        <span className="h-px flex-1 bg-cream-200" />
      </div>

      <Link
        href="/account/signup"
        className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-maroon-700 py-3 text-sm font-semibold text-maroon-700 transition-colors hover:bg-maroon-700 hover:text-white"
      >
        Create an account
      </Link>
    </AuthShell>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-cream-50" />}>
      <LoginForm />
    </Suspense>
  );
}
