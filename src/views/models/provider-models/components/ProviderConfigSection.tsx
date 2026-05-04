// src/views/models/provider-models/components/ProviderConfigSection.tsx — 提供商专属配置面板

import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Control } from 'react-hook-form';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/Form';
import { Switch } from '@/components/ui/Switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import type { FormValues } from '../schema';

interface ProviderConfigSectionProps {
  readonly control: Control<FormValues>;
  readonly providerKind: string | undefined;
}

export function ProviderConfigSection({ control, providerKind }: ProviderConfigSectionProps): React.JSX.Element | null {
  const { t } = useTranslation();

  if (providerKind == null) {
    return null;
  }

  return (
    <Card className="gap-0 py-0">
      <AccordionItem value="provider-config" className="border-b-0">
        <AccordionTrigger className="px-5 hover:no-underline">
          <span className="inline-flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            {t('modelsPage.providerModels.accordionProviderConfig', '专属配置')}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-5 px-5 pt-1 pb-4">
            <FormDescription>
              {t('modelsPage.providerModels.accordionProviderConfigDesc', '该提供商特有的高级配置项。')}
            </FormDescription>

            {providerKind === 'deepseek' && (
              <FormField
                control={control}
                name="model_config.reasoning_content_backfill"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                    <FormLabel className="text-left text-muted-foreground">
                      <span className="font-medium text-foreground">思考内容回填</span>
                    </FormLabel>
                    <div className="space-y-1.5">
                      <FormControl>
                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormDescription>多轮对话时自动补全 reasoning_content 字段</FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            {providerKind === 'volcengine' && (
              <FormField
                control={control}
                name="model_config.endpoint_type"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[140px_1fr] items-center gap-5 space-y-0">
                    <FormLabel className="text-left text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {t('modelsPage.providerModels.endpointType', '请求端点类型')}
                      </span>
                    </FormLabel>
                    <div className="space-y-1.5">
                      <Tabs
                        onValueChange={field.onChange}
                        value={field.value ?? 'normal'}
                        className="w-full sm:max-w-[280px]"
                      >
                        <TabsList className="flex h-9 w-full">
                          <TabsTrigger value="normal" className="flex-1 px-3 text-sm">
                            {t('modelsPage.providerModels.endpointTypeNormal', '标准')}
                          </TabsTrigger>
                          <TabsTrigger value="coding_plan" className="flex-1 px-3 text-sm">
                            Coding Plan
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            {providerKind !== 'deepseek' && providerKind !== 'volcengine' && (
              <FormDescription>
                {t('modelsPage.providerModels.noProviderConfig', '当前提供商暂无专属配置项。')}
              </FormDescription>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
}
