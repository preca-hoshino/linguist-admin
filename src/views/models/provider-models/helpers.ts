// src/views/models/provider-models/helpers.ts — 表单辅助函数

import type { ProviderModel } from '@/types';
import type { FormValues } from './schema';

/**
 * 安全 JSON 解析，失败时返回原字符串
 */
export function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * 将 UI 层的 request_overrides 行数组转换为 API payload 格式
 */
export function buildRequestOverridesPayload(
  uiOverrides: Array<{ type: 'header' | 'body'; key: string; value?: string | undefined }> | undefined,
): { headers?: Record<string, string | null>; body?: Record<string, unknown> } | null {
  if (!uiOverrides || uiOverrides.length === 0) {
    return null;
  }
  const headers: Record<string, string | null> = {};
  const body: Record<string, unknown> = {};

  for (const item of uiOverrides) {
    if (item.type === 'header') {
      headers[item.key] = item.value === undefined || item.value.trim() === '' ? null : item.value;
      continue;
    }

    const valIsNull = item.value === undefined || item.value.trim() === '';
    const tempKey = tryParseJson(item.key);
    body[typeof tempKey === 'string' ? tempKey : item.key] = valIsNull ? null : tryParseJson(item.value ?? '');
  }

  const overrides: { headers?: Record<string, string | null>; body?: Record<string, unknown> } = {};
  if (Object.keys(headers).length > 0) {
    overrides.headers = headers;
  }
  if (Object.keys(body).length > 0) {
    overrides.body = body;
  }

  return Object.keys(overrides).length > 0 ? overrides : null;
}

/**
 * 从 currentRow 构建表单初始值
 */
export function buildFormValuesFromRow(currentRow: ProviderModel): FormValues {
  return {
    id: currentRow.id,
    name: currentRow.name,
    type: (currentRow as { type?: string }).type ?? currentRow.model_type,
    max_tokens: Math.round(currentRow.max_tokens / 1000),
    provider_id: currentRow.provider_id,
    capabilities: currentRow.capabilities,
    supported_parameters: currentRow.supported_parameters ?? [],
    pricing_tiers:
      (currentRow.pricing_tiers?.length ?? 0) > 0
        ? (currentRow.pricing_tiers?.map((p) => ({
            start_tokens: Math.round(p.start_tokens / 1000),
            max_tokens: Math.round((p.max_tokens ?? currentRow.max_tokens) / 1000),
            input_price: p.input_price,
            output_price: p.output_price,
            cache_price: p.cache_price,
          })) ?? [])
        : [
            {
              start_tokens: 0,
              max_tokens: Math.round(currentRow.max_tokens / 1000),
              input_price: 0,
              output_price: 0,
              cache_price: 0,
            },
          ],
    rpm_limit: currentRow.rpm_limit,
    tpm_limit: currentRow.tpm_limit,
    timeout_ms: currentRow.timeout_ms ?? null,
    model_config: currentRow.model_config
      ? {
          reasoning_content_backfill: currentRow.model_config.reasoning_content_backfill === true,
        }
      : { reasoning_content_backfill: false },
    thinking_config: currentRow.thinking_config
      ? {
          reasoning_content_backfill: currentRow.thinking_config.reasoning_content_backfill ?? false,
          levels: currentRow.thinking_config.levels ?? [],
        }
      : { reasoning_content_backfill: false, levels: [] },
    request_overrides_ui: buildOverridesUiFromRow(currentRow),
  };
}

/**
 * 从 currentRow 构建 request_overrides_ui 数组
 */
function buildOverridesUiFromRow(
  currentRow: ProviderModel,
): Array<{ type: 'header' | 'body'; key: string; value: string }> {
  const overridesUi: Array<{ type: 'header' | 'body'; key: string; value: string }> = [];
  const overrides = currentRow.request_overrides;

  for (const [k, v] of Object.entries(overrides?.headers ?? {})) {
    overridesUi.push({ type: 'header', key: k, value: v ?? '' });
  }

  for (const [k, v] of Object.entries(overrides?.body ?? {})) {
    let textValue = '';
    if (v !== null && v !== undefined) {
      textValue = typeof v === 'string' ? v : JSON.stringify(v);
    }
    overridesUi.push({ type: 'body', key: k, value: textValue });
  }

  return overridesUi;
}

/**
 * 构建提交 payload
 */
export function buildSubmitPayload(
  values: FormValues,
): Omit<ProviderModel, 'id' | 'provider_id' | 'object' | 'created_at' | 'updated_at' | 'is_active'> {
  type CreationPayload = Omit<
    ProviderModel,
    'id' | 'provider_id' | 'object' | 'created_at' | 'updated_at' | 'is_active'
  >;
  const payload: CreationPayload = {
    name: values.name,
    model_type: values.type as 'chat' | 'embedding',
    max_tokens: values.max_tokens * 1000,
    capabilities: values.capabilities,
    supported_parameters: values.supported_parameters,
    pricing_tiers: values.pricing_tiers.map((t, index) => ({
      ...t,
      start_tokens: t.start_tokens * 1000,
      max_tokens: index === values.pricing_tiers.length - 1 ? null : t.max_tokens * 1000,
    })),
    rpm_limit: values.rpm_limit ?? null,
    tpm_limit: values.tpm_limit ?? null,
    timeout_ms: values.timeout_ms ?? null,
  };

  const parsedOverrides = buildRequestOverridesPayload(values.request_overrides_ui);
  payload.request_overrides = parsedOverrides;

  // model_config: reasoning_content_backfill (legacy, kept for backward compat)
  if (values.model_config) {
    const mc: Record<string, unknown> = {};
    if (values.model_config.reasoning_content_backfill) {
      mc.reasoning_content_backfill = true;
    }
    if (Object.keys(mc).length > 0) {
      payload.model_config = mc;
    }
  }

  // thinking_config
  if (values.thinking_config) {
    const tc: Record<string, unknown> = {};
    if (values.thinking_config.reasoning_content_backfill) {
      tc.reasoning_content_backfill = true;
    }
    if (values.thinking_config.levels && values.thinking_config.levels.length > 0) {
      tc.levels = values.thinking_config.levels;
    }
    if (Object.keys(tc).length > 0) {
      payload.thinking_config = tc;
    }
  }

  return payload;
}
