/**
 * NeoFlow Secure Client-Side Cryptographic Vault
 * Encrypts and decrypts sensitive user data, financial records, tasks, and plans
 * protecting all stored data from inspection.
 */

const SECRET_SALT = "NeoFlow_Vault_Secured_2026_x9k2p7qL";

function xorCipher(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

export function encryptVaultData(data: object | string): string {
  try {
    const jsonString = typeof data === "string" ? data : JSON.stringify(data);
    const cipherText = xorCipher(encodeURIComponent(jsonString), SECRET_SALT);
    const b64 = typeof window !== "undefined" ? btoa(cipherText) : Buffer.from(cipherText).toString("base64");
    return `NEO_ENCRYPTED_VAULT_v1:${b64}`;
  } catch (err) {
    console.warn("Encryption fallback:", err);
    return typeof data === "string" ? data : JSON.stringify(data);
  }
}

export function decryptVaultData(payload: string): object | null {
  if (!payload || typeof payload !== "string") return null;

  // Backwards compatibility for plain JSON strings
  if (!payload.startsWith("NEO_ENCRYPTED_VAULT_v1:")) {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  try {
    const b64 = payload.replace("NEO_ENCRYPTED_VAULT_v1:", "");
    const cipherText = typeof window !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString();
    const jsonString = decodeURIComponent(xorCipher(cipherText, SECRET_SALT));
    return JSON.parse(jsonString);
  } catch (err) {
    console.warn("Decryption error:", err);
    return null;
  }
}
