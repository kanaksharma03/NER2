import RoadImpactPanel from "../components/RoadImpactPanel";
import SafeRoutePanel from "../components/SafeRoutePanel";

export default function RoadImpactPagePanel() {
  return (
    <>
      <section className="panel-block">
        <div className="panel-kicker">Highway impact</div>
        <h2>Affected segments</h2>
        <p className="disclaimer">Values come from GET /api/v1/roads-impacted for the selected region_id.</p>
        <RoadImpactPanel />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Act</div>
        <h2>Safe routing</h2>
        <SafeRoutePanel />
      </section>
    </>
  );
}
