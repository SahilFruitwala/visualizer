import { useEffect, useEffectEvent, useRef } from "react";

const SHORTCUTS = [
  { keys: "Space", action: "Play / pause (or next step in learn mode)" },
  { keys: "← →", action: "Previous / next step" },
  { keys: "R", action: "Restart animation" },
  { keys: "Home / End", action: "Jump to first / last step" },
  { keys: "⌘K", action: "Open search" },
  { keys: "?", action: "Toggle this help" },
];

export function KeyboardHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  const onCloseEvent = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseEvent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    const modal = modalRef.current;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    modal.addEventListener("keydown", onTab);
    return () => modal.removeEventListener("keydown", onTab);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="search-overlay keyboard-help-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div ref={modalRef} className="search-modal keyboard-help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="keyboard-help-head">
          <h2 className="keyboard-help-title">Keyboard shortcuts</h2>
          <button type="button" className="keyboard-help-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <dl className="keyboard-help-list">
          {SHORTCUTS.map(({ keys, action }) => (
            <div key={keys} className="keyboard-help-row">
              <dt>
                <kbd className="keyboard-help-kbd">{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>

        <div className="search-footer">
          <span>
            Press <kbd>?</kbd> or <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
