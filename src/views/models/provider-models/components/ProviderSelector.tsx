import { DeepSeek, Gemini, Github, NewAPI, ProviderIcon, Volcengine, XiaomiMiMo } from '@lobehub/icons';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import type { Provider } from '@/types';
import { cn } from '@/utils/utils';

interface ProviderSelectorProps {
  readonly providers: Provider[];
  readonly isLoading: boolean;
  readonly selectedProviderId: string;
  readonly searchQuery: string;
  readonly onSearchChange: (q: string) => void;
  readonly onSelect: (id: string) => void;
  readonly disabled?: boolean;
}

export function ProviderSelector({
  providers,
  isLoading,
  selectedProviderId,
  searchQuery,
  onSearchChange,
  onSelect,
  disabled = false,
}: ProviderSelectorProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex w-[260px] shrink-0 flex-col border-r bg-muted/10">
      <div className="border-b border-border/50 p-4">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('modelsPage.providerModels.searchProviderPlaceholder', 'Search Provider...')}
            className="h-9 bg-background/50 pl-8"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
        {isLoading && (
          <div className="py-8 text-center text-sm text-muted-foreground">{t('common.loading', 'Loading...')}</div>
        )}
        {!isLoading && providers.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('common.noResults', 'No results found')}
          </div>
        )}
        {!isLoading &&
          providers.length > 0 &&
          providers.map((opt) => {
            const isSelected = selectedProviderId === opt.id;
            let iconNode: React.ReactNode;
            switch (opt.kind) {
              case 'gemini': {
                iconNode = <Gemini size={24} className="fill-current" />;
                break;
              }
              case 'deepseek': {
                iconNode = <DeepSeek size={24} className="fill-current" />;
                break;
              }
              case 'volcengine': {
                iconNode = <Volcengine size={24} className="fill-current" />;
                break;
              }
              case 'mimo': {
                iconNode = <XiaomiMiMo size={24} className="fill-current" />;
                break;
              }
              case 'copilot': {
                iconNode = <Github size={24} className="fill-current" />;
                break;
              }
              case 'newapi': {
                iconNode = <NewAPI size={24} className="fill-current" />;
                break;
              }
              default: {
                iconNode = <ProviderIcon provider={opt.kind} size={24} type="mono" className="fill-current" />;
                break;
              }
            }

            return (
              <button
                type="button"
                key={opt.id}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    onSelect(opt.id);
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-start transition-all',
                  isSelected
                    ? 'bg-background text-foreground shadow-sm ring-1 shadow-black/5 ring-border'
                    : 'bg-transparent text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5',
                  disabled && 'cursor-not-allowed opacity-40',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-all',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-background/50 text-muted-foreground shadow-sm ring-1 ring-border/50',
                    disabled && 'bg-muted text-muted-foreground',
                  )}
                >
                  {iconNode}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="w-full truncate leading-tight font-medium">{opt.name}</span>
                  <span className="mt-0.5 w-full truncate text-xs font-medium text-foreground capitalize">
                    {opt.kind}
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
