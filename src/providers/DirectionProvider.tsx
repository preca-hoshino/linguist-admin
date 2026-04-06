import { DirectionProvider as RdxDirProvider } from '@radix-ui/react-direction';
import { createContext, useContext } from 'react';
import { type DirectionState, useDirectionLogic } from '@/composables/use-direction';

const DirectionContext = createContext<DirectionState | null>(null);

export function DirectionProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const dirValue = useDirectionLogic();
  return (
    <DirectionContext value={dirValue}>
      <RdxDirProvider dir={dirValue.dir}>{children}</RdxDirProvider>
    </DirectionContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection(): DirectionState {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
}

export type { Direction } from '@/composables/use-direction';
