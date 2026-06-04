import { Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AuditToolDefinition, GatewayContextSnapshot } from '@/types';
import { ToolCallsResult } from './components/ToolCallsResult';
import { ToolWorkspace } from './components/ToolWorkspace';
import { asUserChatReq, asUserChatResp } from './components/utils';

export interface LogToolsTabProps {
  readonly ctx: GatewayContextSnapshot;
}

export function LogToolsTab({ ctx }: LogToolsTabProps): React.JSX.Element {
  const { t } = useTranslation();

  // 直接从网关已经适配并清洗完毕的上下文 request 中提取工具结构
  //（不读取 audit.userRequest.body，因为那里面可能是各种混乱的原始提供商特化格式）
  const chatReq = asUserChatReq(ctx.request);
  const chatResp = asUserChatResp(ctx.response);

  const tools: AuditToolDefinition[] = chatReq?.tools ?? [];

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 overflow-x-hidden w-full">
      {tools.length === 0 ? (
        /* 空状态 */
        <div className="mt-4 flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
          <Wrench className="h-8 w-8 opacity-20" />
          <span>{t('modelsPage.logs.detail.noToolsDefined', '本次请求未携带工具定义')}</span>
        </div>
      ) : (
        /* 工具列表工作区 */
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{t('modelsPage.logs.detail.availableTools', '工具定义')}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                <span>{t('modelsPage.logs.detail.availableShort', '共计:')}</span>
                <span className="font-mono">{tools.length}</span>
              </div>
            </div>
          </div>
          <ToolWorkspace tools={tools} />
        </div>
      )}

      {/* 本次调用结果区 (内部自带 Separator 且为空时自动不渲染) */}
      <ToolCallsResult resp={chatResp} reqBody={chatReq} />
    </div>
  );
}
