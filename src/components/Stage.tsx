import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { StepBase } from "../engine/types";

export function Stage({
  steps,
  renderStep,
  index,
  caption,
}: {
  steps: StepBase[];
  renderStep: (step: StepBase, index: number) => ReactNode;
  index: number;
  caption: string;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [canvasHeight, setCanvasHeight] = useState(280);

  const measure = useCallback(() => {
    const container = measureRef.current;
    if (!container) return;
    let max = 200;
    for (const el of container.children) {
      max = Math.max(max, (el as HTMLElement).offsetHeight);
    }
    setCanvasHeight(max);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [steps, renderStep, measure]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <section className="stage" ref={stageRef}>
      <div className="stage-measure" ref={measureRef} aria-hidden>
        {steps.map((s, i) => (
          <div key={i} className="stage-measure-step">
            {renderStep(s, i)}
          </div>
        ))}
      </div>
      <div className="stage-canvas" style={{ height: canvasHeight }}>
        <div className="stage-canvas-inner">{renderStep(steps[index], index)}</div>
      </div>
      <div className="caption">{caption}</div>
    </section>
  );
}
