import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCookie, removeCookie, setCookie } from '../cookies';

describe('cookies util', () => {
  beforeEach(() => {
    // Basic mock of document.cookie
    let cookieStore = '';
    vi.stubGlobal('document', {
      get cookie() {
        return cookieStore;
      },
      set cookie(val: string) {
        const keyVal = val.split(';')[0] ?? '';
        if (val.includes('max-age=0')) {
          cookieStore = cookieStore.replaceAll(new RegExp(String.raw`(^|;\s*)${keyVal}(;|$)`, 'g'), '');
        } else {
          // Simplistic mock to support adding/updating single key
          if (cookieStore !== '') {
            cookieStore += '; ';
          }
          cookieStore += keyVal;
        }
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getCookie', () => {
    it('should return undefined if document is undefined', () => {
      const doc = globalThis.document;
      // @ts-expect-error - testing undefined environment
      delete globalThis.document;
      expect(getCookie('test')).toBeUndefined();
      globalThis.document = doc;
    });

    it('should return undefined if cookie not found', () => {
      // biome-ignore lint/suspicious/noDocumentCookie: allow in utils test
      document.cookie = 'other=123';
      expect(getCookie('test')).toBeUndefined();
    });

    it('should return the cookie value if found', () => {
      // biome-ignore lint/suspicious/noDocumentCookie: allow in utils test
      document.cookie = 'test=456; other=123';
      expect(getCookie('test')).toBe('456');
    });

    it('should return value when it is the only cookie', () => {
      // biome-ignore lint/suspicious/noDocumentCookie: allow in utils test
      document.cookie = 'test=abc';
      expect(getCookie('test')).toBe('abc');
    });
  });

  describe('setCookie', () => {
    it('should not throw if document is undefined', () => {
      const doc = globalThis.document;
      // @ts-expect-error
      delete globalThis.document;
      expect(() => {
        setCookie('test', '123');
      }).not.toThrow();
      globalThis.document = doc;
    });

    it('should set a cookie value', () => {
      setCookie('test', 'hello');
      expect(document.cookie).toContain('test=hello');
    });

    it('should set a cookie with custom max age', () => {
      const mockSetCookie = vi.spyOn(document, 'cookie', 'set');
      setCookie('test2', 'world', 3600);
      expect(mockSetCookie).toHaveBeenCalledWith('test2=world; path=/; max-age=3600');
    });
  });

  describe('removeCookie', () => {
    it('should not throw if document is undefined', () => {
      const doc = globalThis.document;
      // @ts-expect-error
      delete globalThis.document;
      expect(() => {
        removeCookie('test');
      }).not.toThrow();
      globalThis.document = doc;
    });

    it('should remove a cookie by setting max-age=0', () => {
      const mockSetCookie = vi.spyOn(document, 'cookie', 'set');
      removeCookie('test');
      expect(mockSetCookie).toHaveBeenCalledWith('test=; path=/; max-age=0');
    });
  });
});
