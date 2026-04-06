import { DeepSeek, Gemini, ProviderIcon, Volcengine } from '@lobehub/icons';
import { forwardRef } from 'react';

export interface ProviderLogoProps {
  /** The provider identifier (e.g., 'openai', 'deepseek', 'volcengine') */
  provider?: string | null | undefined;
  /** Icon size in pixels */
  size?: number;
  /** Rendering type for standard providers */
  type?: 'mono' | 'color';
  /** Opt-in className for styling */
  className?: string;
}

export const ProviderLogo = forwardRef<SVGSVGElement, ProviderLogoProps>(
  ({ provider, size = 16, type = 'mono', className }, ref) => {
    if (provider == null || provider === '') {
      return null;
    }
    const kindValue = provider.toLowerCase();

    // @lobehub/icons exports these specific branded icons natively.
    if (kindValue === 'gemini') {
      return <Gemini ref={ref as never} size={size} className={className} />;
    }
    if (kindValue === 'deepseek') {
      return <DeepSeek ref={ref as never} size={size} className={className} />;
    }
    if (kindValue === 'volcengine') {
      return <Volcengine ref={ref as never} size={size} className={className} />;
    }

    // Fallback to the generic ProviderIcon which handles mainstream ones like openai, anthropic, azure, etc.
    return <ProviderIcon provider={kindValue} type={type} size={size} className={className ?? ''} />;
  },
);

ProviderLogo.displayName = 'ProviderLogo';
