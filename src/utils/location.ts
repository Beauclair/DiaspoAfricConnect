import * as Location from 'expo-location';

/** Request foreground location permission and return the user's current coordinates, or null. */
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.LocationAccuracy.Balanced,
  });
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
}

/** Geocode an address string into coordinates. Returns null on failure.
 *  Retries with a simplified address (city + state) when the full address fails. */
export async function geocodeAddress(
  address: string,
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await Location.geocodeAsync(address);
    if (results.length > 0) {
      return { latitude: results[0].latitude, longitude: results[0].longitude };
    }
  } catch {
    // Full address geocoding failed — try simplified version below
  }

  // Retry with a simplified address: extract city + state from "street, city, state zip"
  try {
    const parts = address.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      const simplified = parts.slice(1).join(', '); // drop street, keep city/state/zip
      const retry = await Location.geocodeAsync(simplified);
      if (retry.length > 0) {
        return { latitude: retry[0].latitude, longitude: retry[0].longitude };
      }
    }
  } catch {
    // Simplified geocoding also failed
  }

  return null;
}

/**
 * Haversine distance between two lat/lon points (in kilometres).
 * Returns Infinity when either point is obviously invalid (0, 0).
 */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if ((lat2 === 0 && lon2 === 0) || (lat1 === 0 && lon1 === 0)) return Infinity;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Format a distance for display: "1.2 km" or "350 m". */
export function formatDistance(km: number): string {
  if (!isFinite(km)) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
