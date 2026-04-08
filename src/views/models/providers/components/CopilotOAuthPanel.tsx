/* eslint-disable @typescript-eslint/no-deprecated, sonarjs/deprecation */
// src/views/models/providers/components/CopilotOAuthPanel.tsx — Copilot OAuth 授权面板

import { AlertCircle, CheckCircle, ExternalLink, Github, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CopilotDeviceCodeResponse } from '@/api/providers';
import { copilotCreateDeviceCode, copilotPollToken } from '@/api/providers';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ==================== 状态机 ====================

type OAuthPhase =
  | { type: 'idle' }
  | {
      type: 'polling';
      userCode: string;
      verificationUri: string;
      deviceCode: string;
      interval: number;
    }
  | { type: 'authorized'; tokenPrefix: string }
  | { type: 'error'; message: string };

// ==================== Props ====================

export interface CopilotOAuthPanelProps {
  /** 编辑模式下的 provider ID（创建模式下为 undefined） */
  readonly providerId?: string | undefined;
  /** 编辑模式下的现有凭证数据 */
  readonly currentCredential?: Record<string, unknown> | undefined;
  /** 是否为编辑模式 */
  readonly isUpdate: boolean;
  /**
   * 凭证变化回调
   * - null：保留现有凭证（编辑模式下未重新授权）
   * - 对象：新凭证数据（包含 accessToken）
   */
  readonly onCredentialChange: (data: { accessToken: string } | null) => void;
}

// ==================== 组件实现 ====================

/**
 * Copilot OAuth Device Flow 授权面板
 *
 * 主要场景：
 * 1. 创建模式：显示授权按钮 → 执行 Device Flow → 回调传递完整 token
 * 2. 编辑模式（已授权）：显示已授权状态 → 可触发重新授权
 * 3. 编辑模式（重新授权）：执行 Device Flow → 成功后写入 DB（通过 provider_id）
 */
export function CopilotOAuthPanel({
  providerId,
  currentCredential,
  isUpdate,
  onCredentialChange,
}: CopilotOAuthPanelProps): import('react').JSX.Element {
  const { t } = useTranslation();

  // 判断是否已有授权
  const hasExistingAuth =
    isUpdate && typeof currentCredential?.accessToken === 'string' && currentCredential.accessToken !== '';

  // OAuth 状态机
  const [phase, setPhase] = useState<OAuthPhase>({ type: 'idle' });
  const [isExistingAuth, setIsExistingAuth] = useState(hasExistingAuth);
  const [isLoading, setIsLoading] = useState(false);

  // 轮询定时器
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return (): void => {
      isMountedRef.current = false;
      if (pollTimerRef.current !== null) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  // ==================== 轮询逻辑 ====================

  const startPolling = useCallback(
    (deviceCode: string, intervalSeconds: number) => {
      const doPoll = async (): Promise<void> => {
        const result = await copilotPollToken(deviceCode, providerId);

        if (!result.ok) {
          setPhase({ type: 'error', message: result.error.message });
          return;
        }

        const data = result.data;

        if (data.status === 'complete') {
          if (providerId === undefined) {
            // 创建模式：前端暂存完整 token
            const accessToken = data.access_token;
            if (typeof accessToken !== 'string' || accessToken === '') {
              setPhase({ type: 'error', message: t('modelsPage.copilot.expired') });
              return;
            }
            onCredentialChange({ accessToken });
            setPhase({ type: 'authorized', tokenPrefix: accessToken.slice(0, 12) });
          } else {
            // 编辑模式：token 已写入 DB，标记为有新凭证（防止提交时清空）
            onCredentialChange({ accessToken: '(saved)' });
            setPhase({ type: 'authorized', tokenPrefix: data.token_prefix ?? '' });
          }
          setIsExistingAuth(true);
          return;
        }

        if (data.status === 'expired') {
          setPhase({ type: 'error', message: t('modelsPage.copilot.expired') });
          return;
        }

        // 'pending'：继续等待
        pollTimerRef.current = setTimeout(() => {
          void doPoll();
        }, intervalSeconds * 1000);
      };

      pollTimerRef.current = setTimeout(() => {
        void doPoll();
      }, intervalSeconds * 1000);
    },
    [providerId, onCredentialChange, t],
  );

  // ==================== 发起授权 ====================

  const handleAuthorize = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await copilotCreateDeviceCode();
      if (!result.ok) {
        setPhase({ type: 'error', message: result.error.message });
        return;
      }

      const deviceData: CopilotDeviceCodeResponse = result.data;
      setPhase({
        type: 'polling',
        userCode: deviceData.user_code,
        verificationUri: deviceData.verification_uri,
        deviceCode: deviceData.device_code,
        interval: deviceData.interval,
      });

      // 通知父组件：开始轮询，暂时清空凭证（不提交旧的）
      onCredentialChange(null);

      startPolling(deviceData.device_code, deviceData.interval);
    } finally {
      setIsLoading(false);
    }
  }, [onCredentialChange, startPolling]);

  // ==================== 重新授权 ====================

  const handleReauthorize = useCallback(async (): Promise<void> => {
    // 停止旧的轮询
    if (pollTimerRef.current !== null) {
      clearTimeout(pollTimerRef.current);
    }
    setPhase({ type: 'idle' });
    setIsExistingAuth(false);
    onCredentialChange(null);
    await handleAuthorize();
  }, [handleAuthorize, onCredentialChange]);

  // ==================== 渲染 ====================

  // 已授权且未重新授权（编辑模式静止状态）
  if (isExistingAuth && phase.type === 'idle') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">{t('modelsPage.copilot.authorized')}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-2"
          onClick={() => void handleReauthorize()}
          disabled={isLoading}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t('modelsPage.copilot.reauthorize')}
        </Button>
        <p className="text-xs text-muted-foreground">{t('modelsPage.copilot.reauthorizeWarning')}</p>
      </div>
    );
  }

  // 已成功授权（本次刚授权完成）
  if (phase.type === 'authorized') {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm text-muted-foreground">{t('modelsPage.copilot.authorized')}</span>
        {phase.tokenPrefix !== '' && (
          <Badge variant="secondary" className="font-mono text-xs">
            {phase.tokenPrefix}...
          </Badge>
        )}
      </div>
    );
  }

  // 轮询中（等待用户浏览器授权）
  if (phase.type === 'polling') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('modelsPage.copilot.polling')}</span>
        </div>
        <div className="rounded-md border bg-muted/40 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">{t('modelsPage.copilot.userCode')}</p>
          <p className="font-mono text-lg font-bold tracking-widest">{phase.userCode}</p>
          <a
            href={phase.verificationUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
          >
            {phase.verificationUri}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  // 出错状态
  if (phase.type === 'error') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{phase.message}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-2"
          onClick={() => void handleAuthorize()}
          disabled={isLoading}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t('modelsPage.copilot.authorize')}
        </Button>
      </div>
    );
  }

  // 初始状态（idle）
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-2"
        onClick={() => void handleAuthorize()}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Github className="h-3.5 w-3.5" />}
        {t('modelsPage.copilot.authorize')}
      </Button>
      {isUpdate && <p className="text-xs text-muted-foreground">{t('modelsPage.copilot.reauthorizeWarning')}</p>}
    </div>
  );
}
