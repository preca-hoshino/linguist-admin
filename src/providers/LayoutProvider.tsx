import { createContext, useContext, useState } from 'react';
import { getCookie, setCookie } from '@/utils/cookies';

export type Collapsible = 'offcanvas' | 'icon' | 'none';
export type Variant = 'inset' | 'sidebar' | 'floating';

// Cookie constants following the pattern from sidebar.tsx
const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible';
const LAYOUT_VARIANT_COOKIE_NAME = 'layout_variant';
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Default values
const DEFAULT_VARIANT = 'inset';
const DEFAULT_COLLAPSIBLE = 'icon';

interface LayoutContextType {
  resetLayout: () => void;

  defaultCollapsible: Collapsible;
  collapsible: Collapsible;
  setCollapsible: (collapsible: Collapsible) => void;

  defaultVariant: Variant;
  variant: Variant;
  setVariant: (variant: Variant) => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

interface LayoutProviderProps {
  readonly children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps): React.JSX.Element {
  const [collapsible, applyCollapsible] = useState<Collapsible>(() => {
    const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME);
    return (saved as Collapsible | undefined) ?? DEFAULT_COLLAPSIBLE;
  });

  const [variant, applyVariant] = useState<Variant>(() => {
    const saved = getCookie(LAYOUT_VARIANT_COOKIE_NAME);
    return (saved as Variant | undefined) ?? DEFAULT_VARIANT;
  });

  const setCollapsible = (newCollapsible: Collapsible): void => {
    applyCollapsible(newCollapsible);
    setCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME, newCollapsible, LAYOUT_COOKIE_MAX_AGE);
  };

  const setVariant = (newVariant: Variant): void => {
    applyVariant(newVariant);
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, newVariant, LAYOUT_COOKIE_MAX_AGE);
  };

  const resetLayout = (): void => {
    setCollapsible(DEFAULT_COLLAPSIBLE);
    setVariant(DEFAULT_VARIANT);
  };

  const contextValue: LayoutContextType = {
    resetLayout,
    defaultCollapsible: DEFAULT_COLLAPSIBLE,
    collapsible,
    setCollapsible,
    defaultVariant: DEFAULT_VARIANT,
    variant,
    setVariant,
  };

  return <LayoutContext value={contextValue}>{children}</LayoutContext>;
}

// Define the hook for the provider
// eslint-disable-next-line react-refresh/only-export-components
export function useLayout(): LayoutContextType {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
