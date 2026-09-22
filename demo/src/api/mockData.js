export const MOCK_REGIONS = [
  {
    id: 1,
    state: "Meghalaya & Assam",
    corridor_name: "NH6 Guwahati - Nongpoh - Shillong Corridor",
    code: "NH6-GHY-SHL",
    center_lon: 91.85,
    center_lat: 25.85,
    total_length_km: 98.4,
    high_risk_cells_count: 14,
    status: "CRITICAL_ALERT",
  },
  {
    id: 2,
    state: "Arunachal Pradesh",
    corridor_name: "NH13 Itanagar - Pasighat Highway",
    code: "NH13-ITN-PSG",
    center_lon: 93.70,
    center_lat: 27.15,
    total_length_km: 142.0,
    high_risk_cells_count: 9,
    status: "WARNING",
  },
  {
    id: 3,
    state: "Sikkim",
    corridor_name: "NH10 Siliguri - Teesta - Gangtok Corridor",
    code: "NH10-SLG-GTK",
    center_lon: 88.55,
    center_lat: 27.25,
    total_length_km: 114.5,
    high_risk_cells_count: 18,
    status: "HIGH_ALERT",
  },
];

export function getMockGrid(regionId = 1, rainfallDelta = 0) {
  const region = MOCK_REGIONS.find((r) => r.id === Number(regionId)) || MOCK_REGIONS[0];
  const centerLon = region.center_lon;
  const centerLat = region.center_lat;

  const rows = 6;
  const cols = 7;
  const stepLon = 0.05;
  const stepLat = 0.04;
  const startLon = centerLon - (cols / 2) * stepLon;
  const startLat = centerLat - (rows / 2) * stepLat;

  const features = [];
  let idCounter = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const minLon = Number((startLon + c * stepLon).toFixed(4));
      const maxLon = Number((minLon + stepLon).toFixed(4));
      const minLat = Number((startLat + r * stepLat).toFixed(4));
      const maxLat = Number((minLat + stepLat).toFixed(4));

      const distFromCenter = Math.sqrt((c - 3) ** 2 + (r - 2.5) ** 2);
      const baseProb = Math.min(0.92, Math.max(0.06, 0.78 - distFromCenter * 0.16 + ((r * 13 + c * 7) % 10) * 0.03));
      const deltaFactor = Math.min(0.35, (rainfallDelta / 200) * 0.3);
      const prob = Number(Math.min(0.98, Math.max(0.04, baseProb + deltaFactor)).toFixed(2));

      features.push({
        type: "Feature",
        id: idCounter,
        properties: {
          id: idCounter,
          cell_code: `GRID-${region.code}-${idCounter}`,
          probability: prob,
          slope_deg: 18 + ((r * 5 + c * 3) % 25),
          rainfall_72h_mm: Math.round(140 + rainfallDelta + ((r * 17 + c * 9) % 180)),
          elevation_m: 320 + r * 180 + c * 60,
          soil_moisture_pct: Math.min(98, 55 + Math.round(prob * 40)),
          twi: Number((5.2 + ((r + c) % 6) * 1.1).toFixed(1)),
          geology: r % 2 === 0 ? "Weathered Sandstone & Shale" : "Phyllites & Gneissic Debris",
          landuse: c % 2 === 0 ? "Steep Reserve Forest" : "Hillside Transport Corridor",
          top_factors: [
            { feature: "rainfall_72h", contribution: 0.42, is_positive_driver: true },
            { feature: "slope", contribution: 0.31, is_positive_driver: true },
            { feature: "soil_moisture", contribution: 0.18, is_positive_driver: true },
          ],
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [minLon, minLat],
              [maxLon, minLat],
              [maxLon, maxLat],
              [minLon, maxLat],
              [minLon, minLat],
            ],
          ],
        },
      });
      idCounter++;
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export function getMockSafeRoute(regionId = 1) {
  const regId = Number(regionId);

  if (regId === 2) {
    return {
      corridor: "NH13 Trans-Arunachal Corridor (Itanagar to Pasighat)",
      status: "Alternate Safe Route Active",
      is_primary_blocked: true,
      distance_km: 148.5,
      estimated_time_min: 195,
      avoided_segment: "Km 78-84 (Nirjuli Debris Slide Zone)",
      center: [93.70, 27.15],
      primary_route: {
        type: "Feature",
        properties: { name: "Primary Route (NH13)", status: "BLOCKED", hazard_type: "Active Landslide" },
        geometry: {
          type: "LineString",
          coordinates: [
            [93.52, 27.05],
            [93.62, 27.10],
            [93.70, 27.15],
            [93.78, 27.20],
            [93.88, 27.25],
          ],
        },
      },
      alternate_route: {
        type: "Feature",
        properties: { name: "Safe Bypass Corridor (Subansiri Ridge)", status: "CLEAR", safety_score: "94%" },
        geometry: {
          type: "LineString",
          coordinates: [
            [93.52, 27.05],
            [93.56, 27.14],
            [93.65, 27.22],
            [93.76, 27.26],
            [93.88, 27.25],
          ],
        },
      },
      waypoints: {
        start: { name: "Itanagar Hub", coords: [93.52, 27.05] },
        end: { name: "Pasighat Junction", coords: [93.88, 27.25] },
      },
    };
  }

  if (regId === 3) {
    return {
      corridor: "NH10 Siliguri - Teesta - Gangtok Corridor",
      status: "Alternate Safe Route Active",
      is_primary_blocked: true,
      distance_km: 112.0,
      estimated_time_min: 160,
      avoided_segment: "Km 29-34 (Teesta Bazaar Gorge Slide)",
      center: [88.55, 27.25],
      primary_route: {
        type: "Feature",
        properties: { name: "Primary Route (NH10 Teesta Valley)", status: "BLOCKED", hazard_type: "Rockfall & Erosion" },
        geometry: {
          type: "LineString",
          coordinates: [
            [88.43, 26.90],
            [88.49, 27.02],
            [88.54, 27.15],
            [88.58, 27.26],
            [88.61, 27.33],
          ],
        },
      },
      alternate_route: {
        type: "Feature",
        properties: { name: "Safe Alternate Route (Pakyong Ridge Expressway)", status: "CLEAR", safety_score: "92%" },
        geometry: {
          type: "LineString",
          coordinates: [
            [88.43, 26.90],
            [88.52, 26.96],
            [88.62, 27.10],
            [88.65, 27.24],
            [88.61, 27.33],
          ],
        },
      },
      waypoints: {
        start: { name: "Sevoke Checkpost", coords: [88.43, 26.90] },
        end: { name: "Gangtok Transit Hub", coords: [88.61, 27.33] },
      },
    };
  }

  return {
    corridor: "NH6 Guwahati - Nongpoh - Shillong Corridor",
    status: "Alternate Safe Route Active (Primary Blocked)",
    is_primary_blocked: true,
    distance_km: 98.4,
    estimated_time_min: 135,
    avoided_segment: "Km 42-47 (Nongpoh Debris & Slope Failure Zone)",
    center: [91.85, 25.85],
    primary_route: {
      type: "Feature",
      properties: { name: "Primary Highway (NH6 Nongpoh Sector)", status: "BLOCKED", hazard_type: "Active Debris Flow" },
      geometry: {
        type: "LineString",
        coordinates: [
          [91.7362, 26.1861],
          [91.7850, 26.0800],
          [91.8420, 25.9500],
          [91.8790, 25.8500],
          [91.8650, 25.7200],
          [91.8833, 25.5788],
        ],
      },
    },
    alternate_route: {
      type: "Feature",
      properties: { name: "Safe Alternate Route (Umsning - Shillong Expressway Bypass)", status: "CLEAR", safety_score: "96%" },
      geometry: {
        type: "LineString",
        coordinates: [
          [91.7362, 26.1861],
          [91.6750, 26.1100],
          [91.7120, 25.9700],
          [91.7750, 25.8400],
          [91.8380, 25.7000],
          [91.8833, 25.5788],
        ],
      },
    },
    waypoints: {
      start: { name: "Guwahati Transport Hub", coords: [91.7362, 26.1861] },
      end: { name: "Shillong Civil Terminal", coords: [91.8833, 25.5788] },
    },
  };
}

export function getMockWeather(regionId = 1) {
  return {
    region_id: Number(regionId),
    rainfall_1h: 18.5,
    rainfall_24h: 88.5,
    rainfall_72h: 245.0,
    soil_moisture: "88%",
    temperature_c: 21.4,
    humidity_pct: 91,
    wind_speed_kmh: 18.2,
    condition: "Heavy Monsoon Downpour",
    alert_level: "ORANGE",
    updated_at: new Date().toISOString(),
  };
}

export function getMockRoads(regionId = 1) {
  return {
    region_id: Number(regionId),
    impacted_segments: [
      {
        id: 101,
        name: "NH6 Nongpoh Hill Sector",
        highway_class: "National Highway (NH6)",
        affected_segment: "Km 42 - Km 46 (Debris Slide Zone)",
        risk_level: "CRITICAL",
        status: "BLOCKED",
        speed_limit_kmh: 0,
        description: "Active mudslide blocking both carriageways. Clearance crew dispatched.",
      },
      {
        id: 102,
        name: "NH6 Umsning Pass",
        highway_class: "National Highway (NH6)",
        affected_segment: "Km 64 - Km 70 (Subsidence Zone)",
        risk_level: "HIGH",
        status: "RESTRICTED",
        speed_limit_kmh: 25,
        description: "Single lane controlled traffic due to shoulder subsidence.",
      },
      {
        id: 103,
        name: "Umsning Expressway Safe Bypass",
        highway_class: "State Expressway Bypass",
        affected_segment: "Km 0 - Km 32 (Safe Routing Corridor)",
        risk_level: "LOW",
        status: "CLEAR",
        speed_limit_kmh: 65,
        description: "Fully open safe alternate routing corridor.",
      },
    ],
  };
}

export function getMockReports(regionId = 1) {
  const regId = Number(regionId);
  const region = MOCK_REGIONS.find((r) => r.id === regId) || MOCK_REGIONS[0];
  const cLon = region.center_lon;
  const cLat = region.center_lat;

  return [
    {
      id: 501,
      report_type: "Landslide",
      severity: "CRITICAL",
      lon: cLon + 0.02,
      lat: cLat + 0.03,
      comment: "Large rock boulders sliding down slope onto highway carriageway.",
      reported_at: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: 502,
      report_type: "Rockfall",
      severity: "HIGH",
      lon: cLon - 0.04,
      lat: cLat - 0.02,
      comment: "Fallen tree and rock debris obstructing left lane.",
      reported_at: new Date(Date.now() - 75 * 60000).toISOString(),
    },
    {
      id: 503,
      report_type: "Waterlogging",
      severity: "MODERATE",
      lon: cLon + 0.05,
      lat: cLat - 0.05,
      comment: "Water accumulation on culvert approach road.",
      reported_at: new Date(Date.now() - 140 * 60000).toISOString(),
    },
    {
      id: 504,
      report_type: "Road Crack",
      severity: "HIGH",
      lon: cLon - 0.02,
      lat: cLat + 0.06,
      comment: "15cm wide longitudinal tension crack appearing along outer embankment.",
      reported_at: new Date(Date.now() - 210 * 60000).toISOString(),
    },
  ];
}

export function getMockAlerts() {
  const now = new Date().toISOString();
  return [
    {
      id: "ALT-2026-001",
      severity_tier: "CRITICAL",
      audience_tier: "Authority & SDRF",
      channel: "SDRF Dispatch & Highway Police",
      message_payload: "CRITICAL LANDSLIDE WARNING: Heavy 72h rainfall (245mm) exceeded triggering threshold at NH6 Nongpoh Sector. Activate traffic diversion.",
      sent_at: now,
    },
    {
      id: "ALT-2026-002",
      severity_tier: "HIGH",
      audience_tier: "Public Transport",
      channel: "Cell Broadcast & Radio Advisory",
      message_payload: "TRAFFIC ADVISORY: NH6 Nongpoh primary corridor blocked. Reroute via Umsning Expressway Safe Bypass Corridor.",
      sent_at: now,
    },
  ];
}

export function getMockHistory() {
  return {
    corridor: "NH6 Guwahati to Shillong Corridor",
    frames: [
      { timestamp: "T-6h", risk_modifier: 0.15, summary: "Initial rainfall onset, low soil moisture" },
      { timestamp: "T-4h", risk_modifier: 0.45, summary: "Sustained downpour, moderate runoff" },
      { timestamp: "T-2h", risk_modifier: 0.85, summary: "Threshold exceeded, slope instability triggered" },
      { timestamp: "Current", risk_modifier: 1.0, summary: "Active slide event on primary highway corridor" },
    ],
  };
}

export function getMockPointRisk(lat, lon) {
  return {
    lat,
    lon,
    probability: 0.76,
    classification: "HIGH",
    factors: [
      { feature: "rainfall_72h", value: "245 mm", contribution: 0.45, is_positive_driver: true },
      { feature: "slope", value: "32°", contribution: 0.32, is_positive_driver: true },
      { feature: "soil_moisture", value: "88%", contribution: 0.18, is_positive_driver: true },
    ],
    recommendation: "Avoid heavy traffic; maintain active monitoring on adjacent culverts.",
  };
}
