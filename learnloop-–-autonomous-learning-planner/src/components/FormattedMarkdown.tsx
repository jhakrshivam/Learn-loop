import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  isBot?: boolean;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, isBot = true }) => {
  const lines = content.split('\n');

  const renderInline = (text: string): React.ReactNode => {
    // Process bold, italic, code, time badges
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Regex for bold **text**, code `text`, and badges [⏱️ ...]
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[⏱️[^\]]+\]|\[[^\]]+\]|\*[^*]+\*)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchedStr = match[0];
      if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-[#0F172A]">
            {matchedStr.slice(2, -2)}
          </strong>
        );
      } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#0F172A] font-mono text-[12px]"
          >
            {matchedStr.slice(1, -1)}
          </code>
        );
      } else if (matchedStr.startsWith('[⏱️') || matchedStr.includes('min')) {
        parts.push(
          <span
            key={keyIdx++}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 ml-1.5"
          >
            {matchedStr.replace(/^\[|\]$/g, '')}
          </span>
        );
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-[#475569]">
            {matchedStr.slice(1, -1)}
          </em>
        );
      } else {
        parts.push(matchedStr);
      }

      lastIndex = match.index + matchedStr.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed === '---') {
          return <hr key={idx} className="border-t border-[#E6E1D8] my-2.5" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-base font-bold text-[#0F172A] mt-2 pb-1 border-b border-[#EFECE6] flex items-center gap-1.5"
            >
              {renderInline(trimmed.substring(4))}
            </h4>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="text-sm font-bold text-[#0F172A] mt-1.5">
              {renderInline(trimmed.substring(5))}
            </h5>
          );
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-amber-700 font-bold mt-0.5">•</span>
              <div className="flex-1 text-[#1E293B]">{renderInline(trimmed.substring(2))}</div>
            </div>
          );
        }

        if (trimmed.startsWith('[ ] ') || trimmed.startsWith('[x] ')) {
          const checked = trimmed.startsWith('[x] ');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 py-0.5">
              <input
                type="checkbox"
                defaultChecked={checked}
                className="mt-1 rounded text-[#0F172A] focus:ring-0 cursor-pointer"
              />
              <div className="flex-1 text-xs text-[#334155]">{renderInline(trimmed.substring(4))}</div>
            </div>
          );
        }

        return (
          <p key={idx} className={isBot ? 'text-[#1E293B]' : 'text-[#FAF8F5]'}>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};
