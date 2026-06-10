import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { StepBase } from "../engine/types";

/** Hidden layer — only remeasures when the step list changes, not on every scrub. */
const StageMeasureLayer = memo(function StageMeasureLayer({
  steps,
  renderStep,
  measureRef,
}: {
  steps: StepBase[];
  renderStep: (step: StepBase, index: number) => ReactNode;
  measureRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="stage-measure" ref={measureRef} aria-hidden>
      {steps.map((s, i) => (
        <div key={i} className="stage-measure-step">
          {renderStep(s, i)}
        </div>
      ))}
    </div>
  );
});

const StageCaptionMeasureLayer = memo(function StageCaptionMeasureLayer({
  steps,
  measureRef,
}: {
  steps: StepBase[];
  measureRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="stage-caption-measure" ref={measureRef} aria-hidden>
      {steps.map((s, i) => (
        <div key={i} className="stage-caption-measure-step">
          <div className="caption-block">
            <div className="caption">{s.caption}</div>
            {s.insight && <div className="step-insight">{s.insight}</div>}
          </div>
        </div>
      ))}
    </div>
  );
});

export function Stage({
  steps,
  renderStep,
  index,
  caption,
  insight,
}: {
  steps: StepBase[];
  renderStep: (step: StepBase, index: number) => ReactNode;
  index: number;
  caption: string;
  insight?: string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const captionMeasureRef = useRef<HTMLDivElement>(null);
  const [canvasHeight, setCanvasHeight] = useState(280);
  const [captionBlockHeight, setCaptionBlockHeight] = useState<number | undefined>();

  const measure = useCallback(() => {
    const container = measureRef.current;
    if (container) {
      let max = 200;
      for (const el of container.children) {
        max = Math.max(max, (el as HTMLElement).offsetHeight);
      }
      setCanvasHeight((prev) => (prev === max ? prev : max));
    }

    const captions = captionMeasureRef.current;
    if (captions) {
      let max = 0;
      for (const el of captions.children) {
        max = Math.max(max, (el as HTMLElement).offsetHeight);
      }
      if (max > 0) setCaptionBlockHeight((prev) => (prev === max ? prev : max));
    }
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [steps, renderStep, measure]);

  useLayoutEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    for (const el of measureRef.current?.children ?? []) ro.observe(el);
    for (const el of captionMeasureRef.current?.children ?? []) ro.observe(el);
    return () => ro.disconnect();
  }, [measure, steps]);

  return (
    <section className="stage">
      <StageMeasureLayer steps={steps} renderStep={renderStep} measureRef={measureRef} />
      <div className="stage-canvas" style={{ height: canvasHeight }}>
        <div className="stage-canvas-inner">{renderStep(steps[index], index)}</div>
      </div>
      <StageCaptionMeasureLayer steps={steps} measureRef={captionMeasureRef} />
      <div
        className="caption-block"
        style={captionBlockHeight ? { height: captionBlockHeight } : undefined}
      >
        <div className="caption">{caption}</div>
        {insight && <div className="step-insight">{insight}</div>}
      </div>
    </section>
  );
}
