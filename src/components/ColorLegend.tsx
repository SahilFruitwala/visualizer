import { C, type Palette } from "../theme";

const LEGEND: { key: keyof Palette; label: string }[] = [
  { key: "active", label: "Active / processing" },
  { key: "compare", label: "Comparing / leaving" },
  { key: "sorted", label: "Done / found / sorted" },
  { key: "pointer", label: "Pointer / frontier" },
  { key: "highlight", label: "Visited / highlighted" },
];

export function ColorLegend() {
  return (
    <details className="color-legend-panel">
      <summary className="color-legend-summary">Color key</summary>
      <div className="color-legend" aria-label="Visualization color key">
        {LEGEND.map(({ key, label }) => (
          <span key={label} className="legend-item">
            <span className="legend-swatch" style={{ background: C[key] }} />
            {label}
          </span>
        ))}
      </div>
    </details>
  );
}
