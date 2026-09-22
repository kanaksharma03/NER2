import SimulationPanel from "../components/SimulationPanel";
import OperationalSummary from "../components/OperationalSummary";

export default function SimulationPagePanel() {
  return (
    <>
      <section className="panel-block">
        <div className="panel-kicker">Scenario</div>
        <h2>Rainfall simulation</h2>
        <SimulationPanel />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Simulated grid</div>
        <h2>Resulting cell counts</h2>
        <OperationalSummary />
      </section>
    </>
  );
}
