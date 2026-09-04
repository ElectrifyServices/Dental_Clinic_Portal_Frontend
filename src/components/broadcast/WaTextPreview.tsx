import React from "react";

/**
 * Renders text the way WhatsApp does: *bold*, _italic_, ~strike~, ```mono```
 * and real line breaks. Used for template previews so the admin sees exactly
 * what the recipient will get.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|```[^`]+```)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    const inner = token.slice(
      token.startsWith("```") ? 3 : 1,
      token.startsWith("```") ? -3 : -1,
    );
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("*")) nodes.push(<strong key={key}>{inner}</strong>);
    else if (token.startsWith("_")) nodes.push(<em key={key}>{inner}</em>);
    else if (token.startsWith("~"))
      nodes.push(
        <span key={key} className="line-through">
          {inner}
        </span>,
      );
    else
      nodes.push(
        <code key={key} className="font-mono text-[0.9em]">
          {inner}
        </code>,
      );
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function WaTextPreview({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const lines = (text ?? "").split("\n");
  return (
    <div
      className={
        "rounded-lg bg-[#e7ffdb] text-slate-800 border border-emerald-200 p-3 text-sm leading-relaxed whitespace-pre-wrap " +
        className
      }
    >
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {line.length === 0 ? " " : renderInline(line, `l${idx}`)}
          {idx < lines.length - 1 ? "\n" : null}
        </React.Fragment>
      ))}
    </div>
  );
}

export default WaTextPreview;
