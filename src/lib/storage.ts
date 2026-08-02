export interface StoredAccount {
  id: string;
  name: string;
  issuer?: string;
  secret: string;
  createdAt: number;
}

const STORAGE_KEY = "icekey.vault.v1";
const SALT_KEY = "icekey.salt.v1";
const PASS_CONFIG_KEY = "icekey.passcfg.v1";

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

function toB64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromB64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptVault(accounts: StoredAccount[], passphrase: string): Promise<void> {
  const salt = fromB64(localStorage.getItem(SALT_KEY) || toB64(randomBytes(16)));
  if (!localStorage.getItem(SALT_KEY)) localStorage.setItem(SALT_KEY, toB64(salt));
  const key = await deriveKey(passphrase, salt);
  const iv = randomBytes(12);
  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(accounts));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    plaintext
  );
  const blob = JSON.stringify({
    iv: toB64(iv),
    data: toB64(new Uint8Array(ciphertext)),
  });
  localStorage.setItem(STORAGE_KEY, blob);
  localStorage.setItem(PASS_CONFIG_KEY, JSON.stringify({ set: true, at: Date.now() }));
}

export async function decryptVault(passphrase: string): Promise<StoredAccount[]> {
  const blob = localStorage.getItem(STORAGE_KEY);
  if (!blob) return [];
  const saltB64 = localStorage.getItem(SALT_KEY);
  if (!saltB64) return [];
  const parsed = JSON.parse(blob) as { iv: string; data: string };
  const salt = fromB64(saltB64);
  const key = await deriveKey(passphrase, salt);
  const iv = fromB64(parsed.iv);
  const ciphertext = fromB64(parsed.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    ciphertext as unknown as BufferSource
  );
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decrypted)) as StoredAccount[];
}

export function isVaultInitialized(): boolean {
  return JSON.parse(localStorage.getItem(PASS_CONFIG_KEY) || "null")?.set === true;
}

export function hasStoredVault(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function clearVault(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(PASS_CONFIG_KEY);
}
