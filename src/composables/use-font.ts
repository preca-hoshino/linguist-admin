import { useEffect, useState } from 'react';
import { fonts } from '@/config/fonts';
import { getCookie, removeCookie, setCookie } from '@/utils/cookies';

export type Font = (typeof fonts)[number];

const FONT_COOKIE_NAME = 'font';
const FONT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 年

export interface FontState {
  font: Font;
  setFont: (font: Font) => void;
  resetFont: () => void;
}

/**
 * 字体管理 composable。
 * cookie 持久化 + DOM font 类名操作，可独立使用。
 */
export function useFontLogic(): FontState {
  const [font, applyFont] = useState<Font>(() => {
    const saved = getCookie(FONT_COOKIE_NAME);
    return fonts.includes(saved as Font) ? (saved as Font) : fonts[0];
  });

  useEffect(() => {
    const root = document.documentElement;
    for (const cls of root.classList) {
      if (cls.startsWith('font-')) {
        root.classList.remove(cls);
      }
    }
    root.classList.add(`font-${font}`);
  }, [font]);

  const setFont = (f: Font): void => {
    setCookie(FONT_COOKIE_NAME, f, FONT_COOKIE_MAX_AGE);
    applyFont(f);
  };

  const resetFont = (): void => {
    removeCookie(FONT_COOKIE_NAME);
    applyFont(fonts[0]);
  };

  return { font, setFont, resetFont };
}
