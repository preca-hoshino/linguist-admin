// src/providers/HeaderSlotProvider.tsx — 顶栏插槽 Context

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ── Context 定义 ─────────────────────────────────────────────────────────────

interface HeaderSlotContextType {
  slot: React.ReactNode;
  setSlot: (node: React.ReactNode) => void;
}

const HeaderSlotContext = createContext<HeaderSlotContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

interface HeaderSlotProviderProps {
  readonly children: React.ReactNode;
}

export function HeaderSlotProvider({ children }: HeaderSlotProviderProps): React.JSX.Element {
  const [slot, setSlotState] = useState<React.ReactNode>(null);

  const setSlot = useCallback((node: React.ReactNode): void => {
    setSlotState(node);
  }, []);

  return <HeaderSlotContext.Provider value={{ slot, setSlot }}>{children}</HeaderSlotContext.Provider>;
}

// ── 内部 hook（仅供本模块消费） ───────────────────────────────────────────────

function useHeaderSlotContext(): HeaderSlotContextType {
  const ctx = useContext(HeaderSlotContext);
  if (!ctx) {
    throw new Error('Must be used within HeaderSlotProvider');
  }
  return ctx;
}

/**
 * 读取 Header 插槽内容（供 Header 组件使用）
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHeaderSlotContent(): React.ReactNode {
  return useHeaderSlotContext().slot;
}

/**
 * 向 Header 注入内容（供页面组件使用）
 * 挂载时 setSlot(node)，卸载时 setSlot(null)，确保离开页面后顶栏恢复干净。
 *
 * @param node - 要注入的 ReactNode（建议用 useMemo 稳定引用）
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useHeaderSlot(node: React.ReactNode): void {
  const { setSlot } = useHeaderSlotContext();

  useEffect(() => {
    setSlot(node);
    return (): void => {
      setSlot(null);
    };
    // node 变化时重新注入；组件卸载时清空
     
  }, [node, setSlot]);
}
