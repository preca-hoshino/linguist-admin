import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateAuthToken } from '../jwt';

const generateToken = (payload: unknown): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const base64UrlPayload = btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const signature = 'signature';
  return `${header}.${base64UrlPayload}.${signature}`;
};

describe('validateAuthToken', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null for empty token', () => {
    expect(validateAuthToken('')).toBeNull();
  });

  it('should return null for invalid token format (not 3 parts)', () => {
    expect(validateAuthToken('invalid.token')).toBeNull();
    expect(validateAuthToken('only_one_part')).toBeNull();
  });

  it('should return null if base64 url payload is empty', () => {
    expect(validateAuthToken('header..signature')).toBeNull();
  });

  it('should decode a valid token correctly', () => {
    const payload = { sub: '123', exp: Math.floor(Date.now() / 1000) + 3600, iat: 12_345 };
    const token = generateToken(payload);
    expect(validateAuthToken(token)).toEqual(payload);
  });

  it('should handle special unicode characters in decoding', () => {
    const payload = { sub: '💡✨🌍', exp: 9_999_999_999, iat: 12_345 };
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

    // unicode to base64url representation
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(JSON.stringify(payload));
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCodePoint(byte);
    }
    const base64UrlPayload = btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    const token = `${header}.${base64UrlPayload}.signature`;

    expect(validateAuthToken(token)).toEqual(payload);
  });

  it('should return null if token is expired', () => {
    const currentTime = 1000;
    vi.setSystemTime(currentTime * 1000);
    const payload = { sub: '123', exp: currentTime - 10, iat: 12_345 };
    const token = generateToken(payload);

    expect(validateAuthToken(token)).toBeNull();
  });

  it('should catch validation errors and return null instead of throwing', () => {
    // Malformed JSON inside valid base64
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const invalidJsonBase64Url = btoa('{ invalid_json').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    const token = `${header}.${invalidJsonBase64Url}.signature`;

    expect(validateAuthToken(token)).toBeNull();
  });
});
