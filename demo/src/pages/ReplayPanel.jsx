import HistoricalReplay from "../components/HistoricalReplay";

export default function ReplayPanel() {
  return (
    <section className="panel-block">
      <div className="panel-kicker">Historical records</div>
      <h2>Event replay</h2>
      <HistoricalReplay />
    </section>
  );
}
