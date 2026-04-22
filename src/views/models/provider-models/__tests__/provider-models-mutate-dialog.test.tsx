/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as providerModelsApi from '@/api/provider-models';
import * as providersApi from '@/api/providers';
import { ProviderModelsMutateDialog } from '../provider-models-mutate-dialog';

// Mock ResizeObserver for Radix UI
class ResizeObserver {
  public observe(): void {
    /* mock */
  }
  public unobserve(): void {
    /* mock */
  }
  public disconnect(): void {
    /* mock */
  }
}
globalThis.ResizeObserver = ResizeObserver;

// Mock Translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../components/ProviderSelector', () => ({
  // biome-ignore lint/suspicious/noExplicitAny: mock override
  ProviderSelector: (props: { providers: any[]; onSelect: (id: string) => void }) => (
    <div data-testid="provider-selector">
      {/* biome-ignore lint/suspicious/noExplicitAny: mock override */}
      {props.providers.map((p: any) => (
        <button
          key={p.id}
          type="button"
          onClick={() => {
            props.onSelect(p.id);
          }}
        >
          {p.name}
        </button>
      ))}
    </div>
  ),
}));

// Mock APIs
vi.spyOn(providersApi, 'listProviders').mockResolvedValue({
  ok: true,
  data: {
    data: [
      {
        id: 'provider-1',
        name: 'OpenAI',
        kind: 'openai',
        base_url: '',
        supported_model_types: ['chat', 'embedding'],
        is_active: true,
      },
    ],
    total: 1,
  },
  // biome-ignore lint/suspicious/noExplicitAny: mock override
} as any);

const mockCreateProviderModel = vi.spyOn(providerModelsApi, 'createProviderModel').mockResolvedValue({
  ok: true,
  data: { id: 'model-1' },
  // biome-ignore lint/suspicious/noExplicitAny: mock override
} as any);

describe('ProviderModelsMutateDialog Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderComponent = (props: React.ComponentProps<typeof ProviderModelsMutateDialog>) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProviderModelsMutateDialog {...props} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a provider to be selected before showing the form', async () => {
    renderComponent({
      open: true,
      onOpenChange: vi.fn(),
    });

    // 等待 provider 数据加载并渲染左侧列表
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });

    // 此时还没有选择提供商，应该显示提示而不是表单
    expect(screen.getByText('modelsPage.providerModels.pleaseSelectProvider')).toBeInTheDocument();
    // 确保表单项（如名称输入框）不在文档中
    expect(screen.queryByPlaceholderText('e.g., GPT-4o')).not.toBeInTheDocument();

    // 选择提供商
    fireEvent.click(screen.getByText('OpenAI'));

    // 提示应当消失，表单应当展示
    await waitFor(() => {
      expect(screen.queryByText('modelsPage.providerModels.pleaseSelectProvider')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., GPT-4o')).toBeInTheDocument();
    });
  });

  it('forms payload correctly when creating a chat model with supported parameters', async () => {
    const handleOpenChange = vi.fn();
    const handleSuccess = vi.fn();

    renderComponent({
      open: true,
      onOpenChange: handleOpenChange,
      onSuccess: handleSuccess,
    });

    // Wait for the provider list to load
    await waitFor(() => {
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });

    // Select Provider
    fireEvent.click(screen.getByText('OpenAI'));

    // Fill Name
    const nameInput = screen.getByPlaceholderText('e.g., GPT-4o');
    fireEvent.change(nameInput, { target: { value: 'my-chat-model' } });

    // Assuming layout has "modelsPage.providerModels.capStream" label for stream capability
    const streamCap = screen.getByText('modelsPage.providerModels.capStream');
    fireEvent.click(streamCap);

    // Click Supported Parameters e.g. "Temperature"
    const tempParam = screen.getByText('Temperature');
    fireEvent.click(tempParam);

    const topPParam = screen.getByText('Top P');
    fireEvent.click(topPParam);

    // Submit the form
    const submitBtn = screen.getByRole('button', { name: 'common.create' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateProviderModel).toHaveBeenCalledTimes(1);
    });

    // Verify it sent capabilities and supported_parameters
    // biome-ignore lint/style/noNonNullAssertion: mock calls always present after verified call count
    const payload = mockCreateProviderModel.mock.calls[0]![0];
    expect(payload.name).toBe('my-chat-model');
    expect(payload.provider_id).toBe('provider-1');
    expect(payload.model_type).toBe('chat');
    // biome-ignore lint/suspicious/noExplicitAny: cast needed since API payload type is wide
    expect((payload as any).capabilities).toContain('stream');
    // biome-ignore lint/suspicious/noExplicitAny: cast needed since API payload type is wide
    expect((payload as any).parameters).toContain('temperature');
    // biome-ignore lint/suspicious/noExplicitAny: cast needed since API payload type is wide
    expect((payload as any).parameters).toContain('top_p');
  });
});
