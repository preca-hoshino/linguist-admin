import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth-store';
import { getAdminKey, request } from '../client';

vi.mock('@/stores/auth-store');

describe('client API', () => {
  const mockFetch = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);

    // Default auth store state
    vi.mocked(useAuthStore.getState).mockReturnValue({
      auth: {
        accessToken: '',
        isInitialized: true,
        reset: mockReset,
      } as unknown as ReturnType<typeof useAuthStore.getState>['auth'],
    });

    // Mock Location
    const mockLocation = { href: '' };
    Object.defineProperty(globalThis, 'location', {
      value: mockLocation,
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('request core', () => {
    it('should successfully make a request without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({ id: 1, name: 'Test' }),
      } as unknown as Response);

      const result = await request('GET', '/users');
      expect(result).toEqual({ ok: true, data: { id: 1, name: 'Test' } });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should successfully make a request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({ success: true }),
      } as unknown as Response);

      const result = await request('POST', '/create', { foo: 'bar' });
      expect(result).toEqual({ ok: true, data: { success: true } });

      const fetchCall = mockFetch.mock.calls[0]?.[1] as RequestInit;
      expect(fetchCall.body).toBe(JSON.stringify({ foo: 'bar' }));
    });

    it('should attach Authorization header if accessToken exists', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        auth: { accessToken: 'my-token', isInitialized: true, reset: mockReset } as unknown as ReturnType<
          typeof useAuthStore.getState
        >['auth'],
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({}),
      } as unknown as Response);

      await request('GET', '/protected');

      const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer my-token');
    });

    it('should handle custom config headers and signal overrides', async () => {
      const abortController = new AbortController();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({}),
      } as unknown as Response);

      await request('GET', '/test', undefined, {
        headers: { 'X-Custom': 'yes' },
        signal: abortController.signal,
      });

      const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
      expect(init.signal).toBe(abortController.signal);
      expect((init.headers as Record<string, string>)['X-Custom']).toBe('yes');
    });
  });

  describe('error handling / readJsonSafely', () => {
    it('should return NON_JSON_RESPONSE if content type is not application/json', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
      } as unknown as Response);

      const result = await request('GET', '/txt');
      expect(result).toEqual({
        ok: false,
        error: {
          code: 'NON_JSON_RESPONSE',
          message: 'Server returned non-JSON data',
          type: 'server_error',
          param: null,
        },
      });
    });

    it('should return NON_JSON_RESPONSE if json parsing throws', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.reject(new Error('parse error')),
      } as unknown as Response);

      const result = await request('GET', '/bad-json');
      expect(result.ok).toBe(false);
      expect((result as { error?: { code?: string } }).error?.code).toBe('NON_JSON_RESPONSE');
    });

    it('should parse error body if not ok and json exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({ error: { code: 'VALIDATION_ERR', message: 'failed' } }),
      } as unknown as Response);

      const result = await request('POST', '/bad-request');
      expect(result).toEqual({
        ok: false,
        error: { code: 'VALIDATION_ERR', message: 'failed' },
      });
    });

    it('should fallback to message or statusText if error body structure differs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden HTTP',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({ message: 'Custom message' }), // No `error` wrapping
      } as unknown as Response);

      const result = await request('GET', '/403');
      expect(result.ok).toBe(false);
      expect((result as { error?: { message?: string } }).error?.message).toBe('Custom message');
    });

    it('should fallback to statusText if no message exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({}),
      } as unknown as Response);

      const result = await request('GET', '/500');
      expect(result.ok).toBe(false);
      expect((result as { error?: { message?: string } }).error?.message).toBe('Internal Server Error');
    });

    it('should fallback to HTTP status if no statusText', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 418,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => await Promise.resolve({}),
      } as unknown as Response);
      const result = await request('GET', '/418');
      expect((result as { error?: { message?: string } }).error?.message).toBe('HTTP 418');
    });
  });

  describe('special responses (204 / 401)', () => {
    it('should handle 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as unknown as Response);

      const result = await request('DELETE', '/user/1');
      expect(result).toEqual({ ok: true, data: undefined });
    });

    it('should handle 401 Unauthorized with initialized state (should redirect)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as unknown as Response);

      const result = await request('GET', '/protected');
      expect(mockReset).toHaveBeenCalled();
      expect(globalThis.location.href).toContain('login');
      expect(result.ok).toBe(false);
      expect((result as { error?: { code?: string } }).error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle 401 Unauthorized with uninitialized state (no redirect)', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        auth: { isInitialized: false, reset: mockReset } as unknown as ReturnType<typeof useAuthStore.getState>['auth'],
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      } as unknown as Response);

      await request('GET', '/protected');
      expect(mockReset).toHaveBeenCalled();
      expect(globalThis.location.href).toBe(''); // unchanged
    });
  });

  describe('network / timeout errors', () => {
    it('should trigger REQUEST_TIMEOUT on AbortError without custom abort', async () => {
      const abortError = new DOMException('MOCK ABORT', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await request('GET', '/slow');
      expect(result.ok).toBe(false);
      expect((result as { error?: { code?: string } }).error?.code).toBe('REQUEST_TIMEOUT');
    });

    it('should rethrow AbortError if user initiated abort', async () => {
      const abortError = new DOMException('MOCK ABORT', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);

      const customController = new AbortController();
      customController.abort(); // set aborted = true

      await expect(request('GET', '/slow', undefined, { signal: customController.signal })).rejects.toThrow(abortError);
    });

    it('should handle generic network error', async () => {
      const networkError = new Error('Failed to fetch');
      mockFetch.mockRejectedValueOnce(networkError);

      const result = await request('GET', '/down');
      expect(result.ok).toBe(false);
      expect((result as { error?: { code?: string } }).error?.code).toBe('NETWORK_ERROR');
    });
  });

  describe('getAdminKey', () => {
    it('should return the current access token', () => {
      vi.mocked(useAuthStore.getState).mockReturnValue({
        auth: { accessToken: 'admin-abc' } as unknown as ReturnType<typeof useAuthStore.getState>['auth'],
      });
      expect(getAdminKey()).toBe('admin-abc');
    });
  });
});
