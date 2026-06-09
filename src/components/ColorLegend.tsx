import { C } from "../theme";

const ITEMS = [
  { color: C.active, label: "Active / processing" },
  { color: C.compare, label: "Comparing / leaving" },
  { color: C.sorted, label: "Done / found / sorted" },
  { color: C.pointer, label: "Pointer / frontier" },
  { color: C.highlight, label: "Visited / highlighted" },
] as const;

export function ColorLegend() {
  return (
    <details className="color-legend-panel">
      <summary className="color-legend-summary">Color key</summary>
      <div className="color-legend" aria-label="Visualization color key">
        {ITEMS.map((item) => (
          <span key={item.label} className="legend-item">
            <span className="legend-swatch" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </details>
  );
}
