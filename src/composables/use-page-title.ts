import { useEffect } from 'react';

const DEFAULT_SUFFIX = 'Linguist';

/**
 * 页面标题管理 composable。
 * 自动更新 document.title，格式：`{title} | Linguist`。
 *
 * @param title - 页面标题
 * @param suffix - 可选后缀，默认 'Linguist'
 */
export function usePageTitle(title: string, suffix: string = DEFAULT_SUFFIX): void {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${suffix}` : suffix;
    return (): void => {
      document.title = prev;
    };
  }, [title, suffix]);
}
