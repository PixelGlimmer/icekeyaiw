export const TOTP_PERIOD = 30;
export const TOTP_DIGITS = 6;

export function base32Decode(secret: string): Uint8Array {
  const cleaned = secret.replace(/[\s=]/g, "").toUpperCase();
  if (!/^[A-Z2-7]+$/.test(cleaned)) {
    throw new Error("Secret contains invalid Base32 characters");
  }
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of cleaned) {
    const value = alphabet.indexOf(char);
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

export function base32Encode(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 0x1f];
  }
  return output;
}

export async function generateTOTP(
  secretBase32: string,
  period = TOTP_PERIOD,
  digits = TOTP_DIGITS,
  timestamp = Date.now()
): Promise<string> {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(timestamp / 1000 / period);
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(0, Math.floor(counter / 0x100000000));
  counterView.setUint32(4, counter >>> 0);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const hashBuffer = await crypto.subtle.sign("HMAC", cryptoKey, counterBuffer);
  const hash = new Uint8Array(hashBuffer);

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  return (binary % 10 ** digits).toString().padStart(digits, "0");
}

export function parseOtpauthUri(uri: string): { name: string; secret: string; issuer?: string } | null {
  try {
    if (!uri.startsWith("otpauth://totp/")) return null;
    const u = new URL(uri);
    const label = decodeURIComponent(u.pathname.slice(1));
    const [issuerFromLabel, nameFromLabel] = label.includes(":")
      ? label.split(":")
      : [u.searchParams.get("issuer") || "", label];
    const secret = u.searchParams.get("secret") || "";
    if (!secret) return null;
    const name = (nameFromLabel || u.searchParams.get("issuer") || "Account").trim();
    return {
      name,
      secret: secret.replace(/\s/g, ""),
      issuer: (issuerFromLabel || u.searchParams.get("issuer") || "").trim(),
    };
  } catch {
    return null;
  }
}

export function secondsRemaining(period = TOTP_PERIOD, timestamp = Date.now()): number {
  return period - (Math.floor(timestamp / 1000) % period);
}

export function buildOtpauthUri(name: string, secret: string, issuer?: string): string {
  const label = issuer ? `${issuer}:${name}` : name;
  const params = new URLSearchParams({
    secret,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD),
    issuer: issuer || "ICEKEY",
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}
