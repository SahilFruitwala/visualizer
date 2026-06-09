import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

hljs.registerLanguage("javascript", javascript);

export function CodeBlock({ code }: { code: string }) {
  const html = useMemo(
    () => hljs.highlight(code, { language: "javascript" }).value,
    [code],
  );

  return (
    <pre className="code">
      <code className="hljs language-javascript" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
