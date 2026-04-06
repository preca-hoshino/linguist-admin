import { toast } from 'sonner';
import { create } from 'zustand';
import { fetchMe } from '@/api/me';
import type { User } from '@/api/users';
import { getCookie, removeCookie, setCookie } from '@/utils/cookies';
import { validateAuthToken } from '@/utils/jwt';

const ACCESS_TOKEN_KEY = 'linguist_access_token';

/** initUser 防重入锁：阻止 StrictMode + useEffect 依赖变化导致的并发调用 */
let initUserInFlight = false;

export interface AuthState {
  auth: {
    user: User | null;
    accessToken: string;
    isLoading: boolean;
    isInitialized: boolean;
    setUser: (user: User | null) => void;
    setAccessToken: (accessToken: string) => void;
    resetAccessToken: () => void;
    initUser: () => Promise<void>;
    reset: () => void;
    isAuthenticated: () => boolean;
  };
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initToken = getCookie(ACCESS_TOKEN_KEY) ?? '';

  return {
    auth: {
      user: null,
      accessToken: initToken,
      isLoading: false,
      isInitialized: false,
      setUser: (user): void => {
        set((state) => ({ ...state, auth: { ...state.auth, user } }));
      },
      setAccessToken: (accessToken): void => {
        setCookie(ACCESS_TOKEN_KEY, accessToken);
        set((state) => ({ ...state, auth: { ...state.auth, accessToken } }));
      },
      resetAccessToken: (): void => {
        removeCookie(ACCESS_TOKEN_KEY);
        set((state) => ({
          ...state,
          auth: { ...state.auth, accessToken: '' },
        }));
      },
      initUser: async (): Promise<void> => {
        // 防重入：避免 StrictMode 双重 mount 或 useEffect 依赖变化触发多次并发调用
        if (initUserInFlight) {
          return;
        }
        initUserInFlight = true;

        try {
          // 每次都从 cookie 重新读取 token，以防 Zustand store 重建后内存值与 cookie 不一致
          const cookieToken = getCookie(ACCESS_TOKEN_KEY) ?? '';
          const accessToken = cookieToken || get().auth.accessToken;

          // 同步 store 中的 accessToken（刷新后 cookie 是唯一的持久化来源）
          if (cookieToken && cookieToken !== get().auth.accessToken) {
            set((state) => ({ ...state, auth: { ...state.auth, accessToken: cookieToken } }));
          }

          // 未登入 或 Token 格式非法/已过期
          if (!accessToken || !validateAuthToken(accessToken)) {
            removeCookie(ACCESS_TOKEN_KEY);
            set((state) => ({
              ...state,
              auth: { ...state.auth, accessToken: '', isInitialized: true },
            }));
            return;
          }

          set((state) => ({ ...state, auth: { ...state.auth, isLoading: true } }));

          const res = await fetchMe();
          if (!res.ok) {
            throw new Error(res.error.message);
          }

          set((state) => ({
            ...state,
            auth: { ...state.auth, user: res.data, isInitialized: true },
          }));
        } catch {
          // Token 请求失败（如后端拦截 401过期 或用户被禁用）
          toast.error('Session expired, please sign in again');
          removeCookie(ACCESS_TOKEN_KEY);
          set((state) => ({
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', isInitialized: true },
          }));
        } finally {
          set((state) => ({ ...state, auth: { ...state.auth, isLoading: false } }));
          initUserInFlight = false;
        }
      },
      reset: (): void => {
        removeCookie(ACCESS_TOKEN_KEY);
        set((state) => ({
          ...state,
          auth: { ...state.auth, user: null, accessToken: '', isInitialized: true },
        }));
      },
      isAuthenticated: (): boolean => {
        return get().auth.user !== null;
      },
    },
  };
});
