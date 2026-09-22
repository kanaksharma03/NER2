import OperationalSummary from "../components/OperationalSummary";
import WeatherPanel from "../components/WeatherPanel";
import AlertPanel from "../components/AlertPanel";
import RoadImpactPanel from "../components/RoadImpactPanel";

export default function CommandCenterPanel() {
  return (
    <>
      <section className="panel-block">
        <div className="panel-kicker">Situation</div>
        <h2>Operational summary</h2>
        <OperationalSummary />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Open-Meteo · live telemetry</div>
        <h2>Corridor weather</h2>
        <WeatherPanel />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Prioritise</div>
        <h2>Road impact</h2>
        <RoadImpactPanel />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Act</div>
        <h2>Alerts</h2>
        <AlertPanel compact />
      </section>
    </>
  );
}
