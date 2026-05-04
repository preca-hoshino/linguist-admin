import {
  Antigravity,
  CherryStudio,
  Claude,
  ClaudeCode,
  Cursor,
  DeepSeek,
  Gemini,
  Github,
  NewAPI,
  ProviderIcon,
  Trae,
  Volcengine,
  XiaomiMiMo,
} from '@lobehub/icons';
import { forwardRef } from 'react';

export interface ProviderLogoProps {
  /** The provider identifier (e.g., 'openai', 'deepseek', 'volcengine', 'openaicompat') */
  provider?: string | null | undefined;
  /** Icon size in pixels */
  size?: number;
  /** Rendering type for standard providers */
  type?: 'mono' | 'color';
  /** Opt-in className for styling */
  className?: string;
}

// ── 组件 ──────────────────────────────────────────────────────────────────
export const ProviderLogo = forwardRef<SVGSVGElement, ProviderLogoProps>(
  ({ provider, size = 16, type = 'mono', className }, ref) => {
    if (provider == null || provider === '') {
      return null;
    }

    // ── API 格式 / 内部别名 → icon key 规范化 ──────────────────────────────
    const ALIAS: Record<string, string> = {
      openaicompat: 'openai', // OpenAI-compatible API format
      google: 'gemini', // Google API format → Gemini icon
      anthropic: 'anthropic', // explicit（ProviderIcon fallback 支持，明确声明意图）
    };

    // ── 品牌图标映射 ────────────────────────────────────────────────────────
    // @lobehub/icons 对以下 provider 不支持或风格不一致，需精确映射。
    // 放在函数体内部，避免 mock 环境下顶层求值时报"未导出"错误。
    const BRANDED: Record<string, React.ElementType> = {
      gemini: Gemini,
      deepseek: DeepSeek,
      volcengine: Volcengine,
      mimo: XiaomiMiMo,
      copilot: Github,
      newapi: NewAPI,
      'cherry-studio': CherryStudio,
      antigravity: Antigravity,
      cursor: Cursor,
      trae: Trae,
      'claude-code': ClaudeCode,
      'claude-desktop': Claude,
    };

    // 1. 规范化：别名映射
    const rawKind = provider.toLowerCase();
    const kindValue = ALIAS[rawKind] ?? rawKind;

    // 2. 品牌图标：优先使用表中的精确映射
    const BrandIcon = BRANDED[kindValue];
    if (BrandIcon != null) {
      return <BrandIcon ref={ref as never} size={size} className={className} />;
    }

    // 3. Fallback：通用 ProviderIcon（支持 openai / anthropic / azure 等主流提供商）
    return <ProviderIcon provider={kindValue} type={type} size={size} className={className ?? ''} />;
  },
);

ProviderLogo.displayName = 'ProviderLogo';
