"use client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
    >
      <LogOut className="w-4 h-4" /> Logout
    </button>
  );
}
