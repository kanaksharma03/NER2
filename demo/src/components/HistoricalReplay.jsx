import { useEffect } from "react";
import { useOps } from "../context/OperationalContext";
import LoadingState, { EmptyState, ErrorState } from "./States";

export default function HistoricalReplay() {
  const { replay, loadReplay, setReplayFrame, toggleReplayPlay, stopReplay } = useOps();

  useEffect(() => {
    loadReplay();
  }, []);

  if (replay.loading) return <LoadingState />;
  if (replay.error) return <ErrorState message="Unable to retrieve historical replay frames." />;
  if (!replay.data?.frames?.length) return <EmptyState message="No historical frames returned." />;

  const frame = replay.data.frames[replay.frameIndex];

  return (
    <div>
      <div className="sim-banner" style={{ position: "static", transform: "none", marginBottom: 12 }}>
        HISTORICAL REPLAY — NOT AN OFFICIAL WARNING
      </div>
      <p>
        Event: <strong>{replay.data.event}</strong>
      </p>
      <p style={{ fontSize: 13 }}>
        Frame {replay.frameIndex + 1} / {replay.data.frames.length}: {frame.time} · modifier {frame.risk_modifier}
      </p>
      <p>{frame.description}</p>
      <input
        className="input"
        type="range"
        min="0"
        max={replay.data.frames.length - 1}
        value={replay.frameIndex}
        onChange={(e) => setReplayFrame(Number(e.target.value))}
        aria-label="Replay timeline"
      />
      <div className="btn-row" style={{ marginTop: 10 }}>
        <button className="btn" type="button" onClick={toggleReplayPlay}>
          {replay.playing ? "Pause" : "Play"}
        </button>
        <button className="btn secondary" type="button" onClick={stopReplay}>
          Exit replay
        </button>
      </div>
      <div className="timeline" style={{ marginTop: 12 }}>
        {replay.data.frames.map((f, i) => (
          <button
            key={f.time}
            className={`frame ${i === replay.frameIndex ? "active" : ""}`}
            type="button"
            onClick={() => setReplayFrame(i)}
            style={{ textAlign: "left", border: 0, width: "100%" }}
          >
            <strong>{f.time}</strong>
            <div>{f.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
