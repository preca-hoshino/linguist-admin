import { useEffect, useState } from 'react';
import { getCookie, removeCookie, setCookie } from '@/utils/cookies';

export type Direction = 'ltr' | 'rtl';

const DEFAULT_DIRECTION: Direction = 'ltr';
const DIRECTION_COOKIE_NAME = 'dir';
const DIRECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 年

export interface DirectionState {
  defaultDir: Direction;
  dir: Direction;
  setDir: (dir: Direction) => void;
  resetDir: () => void;
}

/**
 * 文字方向管理 composable。
 * cookie 持久化 + document.dir 属性操作，可独立使用。
 */
export function useDirectionLogic(): DirectionState {
  const [dir, applyDir] = useState<Direction>(
    () => (getCookie(DIRECTION_COOKIE_NAME) as Direction | undefined) ?? DEFAULT_DIRECTION,
  );

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);

  const setDir = (d: Direction): void => {
    applyDir(d);
    setCookie(DIRECTION_COOKIE_NAME, d, DIRECTION_COOKIE_MAX_AGE);
  };

  const resetDir = (): void => {
    applyDir(DEFAULT_DIRECTION);
    removeCookie(DIRECTION_COOKIE_NAME);
  };

  return { defaultDir: DEFAULT_DIRECTION, dir, setDir, resetDir };
}
