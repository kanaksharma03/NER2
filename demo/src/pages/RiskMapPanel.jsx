import RiskDetailPanel from "../components/RiskDetailPanel";
import WeatherPanel from "../components/WeatherPanel";

export default function RiskMapPanel() {
  return (
    <>
      <section className="panel-block">
        <div className="panel-kicker">GIS · predicted risk</div>
        <h2>Risk cell inspector</h2>
        <p className="disclaimer">Click a corridor cell. Color uses backend probability: Low &lt; 0.20, Moderate ≤ 0.50, High ≤ 0.80, Critical &gt; 0.80.</p>
        <RiskDetailPanel />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Open-Meteo</div>
        <h2>Weather at region</h2>
        <WeatherPanel />
      </section>
    </>
  );
}
