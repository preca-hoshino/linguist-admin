// src/components/markdown-viewer/parser.ts

/** 内容分段：普通文本 or XML 块 */
export type Segment =
  | { type: 'text'; content: string }
  | { type: 'xml'; tagName: string; attrs: string; innerContent: string; raw: string };

// ═══════════════════════════════════════════════════════════════════
// XML 预处理器：将原始文本拆分为「文本段」与「XML 块段」交替序列
// ═══════════════════════════════════════════════════════════════════

interface TagToken {
  tagName: string;
  attrs: string;
  startMatchIndex: number;
  matchLength: number;
  innerStartIndex: number;
}

interface TagPair {
  startTag: TagToken;
  endIndex: number;
  endLength: number;
}

const COMMON_HTML_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
]);

// eslint-disable-next-line sonarjs/cognitive-complexity
export function parseSegments(raw: string): Segment[] {
  const segments: Segment[] = [];

  // 匹配三反引号代码块 或 XML 标签
  // eslint-disable-next-line sonarjs/slow-regex, sonarjs/regex-complexity
  const lexRegex = /(```[\s\S]*?```)|(<\/?([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)\s*>)/g;
  let match: RegExpExecArray | null;

  const stack: TagToken[] = [];
  const pairs: TagPair[] = [];

  for (;;) {
    match = lexRegex.exec(raw);
    if (match === null) {
      break;
    }
    if (match[1] !== undefined) {
      // 命中代码块，跳过内部任何结构
      continue;
    }

    const tagStr = match[2] as string;
    const isClosing = tagStr.startsWith('</');
    const isSelfClosing = tagStr.endsWith('/>');
    const tagName = match[3] as string;

    // 忽略标准 HTML 标签，只把未知的自定义标记/大段 XML 提取为折叠块
    if (COMMON_HTML_TAGS.has(tagName.toLowerCase())) {
      continue;
    }

    if (isSelfClosing) {
      continue;
    }

    if (isClosing) {
      if (stack.length > 0) {
        // 从栈顶往下找能闭合的最邻近 open tag
        let foundIndex = -1;
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i]?.tagName === tagName) {
            foundIndex = i;
            break;
          }
        }

        if (foundIndex !== -1) {
          const openTag = stack[foundIndex] as TagToken;
          pairs.push({
            startTag: openTag,
            endIndex: match.index,
            endLength: tagStr.length,
          });
          // 将匹配到的及其上层的未闭合标签全部出栈
          stack.length = foundIndex;
        }
      }
    } else {
      stack.push({
        tagName,
        attrs: (match[4] ?? '').trim(),
        startMatchIndex: match.index,
        matchLength: tagStr.length,
        innerStartIndex: match.index + tagStr.length,
      });
    }
  }

  // 按起始位置进行排序
  pairs.sort((a, b) => a.startTag.startMatchIndex - b.startTag.startMatchIndex);

  // 筛选出最外层的合法区块（不被其他任何区块包裹）
  const outermostPairs: TagPair[] = [];
  let currentMaxEnd = -1;

  for (const pair of pairs) {
    if (pair.startTag.startMatchIndex >= currentMaxEnd) {
      outermostPairs.push(pair);
      currentMaxEnd = pair.endIndex + pair.endLength;
    }
  }

  // 转换为分段输出
  let lastIndex = 0;
  for (const pair of outermostPairs) {
    // 缝隙部分作为普通文本
    if (pair.startTag.startMatchIndex > lastIndex) {
      const text = raw.slice(lastIndex, pair.startTag.startMatchIndex);
      if (text.trim()) {
        segments.push({ type: 'text', content: text });
      }
    }

    // 主体部分作为 XML
    const fullXmlLen = pair.endIndex + pair.endLength - pair.startTag.startMatchIndex;
    segments.push({
      type: 'xml',
      tagName: pair.startTag.tagName,
      attrs: pair.startTag.attrs,
      innerContent: raw.slice(pair.startTag.innerStartIndex, pair.endIndex),
      raw: raw.slice(pair.startTag.startMatchIndex, pair.startTag.startMatchIndex + fullXmlLen),
    });

    lastIndex = pair.endIndex + pair.endLength;
  }

  // 残余尾部
  if (lastIndex < raw.length) {
    const text = raw.slice(lastIndex);
    if (text.trim()) {
      segments.push({ type: 'text', content: text });
    }
  }

  return segments;
}
