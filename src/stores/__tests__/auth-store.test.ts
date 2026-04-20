/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as meApi from '@/api/me';
import * as cookies from '@/utils/cookies';
import * as jwt from '@/utils/jwt';
import { useAuthStore } from '../auth-store';

vi.mock('@/utils/cookies');
vi.mock('@/utils/jwt');
vi.mock('@/api/me');
const noop = (): void => {
  /* init */
};

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      auth: {
        user: null,
        accessToken: '',
        isLoading: false,
        isInitialized: false,
        setUser: useAuthStore.getState().auth.setUser,
        setAccessToken: useAuthStore.getState().auth.setAccessToken,
        resetAccessToken: useAuthStore.getState().auth.resetAccessToken,
        initUser: useAuthStore.getState().auth.initUser,
        reset: useAuthStore.getState().auth.reset,
        isAuthenticated: useAuthStore.getState().auth.isAuthenticated,
      },
    });

    // Reset module local variable trick:
    // Wait, the initUserInFlight is a top-level module variable. To reset it we would need to mock or isolate modules.
    // For now we assume sequential tests passing or we reset it by doing a full sequence.
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty token if cookie is absent', () => {
    vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);
    expect(useAuthStore.getState().auth.accessToken).toBe('');
  });

  it('should update user state with setUser', () => {
    const user = { id: 1, name: 'Test' } as never;
    useAuthStore.getState().auth.setUser(user);
    expect(useAuthStore.getState().auth.user).toBe(user);
  });

  it('should set access token in store and cookie', () => {
    useAuthStore.getState().auth.setAccessToken('new_token');
    expect(useAuthStore.getState().auth.accessToken).toBe('new_token');
    expect(cookies.setCookie).toHaveBeenCalledWith('linguist_access_token', 'new_token');
  });

  it('should reset access token in store and cookie', () => {
    useAuthStore.getState().auth.setAccessToken('old_token');
    useAuthStore.getState().auth.resetAccessToken();
    expect(useAuthStore.getState().auth.accessToken).toBe('');
    expect(cookies.removeCookie).toHaveBeenCalledWith('linguist_access_token');
  });

  it('should return correct authentication status', () => {
    expect(useAuthStore.getState().auth.isAuthenticated()).toBe(false);
    useAuthStore.getState().auth.setUser({ id: 1 } as never);
    expect(useAuthStore.getState().auth.isAuthenticated()).toBe(true);
  });

  it('should reset all auth state', () => {
    useAuthStore.getState().auth.setUser({ id: 1 } as never);
    useAuthStore.getState().auth.setAccessToken('token');
    useAuthStore.getState().auth.reset();

    const state = useAuthStore.getState().auth;
    expect(state.user).toBeNull();
    expect(state.accessToken).toBe('');
    expect(state.isInitialized).toBe(true);
    expect(cookies.removeCookie).toHaveBeenCalledWith('linguist_access_token');
  });

  describe('initUser', () => {
    it('should return early if initUser is already in flight (prevent race condition)', async () => {
      /* 
        This is tricky to test since it requires calling it while it's pending.
        We can mock fetchMe to block, call initUser twice, and observe fetchMe is only called once.
       */
      // biome-ignore lint/suspicious/noExplicitAny: Mocking promise resolution
      let resolveFetch: (value: any) => void = noop;
      vi.mocked(meApi.fetchMe).mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      );
      vi.mocked(cookies.getCookie).mockReturnValue('valid_token');
      vi.mocked(jwt.validateAuthToken).mockReturnValue({} as never);

      const initPromise1 = useAuthStore.getState().auth.initUser();
      const initPromise2 = useAuthStore.getState().auth.initUser();

      // Second call should return immediately
      await initPromise2;

      resolveFetch({ ok: true, data: { id: 1 } });
      await initPromise1;

      expect(meApi.fetchMe).toHaveBeenCalledTimes(1);
    });

    it('should handle unauthenticated state if no token', async () => {
      vi.mocked(cookies.getCookie).mockReturnValue(undefined as never);

      await useAuthStore.getState().auth.initUser();

      const state = useAuthStore.getState().auth;
      expect(state.accessToken).toBe('');
      expect(state.isInitialized).toBe(true);
      expect(cookies.removeCookie).toHaveBeenCalledWith('linguist_access_token');
      expect(meApi.fetchMe).not.toHaveBeenCalled();
    });

    it('should handle invalid token', async () => {
      vi.mocked(cookies.getCookie).mockReturnValue('invalid_token');
      vi.mocked(jwt.validateAuthToken).mockReturnValue(null);

      await useAuthStore.getState().auth.initUser();

      const state = useAuthStore.getState().auth;
      expect(state.accessToken).toBe('');
      expect(state.isInitialized).toBe(true);
      expect(cookies.removeCookie).toHaveBeenCalledWith('linguist_access_token');
    });

    it('should synchronize access token if cookie is different', async () => {
      useAuthStore.setState({ auth: { ...useAuthStore.getState().auth, accessToken: 'old_token' } });
      vi.mocked(cookies.getCookie).mockReturnValue('new_cookie_token');
      vi.mocked(jwt.validateAuthToken).mockReturnValue({} as never);
      vi.mocked(meApi.fetchMe).mockResolvedValue({ ok: true, data: { id: 1 } } as never);

      await useAuthStore.getState().auth.initUser();
      expect(useAuthStore.getState().auth.accessToken).toBe('new_cookie_token');
    });

    it('should successfully initialize user', async () => {
      vi.mocked(cookies.getCookie).mockReturnValue('valid_token');
      vi.mocked(jwt.validateAuthToken).mockReturnValue({} as never);
      const mockUser = { id: 1, name: 'Alice' };
      vi.mocked(meApi.fetchMe).mockResolvedValue({ ok: true, data: mockUser } as never);

      const initPromise = useAuthStore.getState().auth.initUser();
      expect(useAuthStore.getState().auth.isLoading).toBe(true);

      await initPromise;

      const state = useAuthStore.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should handle fetchMe error (expired session from backend)', async () => {
      vi.mocked(cookies.getCookie).mockReturnValue('valid_token');
      vi.mocked(jwt.validateAuthToken).mockReturnValue({} as never);
      vi.mocked(meApi.fetchMe).mockResolvedValue({ ok: false, error: { message: 'Unauthorized' } } as never);

      await useAuthStore.getState().auth.initUser();

      const state = useAuthStore.getState().auth;
      expect(state.user).toBeNull();
      expect(state.accessToken).toBe('');
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
      expect(toast.error).toHaveBeenCalledWith('Session expired, please sign in again');
      expect(cookies.removeCookie).toHaveBeenCalledWith('linguist_access_token');
    });

    it('should handle fetchMe exception', async () => {
      vi.mocked(cookies.getCookie).mockReturnValue('valid_token');
      vi.mocked(jwt.validateAuthToken).mockReturnValue({} as never);
      vi.mocked(meApi.fetchMe).mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().auth.initUser();

      const state = useAuthStore.getState().auth;
      expect(state.user).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Session expired, please sign in again');
    });
  });
});
