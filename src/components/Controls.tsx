import { useCallback, useRef, useState } from "react";
import type { Chapter } from "../engine/chapters";
import { chapterAt } from "../engine/chapters";
import type { Player } from "../engine/usePlayer";

const SPEEDS = [0.5, 1, 2, 4, 8];

export function Controls({
  player,
  chapters,
  onShuffle,
  onShare,
  onFocusToggle,
  focusMode,
}: {
  player: Player;
  chapters?: Chapter[];
  onShuffle?: () => void;
  onShare?: () => void;
  onFocusToggle?: () => void;
  focusMode?: boolean;
}) {
  const { index, length, playing, learnMode } = player;
  const chaps = chapters && chapters.length > 1 ? chapters : null;
  const current = chaps ? chapterAt(chaps, index) : null;
  const chIdx = chaps && current ? chaps.findIndex((c) => c.step === current.step) : -1;
  const prevChapter = chaps && chIdx > 0 ? chaps[chIdx - 1] : null;
  const nextChapter = chaps && chIdx >= 0 && chIdx < chaps.length - 1 ? chaps[chIdx + 1] : null;
  const max = Math.max(0, length - 1);
  const scrubRaf = useRef<number | null>(null);
  const scrubPending = useRef<number | null>(null);
  const scrubbing = useRef(false);
  const [dragging, setDragging] = useState(false);
  const pct = max > 0 ? (index / max) * 100 : 0;

  const cancelScrub = useCallback(() => {
    if (scrubRaf.current != null) {
      cancelAnimationFrame(scrubRaf.current);
      scrubRaf.current = null;
    }
    scrubPending.current = null;
  }, []);

  const flushScrub = useCallback(
    (value: number) => {
      cancelScrub();
      player.seek(value);
    },
    [cancelScrub, player],
  );

  const seekTo = useCallback(
    (step: number) => {
      cancelScrub();
      scrubbing.current = false;
      player.seek(step);
    },
    [cancelScrub, player],
  );

  const queueScrub = useCallback(
    (value: number) => {
      scrubPending.current = value;
      if (scrubRaf.current != null) return;
      scrubRaf.current = requestAnimationFrame(() => {
        scrubRaf.current = null;
        const next = scrubPending.current;
        if (next == null) return;
        scrubPending.current = null;
        player.seek(next);
      });
    },
    [player],
  );

  return (
    <div className="controls-root">
      <div className="scrubber-wrap">
        {chaps && current && chIdx >= 0 && (
          <div className="chapter-now">
            <button
              type="button"
              className="chapter-jump"
              disabled={!prevChapter}
              onClick={() => prevChapter && seekTo(prevChapter.step)}
              title={prevChapter?.title ?? "Previous chapter"}
              aria-label="Previous chapter"
            >
              ←
            </button>
            <div className="chapter-now-text">
              <span className="chapter-now-kicker">Chapter {chIdx + 1} of {chaps.length}</span>
              <span className="chapter-now-title">{current.title}</span>
            </div>
            <button
              type="button"
              className="chapter-jump"
              disabled={!nextChapter}
              onClick={() => nextChapter && seekTo(nextChapter.step)}
              title={nextChapter?.title ?? "Next chapter"}
              aria-label="Next chapter"
            >
              →
            </button>
          </div>
        )}

        <div className="scrubber-track" data-dragging={dragging}>
          <div className="scrubber-fill" style={{ width: `${pct}%` }} aria-hidden />
          <div className="scrubber-knob" style={{ left: `${pct}%` }} aria-hidden />
          {chaps && max > 0 && (
            <div className="scrubber-markers" aria-hidden>
              {chaps.map((ch, i) => (
                <button
                  key={ch.step}
                  type="button"
                  className="scrubber-marker"
                  style={{ left: `${(ch.step / max) * 100}%` }}
                  data-active={ch.step === current?.step}
                  data-past={ch.step < index}
                  title={`${i + 1}. ${ch.title}`}
                  onClick={() => seekTo(ch.step)}
                  tabIndex={-1}
                />
              ))}
            </div>
          )}
          <input
            type="range"
            min={0}
            max={max}
            value={index}
            onChange={(e) => queueScrub(Number(e.target.value))}
            onPointerDown={() => {
              scrubbing.current = true;
              setDragging(true);
            }}
            onPointerUp={(e) => {
              setDragging(false);
              if (!scrubbing.current) return;
              scrubbing.current = false;
              flushScrub(Number(e.currentTarget.value));
            }}
            onPointerCancel={() => {
              scrubbing.current = false;
              setDragging(false);
              cancelScrub();
            }}
            onKeyUp={(e) => flushScrub(Number(e.currentTarget.value))}
            className="scrubber"
            aria-label="Scrub timeline"
            aria-valuetext={`Step ${index + 1} of ${length}`}
          />
        </div>
      </div>

      <div className="controls-toolbar">
        <div className="controls-playback">
          <Btn onClick={player.reset} title="Restart (R)">
            ⏮
          </Btn>
          <Btn onClick={player.prev} title="Step back (←)">
            ◀
          </Btn>
          <Btn
            onClick={player.toggle}
            primary
            title={
              learnMode
                ? "Next step (Space)"
                : playing
                  ? "Pause (Space)"
                  : "Play (Space)"
            }
          >
            {learnMode ? "▶|" : playing ? "❚❚" : "▶"}
          </Btn>
          <Btn onClick={player.next} title="Step forward (→)">
            ▶
          </Btn>
        </div>

        <div className="controls-step">
          step {index + 1} / {length}
        </div>

        <div className="controls-extra">
          <button
            type="button"
            onClick={() => player.setLearnMode(!learnMode)}
            className="chip"
            data-active={learnMode}
            title="Learn mode: advance one step at a time"
          >
            learn {learnMode ? "on" : "off"}
          </button>

          {!learnMode && (
            <div className="controls-speed">
              <span className="controls-speed-label">speed</span>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => player.setSpeed(s)}
                  className="chip"
                  data-active={player.speed === s}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}

          {onShuffle && (
            <button type="button" onClick={onShuffle} className="chip" title="New random input">
              ⟳ shuffle
            </button>
          )}

          {onShare && (
            <button type="button" onClick={onShare} className="chip" title="Copy link to this step">
              ⧉ share
            </button>
          )}

          {onFocusToggle && (
            <button
              type="button"
              onClick={onFocusToggle}
              className="chip"
              data-active={focusMode}
              title="Focus mode: hide panels"
            >
              {focusMode ? "⊙ exit focus" : "⊙ focus"}
            </button>
          )}
        </div>
      </div>

      <div className="kbd-hints" aria-hidden>
        <span>← → step</span>
        <span>Space {learnMode ? "next" : "play"}</span>
        <span>R restart</span>
        <span>⌘K search</span>
        <span>? help</span>
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  primary,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  title?: string;
}) {
  return (
    <button type="button" onClick={onClick} title={title} className={primary ? "ctrl ctrl-primary" : "ctrl"}>
      {children}
    </button>
  );
}
