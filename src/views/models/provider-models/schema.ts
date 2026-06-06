// src/views/models/provider-models/schema.ts — 表单 Schema 与类型定义

import { z } from 'zod';
import type { ProviderModel } from '@/types';

// --- Zod Schemas ---

export const RequestOverrideUIRowSchema = z.object({
  type: z.enum(['header', 'body']),
  key: z.string().min(1),
  value: z.string().optional(),
});

export const PricingTierSchema = z.object({
  start_tokens: z.number().min(0),
  max_tokens: z.number().min(0),
  input_price: z.number().min(0),
  output_price: z.number().min(0),
  cache_price: z.number().min(0),
});

export const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name required'),
  type: z.string().min(1, 'Type required'),
  max_tokens: z.number().min(1),
  provider_id: z.string().min(1, 'Provider required'),
  capabilities: z.array(z.string()),
  supported_parameters: z.array(z.string()),
  pricing_tiers: z.array(PricingTierSchema),
  rpm_limit: z.number().nullable().optional(),
  tpm_limit: z.number().nullable().optional(),
  /** API 调用超时时间（毫秒），null = 使用系统默认 */
  timeout_ms: z.number().int().positive().nullable().optional(),
  request_overrides_ui: z.array(RequestOverrideUIRowSchema).optional(),
  model_config: z
    .object({
      reasoning_content_backfill: z.boolean().optional(),
    })
    .optional(),
  thinking_config: z
    .object({
      enabled: z.boolean().optional(),
      reasoning_content_backfill: z.boolean().optional(),
      levels: z
        .array(
          z.object({
            name: z.string(),
            ratio: z.number().min(0).max(1),
          }),
        )
        .optional(),
    })
    .optional(),
});

export type FormValues = z.infer<typeof formSchema>;

// --- Props ---

export interface ProviderModelsMutateDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly currentRow?: ProviderModel | null;
  readonly onSuccess?: () => void | Promise<void>;
  readonly title?: string;
  readonly description?: string;
  readonly fixedProviderId?: string;
}
