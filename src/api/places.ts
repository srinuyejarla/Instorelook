export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  source: 'OpenStreetMap';
  directionsUrl: string;
}

const DEFAULT_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const EARTH_RADIUS_METERS = 6_371_000;

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (value: number) => value * Math.PI / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function formatAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ') || 'Address not listed by OpenStreetMap';
}

function category(tags: Record<string, string>): string {
  const shop = tags.shop;
  if (shop === 'clothes') return 'Clothing store';
  if (shop === 'shoes') return 'Shoe store';
  if (shop === 'boutique') return 'Boutique';
  if (shop === 'department_store') return 'Department store';
  if (shop === 'mall') return 'Mall';
  return shop ? shop.replace(/_/g, ' ') : 'Retail store';
}

export async function listNearbyMapPlaces(
  latitude: number,
  longitude: number,
  radiusMeters = 5_000,
): Promise<NearbyPlace[]> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    const error = new Error('A valid latitude and longitude are required');
    Object.assign(error, { status: 400, code: 'INVALID_LOCATION' });
    throw error;
  }

  const radius = Math.min(Math.max(Number(radiusMeters) || 5_000, 500), 25_000);
  const query = `[out:json][timeout:20];(nwr[shop~"^(clothes|boutique|shoes|department_store|mall|fashion)$"](around:${radius},${latitude},${longitude}););out center tags;`;
  const endpoint = process.env.OSM_OVERPASS_URL || DEFAULT_OVERPASS_URL;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'User-Agent': 'InStoreLook/1.0 (nearby store discovery)',
    },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) throw new Error(`Map data provider returned ${response.status}`);

  const payload = await response.json() as { elements?: Array<{ id: number; type?: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> };
  return (payload.elements || []).map((element): NearbyPlace | null => {
    const tags = element.tags || {};
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (lat == null || lon == null) return null;
    const name = text(tags.name) || text(tags['brand']) || 'Unnamed local store';
    const destination = `${lat},${lon}`;
    const landmark = text(tags['addr:suburb']) || text(tags['addr:neighbourhood']) || text(tags['addr:quarter']);
    return {
      id: `osm-${element.type || 'place'}-${element.id}`,
      name,
      category: category(tags),
      address: formatAddress(tags),
      phone: text(tags.phone) || text(tags['contact:phone']),
      website: text(tags.website) || text(tags['contact:website']),
      landmark,
      latitude: lat,
      longitude: lon,
      distanceMeters: Math.round(distanceMeters(latitude, longitude, lat, lon)),
      source: 'OpenStreetMap' as const,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}`,
    } satisfies NearbyPlace;
  }).filter((place): place is NearbyPlace => place !== null)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 50);
}
