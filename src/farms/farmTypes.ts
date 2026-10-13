// ============================================================
// SalinO-Crop — Farm Data Model
// Persistence: localStorage (frontend-only prototype)
// All farm data is local to the user's browser session.
// ============================================================

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [lng, lat] pairs per GeoJSON spec
}

export type AreaUnit = 'bigha' | 'hectare' | 'acre' | 'decimal';
export type SurveyType = 'CS' | 'SA' | 'RS' | 'BS/BRS' | 'Unknown';

export interface Farm {
  id: string;
  name: string;

  // Administrative
  district: string;
  upazila: string;
  village: string;
  mouzaName?: string;
  jlNumber?: string;
  dagNumber?: string;
  khatianNumber?: string;
  surveyType?: SurveyType;

  // Geometry
  polygonGeometry?: GeoJsonPolygon;
  centroidLatitude?: number;
  centroidLongitude?: number;

  // Area
  estimatedArea?: number;   // Calculated from polygon (geodesic)
  estimatedAreaUnit: AreaUnit;
  recordedArea?: number;    // Farmer-reported / official record
  recordedAreaUnit?: AreaUnit;
  perimeterMeters?: number;

  // Agronomic
  primaryCrop?: string;
  soilSalinityEC?: number;  // dS/m — user-provided, not measured
  notes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ─── Geodesic area calculation (Shoelace on sphere) ─────────────────────────
// Uses the spherical excess formula — accurate for small polygons
const EARTH_RADIUS_M = 6378137;

function toRad(deg: number) { return deg * (Math.PI / 180); }

export function calcGeodesicAreaM2(coords: [number, number][]): number {
  // coords = [[lng, lat], ...]
  if (coords.length < 3) return 0;
  const n = coords.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[j];
    area += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  area = Math.abs(area * EARTH_RADIUS_M * EARTH_RADIUS_M / 2);
  return area;
}

export function calcPerimeterM(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[j];
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    total += 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
  }
  return total;
}

export function convertArea(m2: number, unit: AreaUnit): number {
  switch (unit) {
    case 'hectare': return m2 / 10000;
    case 'acre':    return m2 / 4046.856;
    case 'decimal': return m2 / 40.4686;   // 1 decimal (shatak) ≈ 40.47 m²
    case 'bigha':   return m2 / 1338.0;    // 1 bigha (BD) ≈ 1338 m² (0.33 acre)
    default:        return m2;
  }
}

export function fmtArea(m2: number, unit: AreaUnit): string {
  const v = convertArea(m2, unit);
  return `${v.toFixed(2)} ${unit}`;
}
