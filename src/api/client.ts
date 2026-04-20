import { API_PREFIX, UI_BASE } from '@/config/runtime';
import { useAuthStore } from '@/stores/auth-store';
import type { ApiErrorBody, ApiResult } from '../types';

const DEFAULT_TIMEOUT_MS = 10_000;

type JsonLike = Record<string, unknown>;

async function readJsonSafely(res: Response): Promise<JsonLike | null> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return (await res.json()) as JsonLike;
  } catch {
    return null;
  }
}

function handleFetchError(error: unknown, aborted?: boolean): ApiResult<never> {
  if (error instanceof DOMException && error.name === 'AbortError') {
    if (aborted) {
      throw error;
    }
    return {
      ok: false,
      error: { code: 'REQUEST_TIMEOUT', message: 'Request timed out', type: 'server_error', param: null },
    };
  }
  return { ok: false, error: { code: 'NETWORK_ERROR', message: String(error), type: 'server_error', param: null } };
}

export async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  customConfig?: RequestInit,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const { auth } = useAuthStore.getState();
  if (auth.accessToken) {
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, DEFAULT_TIMEOUT_MS);

  let res: globalThis.Response;
  try {
    const init: RequestInit = {
      method,
      headers,
      signal: customConfig?.signal ?? controller.signal,
      ...customConfig,
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    res = await fetch(`${API_PREFIX}${path}`, init);
  } catch (error) {
    clearTimeout(timeout);
    return handleFetchError(error, customConfig?.signal?.aborted);
  }
  clearTimeout(timeout);

  if (res.status === 401) {
    const wasInitialized = auth.isInitialized;
    auth.reset();
    // 仅在初始化完成后（正常使用阶段）才硬跳转到登录页
    // 初始化阶段由 initUser + 路由守卫处理，避免竞态导致用户被踢出
    if (wasInitialized) {
      globalThis.location.href = `${UI_BASE}login`;
    }
    return {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Session expired, please login again',
        type: 'authentication_error',
        param: null,
      },
    };
  }

  const isNoContent = res.status === 204;
  const data = isNoContent ? null : await readJsonSafely(res);

  if (!res.ok) {
    const errBody = data?.error as ApiErrorBody | undefined;
    return {
      ok: false,
      error: errBody ?? {
        code: 'HTTP_ERROR',
        message: data?.message?.toString() ?? (res.statusText || `HTTP ${res.status}`),
        type: 'server_error',
        param: null,
      },
    };
  }

  if (isNoContent) {
    return { ok: true, data: undefined as T };
  }

  if (data === null) {
    return {
      ok: false,
      error: { code: 'NON_JSON_RESPONSE', message: 'Server returned non-JSON data', type: 'server_error', param: null },
    };
  }

  return { ok: true, data: data as T };
}

export function getAdminKey(): string | null {
  return useAuthStore.getState().auth.accessToken;
}
