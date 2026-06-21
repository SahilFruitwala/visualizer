import { useCallback, useEffect, useRef, useState } from "react";

export interface PlayerOptions {
  initialSpeed?: number;
  initialIndex?: number;
  /** When true, play advances one step at a time (default learning mode). */
  learnMode?: boolean;
}

export interface Player {
  index: number;
  length: number;
  playing: boolean;
  /** True while a smooth (animated) seek is in flight. */
  seeking: boolean;
  speed: number;
  learnMode: boolean;
  setSpeed: (s: number) => void;
  setLearnMode: (v: boolean) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  seek: (i: number) => void;
  /** Animate from the current step to `i`, scrubbing through the steps in between. */
  seekSmooth: (i: number) => void;
  atEnd: boolean;
}

function readLearnMode(): boolean {
  try {
    const v = localStorage.getItem("devviz:learn-mode");
    if (v === "false") return false;
    if (v === "true") return true;
  } catch {
    /* ignore */
  }
  return false;
}

// Drives a stepped timeline with play/pause, variable speed, and scrubbing.
// Uses requestAnimationFrame so speed changes feel smooth and we never drift.
export function usePlayer(length: number, opts: PlayerOptions = {}): Player {
  const { initialSpeed = 1, initialIndex = 0, learnMode: initialLearn = readLearnMode() } = opts;
  const [index, setIndex] = useState(() =>
    Math.max(0, Math.min(initialIndex, Math.max(0, length - 1))),
  );
  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [learnMode, setLearnModeState] = useState(initialLearn);

  const acc = useRef(0);
  const last = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const seekRaf = useRef<number | null>(null);
  const indexRef = useRef(index);
  const prevInitialIndex = useRef(initialIndex);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const cancelSmooth = useCallback(() => {
    if (seekRaf.current != null) {
      cancelAnimationFrame(seekRaf.current);
      seekRaf.current = null;
      setSeeking(false);
    }
  }, []);

  const setLearnMode = useCallback((v: boolean) => {
    setLearnModeState(v);
    setPlaying(false);
    try {
      localStorage.setItem("devviz:learn-mode", String(v));
    } catch {
      /* ignore */
    }
  }, []);

  // Clamp index when step count changes (e.g. shuffle).
  useEffect(() => {
    setPlaying(false);
    acc.current = 0;
    setIndex((i) => Math.max(0, Math.min(i, Math.max(0, length - 1))));
  }, [length]);

  // Sync URL / resume position — only when the URL actually changes (back/forward, shared link).
  // Do not re-sync when playback pauses; a stale URL would undo chapter seeks mid-animation.
  useEffect(() => {
    if (playing || seeking) return;
    if (prevInitialIndex.current === initialIndex) return;
    prevInitialIndex.current = initialIndex;
    const i = Math.max(0, Math.min(initialIndex, Math.max(0, length - 1)));
    setIndex((cur) => {
      if (cur === i) return cur;
      acc.current = 0;
      return i;
    });
  }, [initialIndex, length, playing, seeking]);

  useEffect(() => {
    if (!playing || learnMode) {
      last.current = null;
      return;
    }
    const tick = (t: number) => {
      if (last.current == null) last.current = t;
      const dt = (t - last.current) / 1000;
      last.current = t;
      acc.current += dt * speed;
      if (acc.current >= 1) {
        const advance = Math.floor(acc.current);
        acc.current -= advance;
        setIndex((i) => {
          const ni = Math.min(i + advance, length - 1);
          if (ni >= length - 1) setPlaying(false);
          return ni;
        });
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed, length, learnMode]);

  const next = useCallback(() => {
    cancelSmooth();
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, length - 1));
  }, [length, cancelSmooth]);

  const play = useCallback(() => {
    cancelSmooth();
    if (learnMode) {
      setPlaying(false);
      setIndex((i) => {
        if (i >= length - 1) {
          acc.current = 0;
          return 0;
        }
        return i + 1;
      });
      return;
    }
    setIndex((i) => (i >= length - 1 ? 0 : i));
    acc.current = 0;
    setPlaying(true);
  }, [length, learnMode, cancelSmooth]);

  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const prev = useCallback(() => {
    cancelSmooth();
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, [cancelSmooth]);
  const reset = useCallback(() => {
    cancelSmooth();
    setPlaying(false);
    acc.current = 0;
    setIndex(0);
  }, [cancelSmooth]);
  const seek = useCallback(
    (i: number) => {
      cancelSmooth();
      setPlaying(false);
      acc.current = 0;
      setIndex(Math.max(0, Math.min(i, length - 1)));
    },
    [length, cancelSmooth],
  );

  // Eased scrub from the current step to the target — used for chapter jumps so
  // they read as a quick fast-forward/rewind instead of a hard cut. Duration is
  // fixed (~ms below) regardless of distance, so far jumps don't crawl.
  const seekSmooth = useCallback(
    (target: number) => {
      cancelSmooth();
      setPlaying(false);
      acc.current = 0;
      const clamped = Math.max(0, Math.min(Math.round(target), length - 1));
      const start = indexRef.current;
      if (clamped === start) return;
      const distance = Math.abs(clamped - start);
      // Scale duration with distance but keep it snappy and capped.
      const duration = Math.min(520, 140 + distance * 45);
      const t0 = performance.now();
      const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
      setSeeking(true);
      const loop = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const i = Math.round(start + (clamped - start) * easeOutCubic(p));
        setIndex(i);
        if (p < 1) {
          seekRaf.current = requestAnimationFrame(loop);
        } else {
          seekRaf.current = null;
          setSeeking(false);
          setIndex(clamped);
        }
      };
      seekRaf.current = requestAnimationFrame(loop);
    },
    [length, cancelSmooth],
  );

  useEffect(() => cancelSmooth, [cancelSmooth]);

  return {
    index,
    length,
    playing,
    seeking,
    speed,
    learnMode,
    setSpeed,
    setLearnMode,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    seek,
    seekSmooth,
    atEnd: index >= length - 1,
  };
}
