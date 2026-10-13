import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from 'leaflet';
import {
  MapPin, Satellite, Map as MapIcon, Undo, Trash2,
  CheckCircle, Info, Navigation, Search, X, AlertTriangle
} from 'lucide-react';
import { calcGeodesicAreaM2, calcPerimeterM, fmtArea } from '../farms/farmTypes';
import type { AreaUnit } from '../farms/farmTypes';

// ─── Map click handler ───────────────────────────────────────────────────────
function ClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

// ─── Fly-to on location search ───────────────────────────────────────────────
function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.2 });
  }, [coords, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ─── Convert [lat,lng] points to GeoJSON [lng,lat] coords ────────────────────
function toGeoCoords(pts: [number, number][]): [number, number][] {
  return pts.map(([lat, lng]) => [lng, lat]);
}

interface Props {
  initialPoints?: [number, number][];
  onComplete: (points: [number, number][]) => void;
}

export default function FarmSelector({ initialPoints = [], onComplete }: Props) {
  const navigate = useNavigate();
  const [points, setPoints] = useState<[number, number][]>(initialPoints);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('bigha');
  const [isSatellite, setIsSatellite] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [validationError, setValidationError] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Derived geometry
  const geoCoords = toGeoCoords(points);
  const areaM2 = points.length >= 3 ? calcGeodesicAreaM2(geoCoords) : 0;
  const perimM  = points.length >= 3 ? calcPerimeterM(geoCoords) : 0;

  // ── Polygon click handler
  const handleMapClick = useCallback((latlng: LatLng) => {
    setPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
    setValidationError('');
  }, []);

  const undo = () => setPoints(p => p.slice(0, -1));
  const clear = () => { setPoints([]); setValidationError(''); };

  // ── Location search (Nominatim with debounce)
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    if (search.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ' Bangladesh')}&format=json&limit=5&countrycodes=bd`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        setSearchResults(data);
      } catch { setSearchResults([]); }
    }, 600);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const selectResult = (r: { lat: string; lon: string; display_name: string }) => {
    const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
    setFlyTo([lat, lng]);
    setSearch(r.display_name.split(',')[0]);
    setSearchResults([]);
  };

  // ── Geolocation
  const useMyLocation = () => {
    setLocating(true); setLocError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setFlyTo([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      err => {
        setLocating(false);
        setLocError(err.code === 1 ? 'Location access denied. Please enable in browser settings.' : 'Unable to get your location.');
      },
      { timeout: 10000 }
    );
  };

  // ── Validation & continue
  const handleContinue = () => {
    if (points.length < 3) {
      setValidationError('Please mark at least 3 points to define your farm boundary.');
      return;
    }
    if (areaM2 < 10) {
      setValidationError('The selected area is too small. Please draw a larger boundary.');
      return;
    }
    setValidationError('');
    onComplete(points);
  };

  // ── Map tiles
  const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const satAttr = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics';
  const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Leaflet polygon expects [[lat,lng]] — already in points
  const leafletPolygon = points;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* ── Top instruction bar */}
      <div style={{
        background: 'linear-gradient(90deg, #0f3b24 0%, #1a5c38 100%)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
        color: '#fff', flexShrink: 0,
      }}>
        <MapPin size={18} color="#6ee7b7" />
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>
          {points.length === 0
            ? 'Click on the map to start marking your farm boundary'
            : points.length < 3
            ? `${points.length} point${points.length > 1 ? 's' : ''} added — add at least ${3 - points.length} more`
            : `${points.length} boundary points — click to add more, or continue below`}
        </span>
        {points.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={undo} title="Undo last point"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, padding: '5px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <Undo size={13} /> Undo
            </button>
            <button onClick={clear} title="Clear all points"
              style={{ background: 'rgba(220,38,38,0.3)', border: '1px solid rgba(220,38,38,0.5)', borderRadius: 7, padding: '5px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <Trash2 size={13} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Main layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── Left panel */}
        <div style={{
          width: 280, flexShrink: 0, background: '#fff',
          borderRight: '1px solid #e5e7eb', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>

          {/* Search */}
          <div style={{ padding: '14px 14px 10px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Search Location</div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 10 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Village, union, upazila..."
                style={{
                  width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              {search && (
                <button onClick={() => { setSearch(''); setSearchResults([]); }}
                  style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div style={{ marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => selectResult(r)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 12px',
                      borderBottom: i < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#374151',
                    }}>
                    <MapPin size={11} color="#0d9488" style={{ marginRight: 5 }} />
                    {r.display_name.split(',').slice(0, 3).join(', ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Locate me */}
          <div style={{ padding: '0 14px 14px' }}>
            <button onClick={useMyLocation} disabled={locating}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1px solid #bbf7d0', background: '#f0fdf4',
                color: '#166534', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: locating ? 0.6 : 1,
              }}>
              <Navigation size={14} />
              {locating ? 'Locating...' : 'Use My Location'}
            </button>
            {locError && <p style={{ fontSize: 11.5, color: '#dc2626', marginTop: 6, lineHeight: 1.5 }}>{locError}</p>}
          </div>

          {/* Map type toggle */}
          <div style={{ padding: '0 14px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Map Style</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ label: 'Satellite', value: true, icon: Satellite }, { label: 'Street', value: false, icon: MapIcon }].map(({ label, value, icon: Icon }) => (
                <button key={label} onClick={() => setIsSatellite(value)}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: isSatellite === value ? '2px solid #1a5c38' : '1px solid #e5e7eb',
                    background: isSatellite === value ? '#f0fdf4' : '#fff',
                    color: isSatellite === value ? '#1a5c38' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ padding: '14px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>How to Draw</div>
            {[
              '1. Search your location or use the map to navigate to your farm',
              '2. Click/tap on the map to place boundary points around your farmland',
              '3. Place at least 3 points to form a polygon',
              '4. The boundary closes automatically when you continue',
              '5. Use Undo to remove the last point, or Clear to start over',
            ].map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: '#4b5563', marginBottom: 6, lineHeight: 1.5 }}>{s}</div>
            ))}
          </div>

          {/* Area info */}
          <div style={{ padding: '14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Farm Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label="Boundary Points" value={`${points.length}`} />
              <Row label="Estimated Area" value={points.length >= 3 ? fmtArea(areaM2, areaUnit) : '—'} highlight />
              <Row label="Perimeter" value={points.length >= 3 ? `${(perimM / 1000).toFixed(3)} km` : '—'} />
            </div>

            {points.length >= 3 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Area Unit</div>
                <select
                  value={areaUnit}
                  onChange={e => setAreaUnit(e.target.value as AreaUnit)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit' }}
                >
                  <option value="bigha">Bigha (BD)</option>
                  <option value="decimal">Decimal / Shatak</option>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                </select>
              </div>
            )}

            <div style={{ marginTop: 12, fontSize: 11, color: '#9ca3af', lineHeight: 1.5, background: '#f9fafb', borderRadius: 6, padding: '8px 10px' }}>
              <Info size={11} style={{ display: 'inline', marginRight: 4 }} />
              Area is estimated from your drawn boundary. This is not an official cadastral measurement.
            </div>
          </div>
        </div>

        {/* ── Map workspace */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[22.38, 89.10]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url={isSatellite ? satUrl : osmUrl}
              attribution={isSatellite ? satAttr : osmAttr}
              maxZoom={19}
            />
            <ClickHandler onClick={handleMapClick} />
            <FlyTo coords={flyTo} />

            {/* Filled polygon */}
            {points.length >= 3 && (
              <Polygon
                positions={leafletPolygon}
                pathOptions={{ color: '#1a5c38', fillColor: '#16a34a', fillOpacity: 0.2, weight: 2.5, dashArray: '6,4' }}
              />
            )}

            {/* Boundary point markers */}
            {points.map(([lat, lng], i) => (
              <CircleMarker
                key={i}
                center={[lat, lng]}
                radius={6}
                pathOptions={{ color: '#fff', fillColor: i === 0 ? '#0f3b24' : '#1a5c38', fillOpacity: 1, weight: 2 }}
              />
            ))}
          </MapContainer>

          {/* Attribution note for satellite */}
          {isSatellite && (
            <div style={{
              position: 'absolute', bottom: 28, right: 8, zIndex: 500,
              background: 'rgba(255,255,255,0.9)', borderRadius: 5, padding: '3px 8px', fontSize: 10, color: '#6b7280',
            }}>
              Imagery © Esri, Maxar — for boundary drawing only
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom action bar */}
      <div style={{
        background: '#fff', borderTop: '1px solid #e5e7eb',
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)}
          style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
          ← Back
        </button>

        {validationError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px' }}>
            <AlertTriangle size={14} /> {validationError}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={points.length < 3}
          style={{
            marginLeft: 'auto', padding: '11px 28px', borderRadius: 10,
            background: points.length >= 3 ? 'linear-gradient(135deg, #1a5c38 0%, #0d9488 100%)' : '#d1d5db',
            color: '#fff', fontWeight: 700, fontSize: 14.5, border: 'none', cursor: points.length >= 3 ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: points.length >= 3 ? '0 4px 14px rgba(26,92,56,0.3)' : 'none',
          }}>
          <CheckCircle size={16} /> Continue to Farm Details
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: highlight ? 14 : 12.5, fontWeight: highlight ? 700 : 500, color: highlight ? '#1a5c38' : '#111827' }}>{value}</span>
    </div>
  );
}
