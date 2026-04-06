import { useState } from 'react';

/**
 * Custom hook for confirm dialog
 * @param initialState string | null
 * @returns A stateful value, and a function to update it.
 * @example const [open, setOpen] = useDialogState<"approve" | "reject">()
 */
export function useDialogState<T extends string | boolean>(
  initialState: T | null = null,
): readonly [T | null, (str: T | null) => void] {
  const [open, applyOpen] = useState<T | null>(initialState);

  const setOpen = (str: T | null): void => {
    applyOpen((prev) => (prev === str ? null : str));
  };

  return [open, setOpen] as const;
}
