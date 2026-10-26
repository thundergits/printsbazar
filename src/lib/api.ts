import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createHash, timingSafeEqual } from "crypto";
import type { ZodType, ZodTypeDef } from "zod";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/** Parses and validates a JSON body. Returns the data, or a 400 response to send back. */
export async function parseBody<T>(
  req: NextRequest,
  schema: ZodType<T, ZodTypeDef, unknown>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: jsonError("Invalid request body", 400) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.join(".");
    return { error: jsonError(field ? `${field}: ${issue.message}` : issue?.message ?? "Invalid input", 400) };
  }
  return { data: result.data };
}

export function isPrismaError(err: unknown, code: "P2002" | "P2025"): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === code;
}

/** Constant-time string comparison (hashing first makes the lengths equal). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
