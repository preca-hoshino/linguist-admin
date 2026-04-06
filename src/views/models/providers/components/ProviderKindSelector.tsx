import { DeepSeek, Gemini, ProviderIcon, Volcengine } from '@lobehub/icons';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/utils';

export interface KindOption {
  label: string;
  value: string;
  defaultBaseUrl?: string;
  exampleEndpoint?: string;
}

interface ProviderKindSelectorProps {
  readonly options: KindOption[];
  readonly selectedKind: string;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly onSelect: (opt: KindOption) => void;
}

export function ProviderKindSelector({
  options,
  selectedKind,
  searchQuery,
  onSearchChange,
  onSelect,
}: ProviderKindSelectorProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex w-[260px] shrink-0 flex-col border-r bg-muted/10">
      <div className="border-b border-border/50 p-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('common.search', 'Search...')}
            className="h-9 bg-background/50 pl-8"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
        {options.length > 0 ? (
          options.map((opt) => {
            const isSelected = selectedKind === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onSelect(opt);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-start transition-all',
                  isSelected
                    ? 'bg-background text-foreground shadow-sm ring-1 shadow-black/5 ring-border'
                    : 'bg-transparent text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-background/50 text-muted-foreground shadow-sm ring-1 ring-border/50',
                  )}
                >
                  {((): React.ReactNode => {
                    switch (opt.value) {
                      case 'gemini': {
                        return <Gemini size={24} className="fill-current" />;
                      }
                      case 'deepseek': {
                        return <DeepSeek size={24} className="fill-current" />;
                      }
                      case 'volcengine': {
                        return <Volcengine size={24} className="fill-current" />;
                      }
                      default: {
                        return <ProviderIcon provider={opt.value} size={24} type="mono" className="fill-current" />;
                      }
                    }
                  })()}
                </div>
                <span className="truncate font-medium">{opt.label}</span>
              </button>
            );
          })
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('common.noResults', 'No results found')}
          </div>
        )}
      </div>
    </div>
  );
}
