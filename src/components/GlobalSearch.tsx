import { useEffect, useMemo, useRef, useState } from "react";
import { TOPICS } from "../topics";
import { sectionForTopic } from "../sections";

export function GlobalSearch({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (topicId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOPICS.slice(0, 12);
    return TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.blurb.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.badges?.some((b) => b.toLowerCase().includes(q)),
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        onSelect(results[active].id);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, onClose, onSelect]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search topics" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span className="search-icon" aria-hidden>
            ⌕
          </span>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search all topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search topics"
            autoComplete="off"
          />
          <kbd className="search-kbd">esc</kbd>
        </div>

        <ul className="search-results" role="listbox">
          {results.length === 0 && (
            <li className="search-empty-row">No topics match “{query.trim()}”.</li>
          )}
          {results.map((t, i) => {
            const section = sectionForTopic(t.id);
            return (
              <li key={t.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className="search-result"
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onSelect(t.id);
                    onClose();
                  }}
                >
                  <span className="search-result-main">
                    <span className="search-result-title">{t.title}</span>
                    <span className="search-result-meta">
                      {section?.shortLabel} · {t.category}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="search-footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>
            <kbd>⌘</kbd>K toggle
          </span>
        </div>
      </div>
    </div>
  );
}
