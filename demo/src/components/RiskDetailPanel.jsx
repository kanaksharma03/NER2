import { useOps } from "../context/OperationalContext";
import { explanationSentence, formatPct, readableFeature, severityClass } from "../utils/risk";
import LoadingState, { EmptyState, ErrorState } from "./States";

export default function RiskDetailPanel() {
  const { selectedCell, pointRisk } = useOps();
  if (!selectedCell) {
    return <EmptyState message="Select a risk cell on the map to inspect predicted probability and model drivers." />;
  }

  const gridProb = selectedCell.properties?.probability;
  const detail = pointRisk.data;

  return (
    <div>
      <div className="metric-row">
        <div className="metric">
          <div className="label">Grid probability</div>
          <div className="value">{formatPct(gridProb)}</div>
          <div className="hint">NER-DRISHTI ML · derived risk</div>
        </div>
        <div className="metric">
          <div className="label">Elevation / slope</div>
          <div className="value">
            {selectedCell.properties?.elevation ?? "—"}
            <span style={{ fontSize: 13, color: "var(--muted)" }}> m</span>
          </div>
          <div className="hint">Slope {selectedCell.properties?.slope ?? "unavailable"}°</div>
        </div>
      </div>

      {pointRisk.loading && <LoadingState lines={2} />}
      {pointRisk.error && <ErrorState message="Unable to retrieve point risk explanation." />}
      {detail && (
        <>
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`badge ${severityClass(detail.severity || detail.severity_tier)}`}>
              {detail.severity || detail.severity_tier}
            </span>
            <strong>{formatPct(detail.probability ?? detail.risk_probability)}</strong>
          </div>
          <p style={{ fontSize: 13, color: "var(--slate)" }}>{explanationSentence(detail)}</p>
          <div className="source-tag">
            <span>
              {detail.lat}, {detail.lon}
            </span>
            <span>{detail.timestamp || "no timestamp"}</span>
          </div>
          <h3 style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Feature contributions
          </h3>
          {(detail.top_factors || []).map((factor) => {
            const mag = Math.min(1, Math.abs(Number(factor.contribution) || 0) * 2);
            const pos = factor.is_positive_driver && (factor.contribution || 0) >= 0;
            return (
              <div className="shap-row" key={factor.feature}>
                <span>{readableFeature(factor.feature)}</span>
                <div className={`shap-bar ${pos ? "pos" : "neg"}`}>
                  <span style={{ width: `${Math.max(6, mag * 100)}%` }} />
                </div>
                <span>{Number(factor.contribution).toFixed(3)}</span>
              </div>
            );
          })}
          <p className="disclaimer">
            Predicted risk is decision support, not a guaranteed outcome and not a replacement for IMD, GSI, or field inspection.
          </p>
        </>
      )}
    </div>
  );
}
