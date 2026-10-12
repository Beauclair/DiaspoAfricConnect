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

/**
 * Geocode using the free OpenStreetMap Nominatim API (structured search).
 * Passing address components separately gives much more accurate results
 * than free-form search — avoids "address range" matches.
 */
async function geocodeWithNominatimStructured(
  street: string,
  city: string,
  state: string,
  postalcode: string,
  country = 'US',
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const params = new URLSearchParams({
      street,
      city,
      state,
      postalcode,
      country,
      format: 'json',
      limit: '1',
    });
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          'User-Agent': 'DiaspoAfricConnect/1.0',
          Accept: 'application/json',
        },
      },
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch {
    // Nominatim structured request failed
  }
  return null;
}

/**
 * Geocode using the free OpenStreetMap Nominatim API (free-form search).
 * Works on all devices regardless of Google Play Services.
 */
async function geocodeWithNominatim(
  address: string,
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const encoded = encodeURIComponent(address);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'DiaspoAfricConnect/1.0',
          Accept: 'application/json',
        },
      },
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch {
    // Nominatim request failed
  }
  return null;
}

export interface StructuredAddress {
  street: string;
  city: string;
  state: string;
  postalcode: string;
  country?: string;
}

/**
 * Geocode an address. Accepts either a plain string (legacy) or structured
 * address fields. Structured fields give significantly more accurate results
 * because Nominatim can match each component independently.
 */
export async function geocodeAddress(
  addressOrFields: string | StructuredAddress,
): Promise<{ latitude: number; longitude: number } | null> {
  const isStructured = typeof addressOrFields !== 'string';

  // Build a single-line address for device geocoder / free-form fallback
  const fullAddress = isStructured
    ? `${addressOrFields.street}, ${addressOrFields.city}, ${addressOrFields.state} ${addressOrFields.postalcode}`
    : addressOrFields;

  // 1. If structured, try Nominatim structured search first (most accurate)
  if (isStructured) {
    const structured = await geocodeWithNominatimStructured(
      addressOrFields.street,
      addressOrFields.city,
      addressOrFields.state,
      addressOrFields.postalcode,
      addressOrFields.country ?? 'US',
    );
    if (structured) return structured;
  }

  // 2. Try device geocoder (fast but unreliable on some Android devices)
  try {
    const results = await Location.geocodeAsync(fullAddress);
    if (results.length > 0) {
      return { latitude: results[0].latitude, longitude: results[0].longitude };
    }
  } catch {
    // Device geocoding failed
  }

  // 3. Fallback to Nominatim free-form search
  const nominatimResult = await geocodeWithNominatim(fullAddress);
  if (nominatimResult) return nominatimResult;

  // 4. Retry with simplified address: drop street, keep city/state/zip
  const parts = fullAddress.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    const simplified = parts.slice(1).join(', ');

    try {
      const retry = await Location.geocodeAsync(simplified);
      if (retry.length > 0) {
        return { latitude: retry[0].latitude, longitude: retry[0].longitude };
      }
    } catch {
      // Device simplified geocoding failed
    }

    const nominatimRetry = await geocodeWithNominatim(simplified);
    if (nominatimRetry) return nominatimRetry;
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

const KM_TO_MILES = 0.621371;

/** Format a distance for display, using miles (US/UK) or km based on useMiles flag. */
export function formatDistance(km: number, useMiles = false): string {
  if (!isFinite(km)) return '';
  if (useMiles) {
    const miles = km * KM_TO_MILES;
    return miles < 0.1 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
