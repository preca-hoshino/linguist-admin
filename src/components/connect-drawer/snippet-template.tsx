// src/components/connect-drawer/snippet-template.tsx
// parseSnippetTemplate: renders code snippets with interactive token substitution

import { Fragment } from 'react';
import { InteractiveToken } from './InteractiveToken';

export function parseSnippetTemplate(
  template: string,
  tokens: Record<string, string>,
): { rawCode: string; renderCode: React.ReactNode } {
  // eslint-disable-next-line sonarjs/slow-regex
  const tokenRegex = /\{\{([^}]+)\}\}/g;
  const rawCode = template.replaceAll(tokenRegex, (_, key) => tokens[key as string] ?? '');

  const parts = template.split(tokenRegex);
  const renderCode = (
    <>
      {parts.map((part, index) => {
        const uniqueKey = `${part}-${index}`;
        if (index % 2 === 1) {
          const value = tokens[part] ?? '';
          return <InteractiveToken key={uniqueKey} value={value} />;
        }
        return <Fragment key={uniqueKey}>{part}</Fragment>;
      })}
    </>
  );

  return { rawCode, renderCode };
}
