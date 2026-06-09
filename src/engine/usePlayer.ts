import { useCallback, useEffect, useRef, useState } from "react";

export interface Player {
  index: number;
  length: number;
  playing: boolean;
  speed: number; // steps per second
  setSpeed: (s: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  seek: (i: number) => void;
  atEnd: boolean;
}

// Drives a stepped timeline with play/pause, variable speed, and scrubbing.
// Uses requestAnimationFrame so speed changes feel smooth and we never drift.
export function usePlayer(length: number, initialSpeed = 2): Player {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  const acc = useRef(0);
  const last = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  // Reset to start whenever the timeline length changes (new topic / reshuffle).
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    acc.current = 0;
  }, [length]);

  useEffect(() => {
    if (!playing) {
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
  }, [playing, speed, length]);

  const play = useCallback(() => {
    setIndex((i) => (i >= length - 1 ? 0 : i)); // replay from start if at end
    acc.current = 0;
    setPlaying(true);
  }, [length]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const next = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, length - 1));
  }, [length]);
  const prev = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const reset = useCallback(() => {
    setPlaying(false);
    acc.current = 0;
    setIndex(0);
  }, []);
  const seek = useCallback(
    (i: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(i, length - 1)));
    },
    [length],
  );

  return {
    index,
    length,
    playing,
    speed,
    setSpeed,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    seek,
    atEnd: index >= length - 1,
  };
}
