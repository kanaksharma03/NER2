export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function clusterReports(reports, radiusM = 300) {
  const clusters = [];
  const assigned = new Set();
  (reports || []).forEach((report, index) => {
    if (assigned.has(index) || report.lat == null || report.lon == null) return;
    const members = [report];
    assigned.add(index);
    reports.forEach((other, j) => {
      if (assigned.has(j) || other.lat == null || other.lon == null) return;
      const dist = haversineMeters(
        { lat: report.lat, lon: report.lon },
        { lat: other.lat, lon: other.lon }
      );
      if (dist <= radiusM) {
        members.push(other);
        assigned.add(j);
      }
    });
    const lat = members.reduce((s, r) => s + r.lat, 0) / members.length;
    const lon = members.reduce((s, r) => s + r.lon, 0) / members.length;
    clusters.push({
      key: `derived-${report.id ?? index}`,
      lat,
      lon,
      count: members.length,
      types: [...new Set(members.map((m) => m.report_type).filter(Boolean))],
      reports: members,
    });
  });
  return clusters;
}

export function boundsFromGeoJSON(fc) {
  const coords = [];
  (fc?.features || []).forEach((f) => {
    const geom = f.geometry;
    if (!geom) return;
    if (geom.type === "Polygon") {
      geom.coordinates[0]?.forEach((c) => coords.push(c));
    } else if (geom.type === "LineString") {
      geom.coordinates.forEach((c) => coords.push(c));
    } else if (geom.type === "Point") {
      coords.push(geom.coordinates);
    }
  });
  if (!coords.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  coords.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}
