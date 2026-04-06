const viteApiPrefix = (import.meta.env.VITE_API_PREFIX as string | undefined)?.trim();
const rawApiPrefix = viteApiPrefix !== undefined && viteApiPrefix !== '' ? viteApiPrefix : '/api';

export const API_PREFIX = rawApiPrefix.endsWith('/') ? rawApiPrefix.slice(0, -1) : rawApiPrefix;
export const UI_BASE = import.meta.env.BASE_URL;
export const MOBILE_SIDEBAR_BREAKPOINT = Number(
  (import.meta.env.VITE_MOBILE_SIDEBAR_BREAKPOINT as string | undefined) ?? 840,
);
