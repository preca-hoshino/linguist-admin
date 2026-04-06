import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDialogState } from '../use-dialog-state';

describe('useDialogState', () => {
  it('should initialize with null by default', () => {
    const { result } = renderHook(() => useDialogState());
    expect(result.current[0]).toBeNull();
  });

  it('should initialize with provided state', () => {
    const { result } = renderHook(() => useDialogState<'open' | 'close'>('open'));
    expect(result.current[0]).toBe('open');
  });

  it('should update state to new value', () => {
    const { result } = renderHook(() => useDialogState<'open' | 'close'>());

    act(() => {
      result.current[1]('open');
    });

    expect(result.current[0]).toBe('open');
  });

  it('should toggles to null if setting same value', () => {
    const { result } = renderHook(() => useDialogState<'open' | 'close'>('open'));

    expect(result.current[0]).toBe('open');

    act(() => {
      result.current[1]('open');
    });

    expect(result.current[0]).toBeNull();
  });
});
