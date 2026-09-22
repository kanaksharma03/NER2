import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useOps } from "../context/OperationalContext";
import { classifyProbability, RISK_COLORS, formatPct } from "../utils/risk";
import { boundsFromGeoJSON } from "../utils/geo";
import RiskLegend from "./RiskLegend";

const STYLE = {
  version: 8,
  name: "NER-DRISHTI terrain",
  sources: {
    terrain: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "terrain-base", type: "raster", source: "terrain" }],
};

export default function RiskMap() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const {
    grid,
    route,
    reports,
    clusters,
    layers,
    setLayers,
    selectCell,
    selectedRegion,
    flyRequest,
    setCursor,
    simulation,
    replay,
    setSelectedFeature,
    selectedCell,
  } = useOps();

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: selectedRegion ? [selectedRegion.center_lon, selectedRegion.center_lat] : [91.85, 25.85],
      zoom: 10,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("mousemove", (e) => {
      setCursor({ lon: e.lngLat.lng, lat: e.lngLat.lat });
    });
    mapRef.current = map;
    return () => {
      const current = mapRef.current;
      if (current) {
        current.remove();
        mapRef.current = null;
      }
    };
  }, [setCursor]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      try {
        ensureSources(map);
        const primaryRoute = normalizeRouteFeature(route.data?.primary_route);
        const safeRouteFeature = route.data?.is_primary_blocked
          ? (route.data?.alternate_route ?? route.data?.active_route)
          : (route.data?.primary_route ?? route.data?.active_route ?? route.data?.alternate_route);
        const safeRouteGeoJSON = normalizeRouteFeature(safeRouteFeature ?? route.data);
        const waypointsFC = waypointsToFC(route.data);
        const reportsFC = reportsToFC(reports.data || []);
        const clustersFC = clustersToFC(clusters || []);

        setGeoJSON(map, "risk-grid", grid.data || emptyFC());
        setGeoJSON(map, "primary-route", primaryRoute);
        setGeoJSON(map, "alternate-route", safeRouteGeoJSON);
        setGeoJSON(map, "safe-route", safeRouteGeoJSON);
        setGeoJSON(map, "route-waypoints", waypointsFC);
        setGeoJSON(map, "reports", reportsFC);
        setGeoJSON(map, "clusters", clustersFC);

        setLayerVisibility(map, "risk-fill", layers.risk);
        setLayerVisibility(map, "risk-line", layers.risk);
        setLayerVisibility(map, "primary-line-casing", layers.roads || layers.impacted);
        setLayerVisibility(map, "primary-line", layers.roads || layers.impacted);
        setLayerVisibility(map, "safe-route-casing", layers.safeRoute);
        setLayerVisibility(map, "safe-route-line", layers.safeRoute);
        setLayerVisibility(map, "safe-route-flow", layers.safeRoute);
        setLayerVisibility(map, "waypoints-circle", layers.safeRoute);
        setLayerVisibility(map, "waypoints-label", layers.safeRoute);
        setLayerVisibility(map, "reports-circle", layers.reports);
        setLayerVisibility(map, "clusters-circle", layers.clusters);
        setLayerVisibility(map, "clusters-label", layers.clusters);

        const bounds = boundsFromGeoJSON(grid.data) || boundsFromGeoJSON(safeRouteGeoJSON);
        if (bounds) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 800 });
        } else if (selectedRegion?.center_lon && selectedRegion?.center_lat) {
          map.flyTo({
            center: [selectedRegion.center_lon, selectedRegion.center_lat],
            zoom: 10.5,
            duration: 800,
          });
        }
      } catch (err) {
        console.warn("Map update transient issue", err);
      }
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [grid.data, route.data, reports.data, clusters, layers, selectedRegion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof map.getLayer !== "function") return;
    if (map.getLayer("risk-fill-highlight")) {
      map.setFilter("risk-fill-highlight", ["==", ["get", "id"], selectedCell?.id ?? -1]);
    }
  }, [selectedCell]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyRequest) return;
    const run = () => {
      if (flyRequest.bounds) {
        map.fitBounds(flyRequest.bounds, { padding: 70, duration: 1100, maxZoom: 13 });
      } else if (flyRequest.center) {
        map.flyTo({ center: flyRequest.center, zoom: flyRequest.zoom || 12, duration: 1100 });
      }
    };
    if (map.isStyleLoaded()) run();
  }, [flyRequest]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onClick = (e) => {
      const feature = e.features?.[0];
      if (feature) {
        selectCell(feature);
        setSelectedFeature({ type: "risk", payload: feature });
      }
    };
    const onRouteClick = () => {
      if (route.data) {
        setSelectedFeature({ type: "route", payload: route.data });
      }
    };
    const onEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = "";
    };
    const attach = () => {
      if (!map || typeof map.getLayer !== "function" || !map.getLayer("risk-fill")) return;
      map.on("click", "risk-fill", onClick);
      map.on("mouseenter", "risk-fill", onEnter);
      map.on("mouseleave", "risk-fill", onLeave);
      if (map.getLayer("safe-route-line")) {
        map.on("click", "safe-route-line", onRouteClick);
        map.on("mouseenter", "safe-route-line", onEnter);
        map.on("mouseleave", "safe-route-line", onLeave);
      }
    };
    if (map.isStyleLoaded()) attach();
    else map.once("load", attach);
    return () => {
      try {
        if (!map || typeof map.getLayer !== "function") return;
        if (map.getLayer("risk-fill")) {
          map.off("click", "risk-fill", onClick);
          map.off("mouseenter", "risk-fill", onEnter);
          map.off("mouseleave", "risk-fill", onLeave);
        }
        if (map.getLayer("safe-route-line")) {
          map.off("click", "safe-route-line", onRouteClick);
          map.off("mouseenter", "safe-route-line", onEnter);
          map.off("mouseleave", "safe-route-line", onLeave);
        }
      } catch {
        // Ignore teardown races while MapLibre is removing the map instance.
      }
    };
  }, [selectCell, grid.data, route.data, setSelectedFeature]);

  return (
    <div className="map-stage">
      <div className="map-root" ref={containerRef} />
      <RiskLegend layers={layers} onChange={setLayers} />
      <CursorHud />
      {(simulation.active || simulation.rainfallDelta > 0) && (
        <div className="sim-banner">SIMULATION — NOT AN OFFICIAL WARNING</div>
      )}
      {replay.active && !simulation.active && (
        <div className="sim-banner">HISTORICAL REPLAY — NOT AN OFFICIAL WARNING</div>
      )}
    </div>
  );
}

function CursorHud() {
  const { cursor, selectedRoad } = useOps();
  return (
    <div className="coords">
      {cursor
        ? `${cursor.lat.toFixed(4)}°N  ${cursor.lon.toFixed(4)}°E`
        : "Move cursor for coordinates"}
      {selectedRoad ? ` · ${selectedRoad.name}` : ""}
    </div>
  );
}

function ensureSources(map) {
  if (!map || typeof map.getSource !== "function" || typeof map.getLayer !== "function") return;
  const sources = [
    "risk-grid",
    "primary-route",
    "alternate-route",
    "safe-route",
    "route-waypoints",
    "reports",
    "clusters",
  ];
  sources.forEach((id) => {
    if (!map.getSource(id)) {
      map.addSource(id, { type: "geojson", data: emptyFC() });
    }
  });

  if (!map.getLayer("risk-fill")) {
    map.addLayer({
      id: "risk-fill",
      type: "fill",
      source: "risk-grid",
      paint: {
        "fill-color": [
          "case",
          ["<", ["coalesce", ["get", "probability"], 0], 0.2],
          "#10b981", // LOW Risk - Emerald
          ["<=", ["coalesce", ["get", "probability"], 0], 0.5],
          "#f59e0b", // MODERATE Risk - Amber
          ["<=", ["coalesce", ["get", "probability"], 0], 0.8],
          "#f97316", // HIGH Risk - Orange
          "#ef4444", // CRITICAL Risk - Red
        ],
        "fill-opacity": 0.48,
      },
    });
  }

  if (!map.getLayer("risk-fill-highlight")) {
    map.addLayer({
      id: "risk-fill-highlight",
      type: "line",
      source: "risk-grid",
      paint: {
        "line-color": "#ffffff",
        "line-width": 3.5,
        "line-opacity": 0.95,
      },
      filter: ["==", ["get", "id"], -1],
    });
  }

  if (!map.getLayer("risk-line")) {
    map.addLayer({
      id: "risk-line",
      type: "line",
      source: "risk-grid",
      paint: { "line-color": "#0f172a", "line-width": 0.8, "line-opacity": 0.6 },
    });
  }

  // Primary Blocked Highway Line - Casing & Dashed Line
  if (!map.getLayer("primary-line-casing")) {
    map.addLayer({
      id: "primary-line-casing",
      type: "line",
      source: "primary-route",
      paint: { "line-color": "#450a0a", "line-width": 7, "line-opacity": 0.85 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }

  if (!map.getLayer("primary-line")) {
    map.addLayer({
      id: "primary-line",
      type: "line",
      source: "primary-route",
      paint: { "line-color": "#ef4444", "line-width": 4, "line-dasharray": [2, 2] },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }

  // Safe Alternate Route Line - Glowing Emerald Casing + Core Line + Flow Accent
  if (!map.getLayer("safe-route-casing")) {
    map.addLayer({
      id: "safe-route-casing",
      type: "line",
      source: "safe-route",
      paint: { "line-color": "#042f2e", "line-width": 10, "line-opacity": 0.9 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }

  if (!map.getLayer("safe-route-line")) {
    map.addLayer({
      id: "safe-route-line",
      type: "line",
      source: "safe-route",
      paint: { "line-color": "#10b981", "line-width": 6, "line-opacity": 1.0 },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }

  if (!map.getLayer("safe-route-flow")) {
    map.addLayer({
      id: "safe-route-flow",
      type: "line",
      source: "safe-route",
      paint: { "line-color": "#a7f3d0", "line-width": 2, "line-dasharray": [1, 3] },
      layout: { "line-cap": "round", "line-join": "round" },
    });
  }

  // Safe Route Waypoints (Origin & Destination)
  if (!map.getLayer("waypoints-circle")) {
    map.addLayer({
      id: "waypoints-circle",
      type: "circle",
      source: "route-waypoints",
      paint: {
        "circle-radius": 8,
        "circle-color": [
          "case",
          ["==", ["get", "type"], "start"],
          "#10b981",
          "#3b82f6",
        ],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2.5,
      },
    });
  }

  if (!map.getLayer("waypoints-label")) {
    map.addLayer({
      id: "waypoints-label",
      type: "symbol",
      source: "route-waypoints",
      layout: {
        "text-field": ["get", "label"],
        "text-size": 11,
        "text-offset": [0, 1.4],
        "text-anchor": "top",
      },
      paint: {
        "text-color": "#ffffff",
        "text-halo-color": "#090d16",
        "text-halo-width": 2,
      },
    });
  }

  if (!map.getLayer("reports-circle")) {
    map.addLayer({
      id: "reports-circle",
      type: "circle",
      source: "reports",
      paint: {
        "circle-radius": 6,
        "circle-color": "#f59e0b",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
      },
    });
  }

  if (!map.getLayer("clusters-circle")) {
    map.addLayer({
      id: "clusters-circle",
      type: "circle",
      source: "clusters",
      paint: {
        "circle-radius": ["+", 10, ["*", ["get", "count"], 1.5]],
        "circle-color": "#dc2626",
        "circle-opacity": 0.35,
        "circle-stroke-color": "#dc2626",
        "circle-stroke-width": 2,
      },
    });
  }

  if (!map.getLayer("clusters-label")) {
    map.addLayer({
      id: "clusters-label",
      type: "symbol",
      source: "clusters",
      layout: {
        "text-field": ["to-string", ["get", "count"]],
        "text-size": 11,
      },
      paint: { "text-color": "#ffffff" },
    });
  }
}

function setGeoJSON(map, id, data) {
  const source = map.getSource(id);
  if (source) source.setData(data);
}

function setLayerVisibility(map, id, visible) {
  if (!map || typeof map.getLayer !== "function") return;
  if (map.getLayer(id)) {
    map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  }
}

function emptyFC() {
  return { type: "FeatureCollection", features: [] };
}

function normalizeRouteFeature(route) {
  if (!route) return emptyFC();
  if (route.type === "FeatureCollection") return route;
  if (route.type === "Feature") return { type: "FeatureCollection", features: [route] };
  if (Array.isArray(route) && route.length && Array.isArray(route[0])) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Safe route" },
          geometry: { type: "LineString", coordinates: route },
        },
      ],
    };
  }
  if (route.geometry) return { type: "FeatureCollection", features: [route] };
  if (route.active_route) return normalizeRouteFeature(route.active_route);
  return emptyFC();
}

function waypointsToFC(routeData) {
  if (!routeData) return emptyFC();
  const features = [];
  if (routeData.waypoints?.start?.coords) {
    features.push({
      type: "Feature",
      properties: { label: routeData.waypoints.start.name || "ORIGIN", type: "start" },
      geometry: { type: "Point", coordinates: routeData.waypoints.start.coords },
    });
  }
  if (routeData.waypoints?.end?.coords) {
    features.push({
      type: "Feature",
      properties: { label: routeData.waypoints.end.name || "DESTINATION", type: "end" },
      geometry: { type: "Point", coordinates: routeData.waypoints.end.coords },
    });
  }
  return { type: "FeatureCollection", features };
}

function reportsToFC(reports) {
  return {
    type: "FeatureCollection",
    features: (reports || [])
      .filter((r) => r.lat != null && r.lon != null)
      .map((r) => ({
        type: "Feature",
        properties: { id: r.id, report_type: r.report_type },
        geometry: { type: "Point", coordinates: [r.lon, r.lat] },
      })),
  };
}

function clustersToFC(clusters) {
  return {
    type: "FeatureCollection",
    features: (clusters || []).map((c) => ({
      type: "Feature",
      properties: { key: c.key, count: c.count },
      geometry: { type: "Point", coordinates: [c.lon, c.lat] },
    })),
  };
}

export function describeCell(feature) {
  const p = feature?.properties?.probability;
  return `${classifyProbability(p)} · ${formatPct(p)}`;
}
