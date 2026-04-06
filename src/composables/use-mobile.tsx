import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const mql = globalThis.matchMedia(MOBILE_QUERY);
      mql.addEventListener('change', callback);
      return (): void => {
        mql.removeEventListener('change', callback);
      };
    },
    () => globalThis.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
