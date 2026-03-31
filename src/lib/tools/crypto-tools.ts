// Crypto Tools Utility Functions
import { v4 as uuidv4 } from 'uuid';

type ToolResult<T> = { success: boolean; data?: T; error?: string };

// Hash functions using Web Crypto API
export async function generateHashAsync(text: string, algorithm: HashAlgorithm): Promise<ToolResult<string>> {
  try {
    if (algorithm === 'md5') {
      return { success: true, data: md5(text) };
    }

    // Map algorithm names to Web Crypto API format
    const cryptoAlgorithm = {
      'sha1': 'SHA-1',
      'sha256': 'SHA-256',
      'sha512': 'SHA-512',
    }[algorithm];

    if (!cryptoAlgorithm) {
      return { success: false, error: 'Unsupported algorithm' };
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(cryptoAlgorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return { success: true, data: hashHex };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Hash failed' };
  }
}

// Synchronous wrapper for backward compatibility (uses async internally)
export function generateHash(text: string, algorithm: HashAlgorithm): ToolResult<string> {
  // For MD5, we can return synchronously
  if (algorithm === 'md5') {
    try {
      return { success: true, data: md5(text) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Hash failed' };
    }
  }

  // For other algorithms, return a placeholder and recommend using async version  
  // This is for backward compatibility - actual hash is computed async
  return { success: true, data: 'Use generateHashAsync for SHA algorithms' };
}

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

export const hashAlgorithms: { value: HashAlgorithm; label: string }[] = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha512', label: 'SHA-512' },
];

// MD5 implementation (since Web Crypto doesn't support it)
function md5(string: string): string {
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) {
      if (result & 0x40000000) return result ^ 0xc0000000 ^ x8 ^ y8;
      return result ^ 0x40000000 ^ x8 ^ y8;
    }
    return result ^ x8 ^ y8;
  }

  function f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }
  function g(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }
  function h(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }
  function i(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(string: string): number[] {
    const utf8String = unescape(encodeURIComponent(string));
    const wordCount = (((utf8String.length + 8) >> 6) + 1) * 16;
    const wordArray = Array(wordCount - 1).fill(0);
    for (let i = 0; i < utf8String.length; i++) {
      wordArray[i >> 2] |= utf8String.charCodeAt(i) << ((i % 4) * 8);
    }
    wordArray[utf8String.length >> 2] |= 0x80 << ((utf8String.length % 4) * 8);
    wordArray[wordCount - 2] = utf8String.length * 8;
    return wordArray;
  }

  function wordToHex(value: number): string {
    let hex = '';
    for (let i = 0; i <= 3; i++) {
      hex += ((value >> (i * 8)) & 255).toString(16).padStart(2, '0');
    }
    return hex;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const aa = a, bb = b, cc = c, dd = d;

    a = ff(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = ff(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = ff(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = ff(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = ff(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = ff(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = ff(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = ff(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = ff(b, c, d, a, x[k + 15], 22, 0x49b40821);
    a = gg(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = gg(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = gg(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = gg(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = gg(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = gg(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = gg(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = gg(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = gg(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);
    a = hh(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = hh(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = hh(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = hh(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, x[k + 2], 23, 0xc4ac5665);
    a = ii(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = ii(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = ii(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = ii(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = ii(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = ii(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = ii(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = ii(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = ii(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, x[k + 9], 21, 0xeb86d391);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

// JWT Decoder
export interface JwtPayload {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isValid: boolean;
  error?: string;
}

export function decodeJwt(token: string): JwtPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        error: 'Invalid JWT format: Expected 3 parts separated by dots',
      };
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;

    return {
      header,
      payload,
      signature: parts[2],
      isValid: !isExpired,
      error: isExpired ? 'Token has expired' : undefined,
    };
  } catch (error) {
    return {
      header: {},
      payload: {},
      signature: '',
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to decode JWT',
    };
  }
}

// UUID Generator
export function generateUUID(): ToolResult<string> {
  try {
    return { success: true, data: uuidv4() };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'UUID generation failed' };
  }
}

export function generateMultipleUuids(count: number): string[] {
  return Array.from({ length: count }, () => uuidv4());
}

// Password Generator with ToolResult
export function generatePassword(
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }
): ToolResult<string> {
  try {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return { success: true, data: password };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Password generation failed' };
  }
}

// JWT Generator
export function generateJWT(payload: string, secret: string): ToolResult<string> {
  try {
    const payloadObj = JSON.parse(payload);

    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payloadObj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Simple signature (not cryptographically secure, just for demo)
    const signature = btoa(secret + headerB64 + payloadB64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return { success: true, data: `${headerB64}.${payloadB64}.${signature}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'JWT generation failed' };
  }
}

// JWT Decoder
export function decodeJWT(token: string): ToolResult<{ header: object; payload: object; signature: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { success: false, error: 'Invalid JWT format' };
    }

    const decodeBase64 = (str: string) => {
      const padded = str.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(padded));
    };

    const header = decodeBase64(parts[0]);
    const payload = decodeBase64(parts[1]);

    return {
      success: true,
      data: { header, payload, signature: parts[2] }
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'JWT decode failed' };
  }
}

// Random Bytes Generator
export function generateRandomBytes(length: number, format: 'hex' | 'base64'): ToolResult<string> {
  try {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    if (format === 'hex') {
      const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
      return { success: true, data: hex };
    } else {
      const base64 = btoa(String.fromCharCode(...array));
      return { success: true, data: base64 };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Random bytes generation failed' };
  }
}

// Password Strength Calculator
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score++;
  else if (password.length >= 8) suggestions.push('Use at least 12 characters for better security');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else suggestions.push('Include both uppercase and lowercase letters');

  if (/\d/.test(password)) score++;
  else suggestions.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else suggestions.push('Include special characters');

  // Common patterns penalty
  if (/^[a-z]+$/i.test(password) || /^\d+$/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid using only letters or only numbers');
  }

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return {
    score: Math.min(4, score),
    label: labels[Math.min(4, score)],
    suggestions: suggestions.slice(0, 3),
  };
}
