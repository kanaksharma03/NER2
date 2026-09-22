import AlertPanel from "../components/AlertPanel";

export default function AlertsPanel() {
  return (
    <section className="panel-block">
      <div className="panel-kicker">Alert center</div>
      <h2>Authority and public notices</h2>
      <p className="disclaimer">Counts reflect the backend list, not decorative totals.</p>
      <AlertPanel />
    </section>
  );
}
