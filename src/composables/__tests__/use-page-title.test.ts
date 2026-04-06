import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { usePageTitle } from '../use-page-title';

describe('usePageTitle', () => {
  let initialTitle = '';

  beforeEach(() => {
    initialTitle = 'Initial Title';
    document.title = initialTitle;
  });

  afterEach(() => {
    document.title = initialTitle;
  });

  it('should set the document title with default suffix', () => {
    renderHook(() => {
      usePageTitle('Dashboard');
    });
    expect(document.title).toBe('Dashboard | Linguist');
  });

  it('should set the document title with custom suffix', () => {
    renderHook(() => {
      usePageTitle('Dashboard', 'Admin');
    });
    expect(document.title).toBe('Dashboard | Admin');
  });

  it('should format title without prefix if empty string passe', () => {
    renderHook(() => {
      usePageTitle('');
    });
    expect(document.title).toBe('Linguist');
  });

  it('should restore original document title on unmount', () => {
    const { unmount } = renderHook(() => {
      usePageTitle('Settings');
    });
    expect(document.title).toBe('Settings | Linguist');

    unmount();

    expect(document.title).toBe(initialTitle);
  });
});
