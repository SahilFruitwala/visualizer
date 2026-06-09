import type { Player } from "../engine/usePlayer";
import { C, FONT_MONO } from "../theme";

const SPEEDS = [0.5, 1, 2, 4, 8];

// Transport bar: prev / play-pause / next, a scrubber, and a speed selector.
export function Controls({ player, onShuffle }: { player: Player; onShuffle?: () => void }) {
  const { index, length, playing } = player;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* scrubber */}
      <input
        type="range"
        min={0}
        max={Math.max(0, length - 1)}
        value={index}
        onChange={(e) => player.seek(Number(e.target.value))}
        className="scrubber"
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Btn onClick={player.reset} title="Restart">⏮</Btn>
        <Btn onClick={player.prev} title="Step back">◀</Btn>
        <Btn onClick={player.toggle} primary title={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </Btn>
        <Btn onClick={player.next} title="Step forward">▶</Btn>

        <div style={{ marginLeft: 8, fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted, minWidth: 86 }}>
          step {index + 1} / {length}
        </div>

        <div style={{ flex: 1 }} />

        <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => player.setSpeed(s)}
            className="chip"
            data-active={player.speed === s}
          >
            {s}×
          </button>
        ))}
        {onShuffle && (
          <button onClick={onShuffle} className="chip" style={{ marginLeft: 8 }} title="New random input">
            ⟳ shuffle
          </button>
        )}
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
    <button onClick={onClick} title={title} className={primary ? "ctrl ctrl-primary" : "ctrl"}>
      {children}
    </button>
  );
}
