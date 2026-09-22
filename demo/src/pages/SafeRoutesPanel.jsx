import SafeRoutePanel from "../components/SafeRoutePanel";
import RoadImpactPanel from "../components/RoadImpactPanel";

export default function SafeRoutesPanel() {
  return (
    <>
      <section className="panel-block">
        <div className="panel-kicker">Decision support</div>
        <h2>Evacuation / alternate routing</h2>
        <SafeRoutePanel />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Context</div>
        <h2>Impacted roads</h2>
        <RoadImpactPanel />
      </section>
    </>
  );
}
