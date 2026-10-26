import Razorpay from "razorpay";
import { createHmac } from "crypto";
import { safeEqual } from "@/lib/api";

let client: Razorpay | null = null;

export function razorpayConfigured(): boolean {
  const id = process.env.RAZORPAY_KEY_ID;
  return Boolean(id && id !== "rzp_test_REPLACE_ME" && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

export function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return safeEqual(expected, signature);
}
