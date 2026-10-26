// Shared by middleware (Edge runtime) and route handlers, so no Node-only imports here.

let cached: Uint8Array | null = null;

/** Key for signing session JWTs. There is deliberately no fallback: a guessable
 *  default would let anyone forge admin tokens if the env var went missing. */
export function jwtSecret(): Uint8Array {
  if (cached) return cached;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
  }
  cached = new TextEncoder().encode(secret);
  return cached;
}
