"use client";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#1c0a00",
            border: "1px solid #ffd9b3",
            borderRadius: "12px",
            fontFamily: "var(--font-poppins)",
          },
          success: { iconTheme: { primary: "#f97316", secondary: "#fff" } },
        }}
      />
    </>
  );
}
