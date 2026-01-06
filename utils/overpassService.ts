// Overpass API service
// Provides a function to search for water features (lakes, rivers, ponds, reservoirs, water bodies)
// near a given lat/lon within a radius (meters).

export type WaterFeature = {
  id: string; // osm id with type prefix (n|w|r)
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  name?: string;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
  fishSpecies?: FishSpecies[]; // Optional fish species data
};

const DEFAULT_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Simple fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Retry helper
async function retry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 500): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// Build Overpass QL query for common water features
function buildOverpassQuery(lat: number, lon: number, radiusMeters: number) {
  return `
    [out:json][timeout:25];
    (
      way(around:${radiusMeters},${lat},${lon})
        ["natural"="water"]
        ["water"="lake"];
      relation(around:${radiusMeters},${lat},${lon})
        ["natural"="water"]
        ["water"="lake"];

    );
    out center tags;
  `;
}
//Before
      // way(around:${radiusMeters},${lat},${lon})
      //   ["water"="reservoir"];
      // relation(around:${radiusMeters},${lat},${lon})
      //   ["water"="reservoir"];

      // way(around:${radiusMeters},${lat},${lon})
      //   ["water"="pond"];
      // relation(around:${radiusMeters},${lat},${lon})
      //   ["water"="pond"];

function parseOverpassElement(el: any): WaterFeature | null {
  if (!el || !el.type || !el.id) return null;

  const osmType = el.type as 'node' | 'way' | 'relation';
  const osmId = el.id as number;
  let center: { lat: number; lon: number } | undefined;

  if (osmType === 'node' && typeof el.lat === 'number' && typeof el.lon === 'number') {
    center = { lat: el.lat, lon: el.lon };
  } else if (el.center && typeof el.center.lat === 'number' && typeof el.center.lon === 'number') {
    center = { lat: el.center.lat, lon: el.center.lon };
  } else if (el.type && el.geometry && Array.isArray(el.geometry) && el.geometry.length > 0) {
    // fallback: take first geometry point
    const g = el.geometry[0];
    if (g && typeof g.lat === 'number' && typeof g.lon === 'number') center = { lat: g.lat, lon: g.lon };
  }

  const tags = (el.tags && typeof el.tags === 'object') ? el.tags : {};

  return {
    id: `${osmType[0]}${osmId}`,
    osmType,
    osmId,
    name: tags.name,
    center,
    tags,
  };
}

function isFishableLake(feature: WaterFeature): boolean {
  const t = feature.tags;

  const isLakeLike =
    t.water === 'lake' ||
    t.water === 'reservoir' ||
    t.water === 'pond' ||
    (t.natural === 'water' && !t.amenity);

  if (!isLakeLike) return false;

  if (
    t.amenity === 'fountain' ||
    t.man_made === 'basin' ||
    t.natural === 'spring'
  ) {
    return false;
  }

  return true;
}



/**
 * Search for water features near a location using the Overpass API.
 * @param lat latitude in decimal degrees
 * @param lon longitude in decimal degrees
 * @param radiusMeters search radius in meters (default 5000)
 * @param overpassUrl optional Overpass endpoint
 */
export async function searchWaterFeatures(
  lat: number,
  lon: number,
  radiusMeters = 5000, 
  overpassUrl = DEFAULT_OVERPASS_URL,
): Promise<WaterFeature[]> {
  if (typeof fetch === 'undefined') throw new Error('fetch is not available in this environment');

  const q = buildOverpassQuery(lat, lon, radiusMeters);

  const body = new URLSearchParams({ data: q }).toString();

  const res = await retry(
    () => fetchWithTimeout(overpassUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }, 15_000),
    3,
    800,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Overpass API error: ${res.status} ${res.statusText} ${text}`);
  }

  const json = await res.json().catch((e) => { throw new Error('Failed to parse Overpass response JSON: ' + String(e)); });

  if (!json.elements || !Array.isArray(json.elements)) return [];

  const results: WaterFeature[] = [];
  const seen = new Set<string>();

  for (const el of json.elements) {
    const parsed = parseOverpassElement(el);
    if (!parsed) continue;
    // dedupe by id
    if (seen.has(parsed.id)) continue;
    seen.add(parsed.id);
    results.push(parsed);
  }

  return results.filter(isFishableLake);
}
interface OverpassElement{
    type: 'node' | 'way' | 'relation';
    id: number;
    lat?: number;
    lon?: number;
    tags?: { [key: string]: string };
    nodes?: number[];
    members?: Array<{
        type: 'node' | 'way' | 'relation';
        ref: number;
        role: string;
    }>;
}

// New Type for the iNaturalist Fish Data
export type FishSpecies = {
  id: number;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  observationCount: number;
  wikipediaUrl?: string;
};

/**
 * Fetches fish species observed near a specific water feature.
 * @param lat Latitude of the lake center
 * @param lon Longitude of the lake center
 * @param radiusKm Search radius (default 3km)
 */
export async function fetchFishSpecies(
  lat: number,
  lon: number,
  radiusKm = 3
): Promise<FishSpecies[]> {
  // NEW FILTERS ADDED: quality_grade and identifications
  const url = `https://api.inaturalist.org/v1/observations/species_counts?` + 
              `lat=${lat}&lng=${lon}&radius=${radiusKm}` +
              `&taxon_id=47178` +           // Ray-finned fishes
              `&quality_grade=research` +    // ONLY verified experts
              `&identifications=most_agree` + // High community agreement
              `&per_page=15`;               // Focus on the top species

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('iNaturalist API error');

    const json = await res.json();

    return json.results.map((item: any) => ({
      id: item.taxon.id,
      commonName: item.taxon.preferred_common_name || item.taxon.name,
      scientificName: item.taxon.name,
      imageUrl: item.taxon.default_photo?.medium_url || '',
      observationCount: item.count,
      wikipediaUrl: item.taxon.wikipedia_url,
    }));
  } catch (error) {
    console.error("Failed to fetch fish species:", error);
    return [];
  }
}

/**
 * Fetches fish species for a specific lake using its center coordinates.
 * @param lake The water feature (lake) to get fish species for
 * @param radiusKm Search radius in km (default 10)
 */
export async function getFishForLake(
  lake: WaterFeature,
  radiusKm = 3
): Promise<FishSpecies[]> {
  if (!lake.center) {
    console.warn("Lake has no center coordinates, cannot fetch fish species");
    return [];
  }
  return fetchFishSpecies(lake.center.lat, lake.center.lon, radiusKm);
}

export default { searchWaterFeatures, fetchFishSpecies, getFishForLake };