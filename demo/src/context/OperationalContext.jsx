import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchRegions } from "../api/regions";
import { fetchRiskGrid, fetchPointRisk } from "../api/risk";
import { fetchWeather } from "../api/weather";
import { fetchImpactedRoads } from "../api/roads";
import { fetchSafeRoute } from "../api/routes";
import { fetchReports } from "../api/reports";
import { fetchAlerts } from "../api/alerts";
import { setRainSimulation } from "../api/simulation";
import { fetchHistoryReplay } from "../api/history";
import { ApiError } from "../api/client";
import { clusterReports } from "../utils/geo";
import { countRiskCells } from "../utils/risk";

const OpsContext = createContext(null);

const emptyAsync = () => ({ data: null, loading: false, error: null });

export function OperationalProvider({ children }) {
  const [regions, setRegions] = useState(emptyAsync());
  const [regionId, setRegionId] = useState(1);
  const [grid, setGrid] = useState(emptyAsync());
  const [weather, setWeather] = useState(emptyAsync());
  const [roads, setRoads] = useState(emptyAsync());
  const [route, setRoute] = useState(emptyAsync());
  const [reports, setReports] = useState(emptyAsync());
  const [alerts, setAlerts] = useState(emptyAsync());
  const [pointRisk, setPointRisk] = useState(emptyAsync());
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [layers, setLayers] = useState({
    risk: true,
    roads: true,
    impacted: true,
    safeRoute: true,
    reports: true,
    clusters: true,
  });
  const [cursor, setCursor] = useState(null);
  const [connectivity, setConnectivity] = useState("unknown");
  const [simulation, setSimulation] = useState({
    active: false,
    rainfallDelta: 0,
    loading: false,
    error: null,
    lastResponse: null,
  });
  const [replay, setReplay] = useState({
    data: null,
    loading: false,
    error: null,
    frameIndex: 0,
    playing: false,
    active: false,
  });
  const [flyRequest, setFlyRequest] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setRegions({ data: null, loading: true, error: null });
    fetchRegions()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setRegions({ data: list, loading: false, error: null });
        setConnectivity("online");
        if (list.length && regionId == null) setRegionId(list[0].id);
      })
      .catch((err) => {
        if (cancelled) return;
        setRegions({ data: null, loading: false, error: err.message });
        setConnectivity(err.status === 0 ? "offline" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!regionId) return;
    let cancelled = false;
    const rainfallDelta = replay.active
      ? (replay.data?.frames?.[replay.frameIndex]?.risk_modifier || 0) * 200
      : simulation.rainfallDelta;

    async function loadRegion() {
      setGrid((s) => ({ ...s, loading: true, error: null }));
      setWeather((s) => ({ ...s, loading: true, error: null }));
      setRoads((s) => ({ ...s, loading: true, error: null }));
      setRoute((s) => ({ ...s, loading: true, error: null }));
      setReports((s) => ({ ...s, loading: true, error: null }));
      setAlerts((s) => ({ ...s, loading: true, error: null }));
      setSelectedRoad(null);
      setSelectedCluster(null);
      setSelectedReport(null);
      setSelectedAlert(null);
      setSelectedCell(null);
      setSelectedFeature(null);
      setPointRisk(emptyAsync());

      const tasks = [
        wrap("grid", () => fetchRiskGrid({ regionId, rainfallDelta })),
        wrap("weather", () => fetchWeather(regionId)),
        wrap("roads", () => fetchImpactedRoads(regionId)),
        wrap("route", () => fetchSafeRoute(regionId)),
        wrap("reports", () => fetchReports(regionId)),
        wrap("alerts", fetchAlerts),
      ];
      const results = await Promise.all(tasks);
      if (cancelled) return;
      const map = Object.fromEntries(results);
      apply("grid", map.grid, setGrid);
      apply("weather", map.weather, setWeather, (d) =>
        d && Object.keys(d).length ? d : null
      );
      apply("roads", map.roads, setRoads);
      apply("route", map.route, setRoute);
      apply("reports", map.reports, setReports, (d) => (Array.isArray(d) ? d : []));
      apply("alerts", map.alerts, setAlerts, (d) => (Array.isArray(d) ? d : []));
    }

    loadRegion();
    return () => {
      cancelled = true;
    };
  }, [
    regionId,
    simulation.rainfallDelta,
    simulation.active,
    replay.active,
    replay.frameIndex,
    replay.data,
  ]);

  useEffect(() => {
    if (!replay.playing || !replay.data?.frames?.length) return;
    const id = setInterval(() => {
      setReplay((s) => {
        const next = s.frameIndex + 1;
        if (next >= s.data.frames.length) {
          return { ...s, playing: false, frameIndex: s.data.frames.length - 1 };
        }
        return { ...s, frameIndex: next };
      });
    }, 1600);
    return () => clearInterval(id);
  }, [replay.playing, replay.data]);

  const selectedRegion = (regions.data || []).find((r) => r.id === regionId) || null;
  const features = grid.data?.features || [];
  const counts = countRiskCells(features);
  const clusters = useMemo(
    () => clusterReports(reports.data || []),
    [reports.data]
  );

  const value = {
    regions,
    regionId,
    setRegionId,
    selectedRegion,
    grid,
    weather,
    roads,
    route,
    reports,
    alerts,
    pointRisk,
    selectedCell,
    setSelectedCell,
    selectedRoad,
    setSelectedRoad,
    selectedCluster,
    setSelectedCluster,
    selectedReport,
    setSelectedReport,
    selectedAlert,
    setSelectedAlert,
    selectedFeature,
    setSelectedFeature,
    layers,
    setLayers,
    cursor,
    setCursor,
    connectivity,
    simulation,
    replay,
    counts,
    clusters,
    flyRequest,
    requestFly(payload) {
      setFlyRequest({ ...payload, ts: Date.now() });
    },
    async selectCell(feature) {
      setSelectedCell(feature);
      setSelectedFeature({ type: "risk", payload: feature });
      const coords = feature?.geometry?.coordinates?.[0];
      if (!coords?.length) return;
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      const lon = (Math.min(...lons) + Math.max(...lons)) / 2;
      const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
      setPointRisk({ data: null, loading: true, error: null });
      try {
        const data = await fetchPointRisk(lat, lon);
        setPointRisk({ data, loading: false, error: null });
      } catch (err) {
        setPointRisk({ data: null, loading: false, error: err.message });
      }
    },
    async toggleSimulation(enable, rainfallDelta = 0) {
      setSimulation((s) => ({ ...s, loading: true, error: null }));
      try {
        const lastResponse = await setRainSimulation(enable);
        setSimulation({
          active: Boolean(lastResponse?.simulate_rain_spike || enable),
          rainfallDelta: enable ? rainfallDelta : 0,
          loading: false,
          error: null,
          lastResponse,
        });
      } catch (err) {
        setSimulation((s) => ({ ...s, loading: false, error: err.message }));
      }
    },
    setRainfallDelta(value) {
      setSimulation((s) => ({ ...s, rainfallDelta: value, active: value > 0 || s.active }));
    },
    openFeature(feature) {
      setSelectedFeature(feature);
    },
    closeFeature() {
      setSelectedCell(null);
      setSelectedRoad(null);
      setSelectedCluster(null);
      setSelectedReport(null);
      setSelectedAlert(null);
      setSelectedFeature(null);
      setPointRisk(emptyAsync());
    },
    async loadReplay() {
      setReplay((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetchHistoryReplay();
        setReplay({
          data,
          loading: false,
          error: null,
          frameIndex: 0,
          playing: false,
          active: true,
        });
      } catch (err) {
        setReplay((s) => ({ ...s, loading: false, error: err.message, active: false }));
      }
    },
    setReplayFrame(index) {
      setReplay((s) => ({ ...s, frameIndex: index, active: true }));
    },
    toggleReplayPlay() {
      setReplay((s) => ({ ...s, playing: !s.playing, active: true }));
    },
    stopReplay() {
      setReplay((s) => ({ ...s, playing: false, active: false, frameIndex: 0 }));
    },
  };

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

export function useOps() {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error("useOps must be used within OperationalProvider");
  return ctx;
}

async function wrap(key, fn) {
  try {
    const data = await fn();
    return [key, { ok: true, data }];
  } catch (err) {
    return [key, { ok: false, error: err instanceof ApiError ? err.message : String(err) }];
  }
}

function apply(key, result, setter, transform = (d) => d) {
  if (!result) return;
  if (result.ok) setter({ data: transform(result.data), loading: false, error: null });
  else setter({ data: null, loading: false, error: result.error });
}
