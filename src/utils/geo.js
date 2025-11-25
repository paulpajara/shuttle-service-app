function toRad(deg) {
  return deg * Math.PI / 180;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat/2);
  const sinDLon = Math.sin(dLon/2);

  const h = sinDLat*sinDLat + sinDLon*sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  return R * c;
}

function estimateEtaTimestamp(from, to, avgSpeedKmH = 20) {
  const distanceKm = haversineKm(from, to);
  const hours = distanceKm / avgSpeedKmH;
  const etaMs = Date.now() + Math.round(hours * 3600 * 1000);
  return new Date(etaMs);
}

module.exports = { haversineKm, estimateEtaTimestamp };
