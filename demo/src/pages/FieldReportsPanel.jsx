import CitizenReportForm, { ReportList } from "../components/CitizenReportForm";

export default function FieldReportsPanel() {
  return (
    <>
      <section className="panel-block">
        <div className="panel-kicker">Verify</div>
        <h2>Submit field report</h2>
        <CitizenReportForm />
      </section>
      <section className="panel-block">
        <div className="panel-kicker">Active reports</div>
        <h2>Region intelligence</h2>
        <ReportList />
      </section>
    </>
  );
}
