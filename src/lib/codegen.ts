// Base62 short-code generation using the Web Crypto API.
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a URL-safe base62 code of the given length.
 * Uses rejection sampling (reject bytes >= 248) to avoid modulo bias.
 */
export function generateCode(length = 7): string {
  if (length <= 0) return '';
  let out = '';
  while (out.length < length) {
    const bytes = new Uint8Array(length - out.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < 248) {
        out += BASE62.charAt(byte % 62);
        if (out.length === length) break;
      }
    }
  }
  return out;
}
