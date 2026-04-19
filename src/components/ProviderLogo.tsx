import { DeepSeek, Gemini, Github, ProviderIcon, Volcengine } from '@lobehub/icons';
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

    // 规范化：将 API 格式标识符 / 内部别名映射到对应的 icon key
    const ALIAS: Record<string, string> = {
      openaicompat: 'openai', // OpenAI-compatible API format → OpenAI icon
      google: 'gemini', // Google API format → Gemini icon
      anthropic: 'anthropic', // Anthropic API format（explicit, ProviderIcon fallback supports it）
    };

    const rawKind = provider.toLowerCase();
    const kindValue = ALIAS[rawKind] ?? rawKind;

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
    if (kindValue === 'copilot') {
      return <Github ref={ref as never} size={size} className={className} />;
    }

    // Fallback to the generic ProviderIcon which handles mainstream ones like openai, anthropic, azure, etc.
    return <ProviderIcon provider={kindValue} type={type} size={size} className={className ?? ''} />;
  },
);

ProviderLogo.displayName = 'ProviderLogo';
