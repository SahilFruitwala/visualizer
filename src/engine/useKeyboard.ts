import { useEffect } from "react";
import type { Player } from "./usePlayer";

export function usePlayerKeyboard(player: Player, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          player.toggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          player.next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          player.prev();
          break;
        case "r":
        case "R":
          player.reset();
          break;
        case "Home":
          e.preventDefault();
          player.seek(0);
          break;
        case "End":
          e.preventDefault();
          player.seek(player.length - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, enabled]);
}
