// src/views/models/provider-models/components/ThinkingConfigSection.tsx — 思考能力配置面板

import { Plus, Trash2, Brain } from 'lucide-react';
import type { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import type { FormValues } from '../schema';

interface ThinkingConfigSectionProps {
  readonly control: Control<FormValues>;
  readonly watch: UseFormWatch<FormValues>;
  readonly setValue: UseFormSetValue<FormValues>;
  /** 最大输出 token 数（K），用于显示 budget_tokens 提示 */
  readonly maxTokensK?: number;
}

export function ThinkingConfigSection({
  control,
  watch,
  setValue,
  maxTokensK,
}: ThinkingConfigSectionProps): React.JSX.Element {
  const { t } = useTranslation();
  const levels = watch('thinking_config.levels') ?? [];

  const addLevel = () => {
    const current = watch('thinking_config.levels') ?? [];
    setValue('thinking_config.levels', [...current, { name: '', ratio: 0.5 }]);
  };

  const removeLevel = (index: number) => {
    const current = watch('thinking_config.levels') ?? [];
    setValue(
      'thinking_config.levels',
      current.filter((_, i) => i !== index),
    );
  };

  return (
    <Card className="gap-0 py-0">
      <AccordionItem value="thinking-config" className="border-b-0">
        <AccordionTrigger className="px-5 hover:no-underline">
          <span className="inline-flex items-center gap-2.5">
            <Brain className="h-4 w-4 text-muted-foreground" />
            {t('modelsPage.providerModels.accordionThinkingConfig', '思考能力配置')}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-5 px-5 pt-1 pb-4">
            <FormDescription>
              {t(
                'modelsPage.providerModels.accordionThinkingConfigDesc',
                '配置模型的思考推理能力，包括 reasoning effort 档位和 reasoning_content 自动回填。',
              )}
            </FormDescription>

            {/* 启用开关 */}
            <FormField
              control={control}
              name="thinking_config.enabled"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                  <FormLabel className="text-left text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t('modelsPage.providerModels.thinkingEnabled', '启用思考')}
                    </span>
                  </FormLabel>
                  <div className="space-y-1.5">
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      {t('modelsPage.providerModels.thinkingEnabledDesc', '声明该模型支持思考推理模式')}
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* reasoning_content 回填开关 */}
            <FormField
              control={control}
              name="thinking_config.reasoning_content_backfill"
              render={({ field }) => (
                <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                  <FormLabel className="text-left text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t('modelsPage.providerModels.thinkingBackfill', '推理内容回填')}
                    </span>
                  </FormLabel>
                  <div className="space-y-1.5">
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'modelsPage.providerModels.thinkingBackfillDesc',
                        '多轮对话时自动补全 reasoning_content 字段（防止 400 错误）',
                      )}
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Reasoning Effort 档位 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-muted-foreground">
                  {t('modelsPage.providerModels.thinkingLevels', '思考强度档位')}
                </FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addLevel} className="h-7 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  {t('modelsPage.providerModels.thinkingLevelsAdd', '添加档位')}
                </Button>
              </div>
              <FormDescription>
                {t(
                  'modelsPage.providerModels.thinkingLevelsDesc',
                  '定义 reasoning_effort 档位名称与 budget_tokens 比例（ratio × max_tokens）。未配置时使用硬编码默认值。',
                )}
              </FormDescription>

              {levels.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  {t('modelsPage.providerModels.thinkingLevelsEmpty', '未配置档位，将使用系统默认值。')}
                </p>
              )}

              {levels.map((level, index) => (
                <div key={`${level.name}-${String(index)}`} className="flex items-end gap-2">
                  <FormField
                    control={control}
                    name={`thinking_config.levels.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1">
                        {index === 0 && (
                          <FormLabel className="text-xs text-muted-foreground">
                            {t('modelsPage.providerModels.thinkingLevelName', '名称')}
                          </FormLabel>
                        )}
                        <FormControl>
                          <Input placeholder="low / medium / high / max" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`thinking_config.levels.${index}.ratio`}
                    render={({ field }) => (
                      <FormItem className="w-32 space-y-1">
                        {index === 0 && (
                          <FormLabel className="text-xs text-muted-foreground">
                            {t('modelsPage.providerModels.thinkingLevelRatio', '比例 (0~1)')}
                          </FormLabel>
                        )}
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step={0.05}
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {maxTokensK !== undefined && level !== undefined && (
                    <div className="w-32 pb-2 text-xs text-muted-foreground">
                      ≈ {Math.round(maxTokensK * 1000 * level.ratio)} tok
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLevel(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}
