import { getApiBase } from "../api/client";
import { useOps } from "../context/OperationalContext";

export default function StatusBar() {
  const { connectivity, selectedRegion, weather, simulation, replay } = useOps();
  const updated = weather.data?.updated_at;
  return (
    <footer className="status-bar">
      <span>
        {selectedRegion ? (
          <>
            <strong>{selectedRegion.state}</strong> · {selectedRegion.corridor_name}
          </>
        ) : (
          "No region selected"
        )}
      </span>
      <span>
        API {connectivity === "online" ? "connected" : connectivity} · {getApiBase() || "base URL not set"}
      </span>
      <span>
        Weather: {updated ? `Open-Meteo snapshot ${updated}` : "no timestamp from backend"}
      </span>
      <span>
        {simulation.active ? "SIMULATION ACTIVE" : replay.active ? "HISTORICAL REPLAY" : "OPERATIONAL VIEW"}
      </span>
    </footer>
  );
}
