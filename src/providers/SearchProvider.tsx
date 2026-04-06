import { createContext, useContext, useEffect, useState } from 'react';
import { CommandMenu } from '@/components/CommandMenu';

interface SearchContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  readonly children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };
    document.addEventListener('keydown', down);
    return (): void => {
      document.removeEventListener('keydown', down);
    };
  }, []);

  return (
    <SearchContext value={{ open, setOpen }}>
      {children}
      <CommandMenu />
    </SearchContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = (): SearchContextType => {
  const searchContext = useContext(SearchContext);

  if (!searchContext) {
    throw new Error('useSearch has to be used within SearchProvider');
  }

  return searchContext;
};
