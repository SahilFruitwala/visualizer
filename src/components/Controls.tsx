import type { Chapter } from "../engine/chapters";
import { chapterAt } from "../engine/chapters";
import type { Player } from "../engine/usePlayer";

const SPEEDS = [0.5, 1, 2, 4, 8];

export function Controls({
  player,
  chapters,
  onShuffle,
}: {
  player: Player;
  chapters?: Chapter[];
  onShuffle?: () => void;
}) {
  const { index, length, playing, learnMode } = player;
  const chaps = chapters && chapters.length > 1 ? chapters : null;
  const current = chaps ? chapterAt(chaps, index) : null;
  const chIdx = chaps && current ? chaps.findIndex((c) => c.step === current.step) : -1;
  const prevChapter = chaps && chIdx > 0 ? chaps[chIdx - 1] : null;
  const nextChapter = chaps && chIdx >= 0 && chIdx < chaps.length - 1 ? chaps[chIdx + 1] : null;

  return (
    <div className="controls-root">
      <div className="scrubber-wrap">
        {chaps && current && chIdx >= 0 && (
          <div className="chapter-now">
            <button
              type="button"
              className="chapter-jump"
              disabled={!prevChapter}
              onClick={() => prevChapter && player.seek(prevChapter.step)}
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
              onClick={() => nextChapter && player.seek(nextChapter.step)}
              title={nextChapter?.title ?? "Next chapter"}
              aria-label="Next chapter"
            >
              →
            </button>
          </div>
        )}
        <input
          type="range"
          min={0}
          max={Math.max(0, length - 1)}
          value={index}
          onChange={(e) => player.seek(Number(e.target.value))}
          className="scrubber"
          aria-label="Scrub timeline"
        />
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
            <button
              type="button"
              onClick={onShuffle}
              className="chip"
              title="New random input"
            >
              ⟳ shuffle
            </button>
          )}
        </div>
      </div>

      <div className="kbd-hints" aria-hidden>
        <span>← → step</span>
        <span>Space {learnMode ? "next" : "play"}</span>
        <span>R restart</span>
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
