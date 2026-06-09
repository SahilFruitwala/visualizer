import { useMemo, useState } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

export function CodeBlock({
  code,
  highlightLines = [],
}: {
  code: string;
  highlightLines?: number[];
}) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => code.split("\n"), [code]);
  const highlighted = useMemo(() => new Set(highlightLines), [highlightLines]);

  const rendered = useMemo(
    () =>
      lines.map((line) =>
        hljs.highlight(line || " ", { language: "javascript" }).value,
      ),
    [lines],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="code-block-wrap">
      <button type="button" className="code-copy-btn" onClick={copy} title="Copy code">
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="code">
        <code className="hljs language-javascript">
          {rendered.map((html, i) => (
            <div
              key={i}
              className={`code-line${highlighted.has(i) ? " code-line-active" : ""}`}
            >
              <span className="code-ln" aria-hidden>
                {i + 1}
              </span>
              <span
                className="code-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
