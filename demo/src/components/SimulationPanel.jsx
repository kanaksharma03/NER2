import { useOps } from "../context/OperationalContext";
import LoadingState, { ErrorState } from "./States";

const PRESETS = [0, 10, 25, 50, 100];

export default function SimulationPanel() {
  const { simulation, toggleSimulation, setRainfallDelta } = useOps();

  return (
    <div>
      <div className="sim-banner" style={{ position: "static", transform: "none", marginBottom: 12 }}>
        SIMULATION — NOT AN OFFICIAL WARNING
      </div>
      <p style={{ fontSize: 13 }}>
        Applies a rainfall delta to the risk grid via <code>rainfall_delta</code> and can toggle the backend rain-spike flag.
      </p>
      <label>
        Rainfall increase (mm)
        <input
          className="input"
          type="range"
          min="0"
          max="100"
          step="5"
          value={simulation.rainfallDelta}
          onChange={(e) => setRainfallDelta(Number(e.target.value))}
        />
      </label>
      <div className="btn-row" style={{ margin: "10px 0" }}>
        {PRESETS.map((mm) => (
          <button key={mm} className="btn secondary" type="button" onClick={() => setRainfallDelta(mm)}>
            {mm === 0 ? "Reset 0 mm" : `+${mm} mm`}
          </button>
        ))}
      </div>
      <div className="metric">
        <div className="label">Current delta</div>
        <div className="value">{simulation.rainfallDelta} mm</div>
      </div>
      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn" type="button" disabled={simulation.loading} onClick={() => toggleSimulation(true, simulation.rainfallDelta)}>
          Enable backend rain spike
        </button>
        <button className="btn secondary" type="button" disabled={simulation.loading} onClick={() => toggleSimulation(false, 0)}>
          Disable spike
        </button>
      </div>
      {simulation.loading && <LoadingState lines={1} />}
      {simulation.error && <ErrorState message={simulation.error} />}
      {simulation.lastResponse && (
        <p className="disclaimer">Backend: simulate_rain_spike = {String(simulation.lastResponse.simulate_rain_spike)}</p>
      )}
    </div>
  );
}
