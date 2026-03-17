/**
 * Haversine formula - calculates distance between two coordinates in km
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Find nearest police station from a list
 * @param {number} lat - User latitude
 * @param {number} lon - User longitude
 * @param {Array} stations - Array of station objects with location.coordinates [lon, lat]
 */
const findNearestStation = (lat, lon, stations) => {
  let nearest = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const [stLon, stLat] = station.location.coordinates;
    const distance = calculateDistance(lat, lon, stLat, stLon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { station, distance: Math.round(distance * 100) / 100 };
    }
  }
  return nearest;
};

module.exports = { calculateDistance, findNearestStation };
