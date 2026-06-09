import { useEffect, useState } from "react";
import type { Chapter } from "../engine/chapters";
import { chapterAt } from "../engine/chapters";

const STORAGE_KEY = "devviz:chapters-open";

function readOpen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

export function ChapterPanel({
  chapters,
  index,
  onSeek,
}: {
  chapters: Chapter[];
  index: number;
  onSeek: (step: number) => void;
}) {
  const [open, setOpen] = useState(readOpen);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(open));
    } catch {
      /* ignore */
    }
  }, [open]);

  if (chapters.length <= 1) return null;

  const active = chapterAt(chapters, index);
  const activeIdx = chapters.findIndex((c) => c.step === active.step);

  return (
    <section className="chapter-panel" aria-label="Jump to chapter">
      <button
        type="button"
        className="chapter-panel-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="chapter-panel-toggle-left">
          <span className="panel-title" style={{ margin: 0 }}>
            Chapters
          </span>
          {!open && (
            <span className="chapter-panel-collapsed-hint">
              {activeIdx + 1}. {active.title}
            </span>
          )}
        </span>
        <span className="chapter-panel-chevron" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <div className="chapter-chips">
          {chapters.map((ch, i) => (
            <button
              key={`${ch.step}-${ch.title}`}
              type="button"
              className="chapter-chip"
              data-active={ch.step === active.step}
              data-past={ch.step < index && ch.step !== active.step}
              onClick={() => onSeek(ch.step)}
              title={ch.title}
            >
              <span className="chapter-chip-num">{i + 1}</span>
              <span className="chapter-chip-label">{ch.title}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
