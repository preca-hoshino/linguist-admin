import { ProviderLogo } from '@/components/provider/ProviderLogo';

export interface RankedModelInfoProps {
  readonly rank: number;
  readonly providerName: string | null;
  readonly providerKind?: string | null;
  readonly modelName: string;
}

export function RankedModelInfo({ providerName, providerKind, modelName }: RankedModelInfoProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      {/* 遮罩/Icon容器 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
        {(providerKind != null && providerKind !== '') || (providerName !== null && providerName !== '') ? (
          <ProviderLogo
            provider={providerKind != null && providerKind !== '' ? providerKind : providerName}
            size={16}
            className="opacity-80"
          />
        ) : (
          <div className="h-2 w-2 rounded-full bg-border" />
        )}
      </div>

      {/* 右侧文本信息 */}
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <div className="flex items-center">
          <span className="truncate text-[11px] text-muted-foreground">
            {providerName !== null && providerName !== '' ? providerName : 'Unknown'}
          </span>
        </div>
        <div className="truncate text-sm font-medium text-foreground/90" title={modelName}>
          {modelName}
        </div>
      </div>
    </div>
  );
}
