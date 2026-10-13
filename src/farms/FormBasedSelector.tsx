import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin, CheckCircle, AlertTriangle, Info, Loader } from 'lucide-react';
import { calcGeodesicAreaM2, fmtArea } from './farmTypes';
import type { AreaUnit } from './farmTypes';
import { FormGroup, Input, Select, Button, Card, SectionTitle } from '../components/ui';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Step = 'form-fill' | 'form-confirm';

interface FormBasedSelectorProps {
  onComplete: (points: [number, number][]) => void;
  onBack: () => void;
  step: Step;
  onStepChange: (s: Step) => void;
}

interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  boundingBox?: [number, number, number, number]; // [s, n, w, e]
}

function FlyToBounds({ bbox }: { bbox: [number, number, number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!bbox) return;
    const [s, n, w, e] = bbox;
    map.fitBounds([[s, w], [n, e]], { padding: [40, 40], maxZoom: 16, duration: 1.2 });
  }, [bbox, map]);
  return null;
}

// Generate approximate polygon around a centroid point (rough 200m square)
function generateApproxPolygon(lat: number, lng: number, areaHa: number = 0.5): [number, number][] {
  // side = sqrt(area in m²)
  const areaM2 = areaHa * 10000;
  const halfSide = Math.sqrt(areaM2) / 2;
  const dLat = halfSide / 111111;
  const dLng = halfSide / (111111 * Math.cos((lat * Math.PI) / 180));
  // Return a rough irregular polygon (not a perfect square — more realistic)
  return [
    [lat + dLat * 0.9, lng - dLng],
    [lat + dLat, lng + dLng * 0.7],
    [lat - dLat * 0.3, lng + dLng],
    [lat - dLat, lng + dLng * 0.4],
    [lat - dLat * 0.8, lng - dLng * 0.8],
    [lat + dLat * 0.2, lng - dLng * 1.1],
  ];
}

export default function FormBasedSelector({ onComplete, onBack, step, onStepChange }: FormBasedSelectorProps) {
  const [form, setForm] = useState({
    district: 'Satkhira',
    upazila: '',
    village: '',
    mouza: '',
    dagNumber: '',
    recordedArea: '1',
    areaUnit: 'bigha' as AreaUnit,
  });
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<GeoResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [approxPoints, setApproxPoints] = useState<[number, number][]>([]);
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);

  const DISTRICTS = ['Satkhira', 'Khulna', 'Bagerhat'];
  const UPAZILAS: Record<string, string[]> = {
    Satkhira: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
    Khulna: ['Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsa', 'Terokhada'],
    Bagerhat: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleDetect = async () => {
    setSearching(true);
    setSearchError('');
    setResult(null);

    // Build search query from form
    const parts = [form.village, form.mouza, form.upazila, form.district, 'Bangladesh'].filter(Boolean);
    const query = parts.join(', ');

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=bd`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();

      if (!data || data.length === 0) {
        // Fallback: try district + upazila only
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([form.upazila || form.district, 'Bangladesh'].join(', '))}&format=json&limit=1&countrycodes=bd`;
        const res2 = await fetch(fallbackUrl, { headers: { 'Accept-Language': 'en' } });
        const data2 = await res2.json();
        if (!data2 || data2.length === 0) {
          setSearchError(`Could not find "${query}" on the map. Try using a more common village or upazila name.`);
          setSearching(false);
          return;
        }
        processResult(data2[0]);
      } else {
        processResult(data[0]);
      }
    } catch {
      setSearchError('Network error during location search. Please check your connection.');
    }
    setSearching(false);
  };

  const processResult = (item: { lat: string; lon: string; display_name: string; boundingbox?: string[] }) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    // Parse bounding box if available
    let bb: [number, number, number, number] | null = null;
    if (item.boundingbox) {
      bb = item.boundingbox.map(parseFloat) as [number, number, number, number];
      setBbox(bb);
    }

    // Determine area in hectares from form input
    let areaHa = parseFloat(form.recordedArea) || 0.5;
    if (form.areaUnit === 'bigha') areaHa = areaHa * 0.1338;
    else if (form.areaUnit === 'decimal') areaHa = areaHa * 0.004047;
    else if (form.areaUnit === 'acre') areaHa = areaHa * 0.4047;

    const pts = generateApproxPolygon(lat, lng, Math.max(0.02, areaHa));
    setApproxPoints(pts);
    setResult({ lat, lng, displayName: item.display_name, boundingBox: bb || undefined });
    onStepChange('form-confirm');
  };

  const areaM2 = approxPoints.length >= 3
    ? calcGeodesicAreaM2(approxPoints.map(([lat, lng]) => [lng, lat]))
    : 0;

  if (step === 'form-fill') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f3b24', marginBottom: 6 }}>Enter Your Land Details</h3>
          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7 }}>
            Fill in your location details and the system will automatically find and approximate your farmland on the map.
          </p>
        </div>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Location Information</SectionTitle>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormGroup label="District *">
              <Select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, upazila: '' }))}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Upazila">
              <Select value={form.upazila} onChange={set('upazila')}>
                <option value="">— Select —</option>
                {(UPAZILAS[form.district] || []).map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormGroup>
          </div>

          <FormGroup label="Village / Para / Locality" hint="This is the most important field for auto-detection">
            <Input value={form.village} onChange={set('village')} placeholder="e.g. Nalta Para, Burigoalini" />
          </FormGroup>

          <FormGroup label="Mouza Name (optional)">
            <Input value={form.mouza} onChange={set('mouza')} placeholder="Optional" />
          </FormGroup>

          <FormGroup label="Dag / Plot Number (optional)" hint="Land record number if available">
            <Input value={form.dagNumber} onChange={set('dagNumber')} placeholder="e.g. 245" />
          </FormGroup>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
            <SectionTitle>Approximate Land Size</SectionTitle>
            <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 12, lineHeight: 1.6 }}>
              This helps generate an approximate boundary polygon on the map.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
              <FormGroup label="Recorded or Known Area">
                <Input type="number" min="0.01" step="0.1" value={form.recordedArea} onChange={set('recordedArea')} placeholder="e.g. 2.5" />
              </FormGroup>
              <FormGroup label="Unit">
                <Select value={form.areaUnit} onChange={set('areaUnit')}>
                  <option value="bigha">Bigha</option>
                  <option value="decimal">Decimal</option>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                </Select>
              </FormGroup>
            </div>
          </div>
        </Card>

        {searchError && (
          <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', display: 'flex', gap: 8 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {searchError}
          </div>
        )}

        <div style={{ marginTop: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#92400e', display: 'flex', gap: 8 }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          The system uses public geocoding (OpenStreetMap Nominatim) to locate your village. The generated boundary is an approximation only — you can adjust it in the next step.
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="secondary" onClick={onBack}>← Back</Button>
          <Button
            variant="primary"
            onClick={handleDetect}
            style={{ marginLeft: 'auto', padding: '11px 28px' }}
          >
            {searching
              ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Detecting…</>
              : <><Search size={14} /> Detect My Farm Location</>}
          </Button>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // step === 'form-confirm'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Info bar */}
      <div style={{ background: 'linear-gradient(90deg, #0f3b24, #1a5c38)', padding: '10px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <MapPin size={16} color="#6ee7b7" />
        <span style={{ color: '#fff', fontSize: 13.5, fontWeight: 600 }}>
          Auto-detected location — confirm the approximate boundary
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(255,255,255,0.12)', color: '#d1fae5', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
            📍 {result?.displayName?.split(',').slice(0, 2).join(', ')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left panel */}
        <div style={{ width: 260, flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Auto-Detected Location</div>
            {result && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '10px 12px', fontSize: 12.5, color: '#0f3b24', lineHeight: 1.6 }}>
                <CheckCircle size={13} color="#16a34a" style={{ display: 'inline', marginRight: 5 }} />
                {result.displayName.split(',').slice(0, 4).join(', ')}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Approximate Boundary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Row label="Points" value={`${approxPoints.length}`} />
              <Row label="Est. Area" value={areaM2 > 0 ? fmtArea(areaM2, form.areaUnit) : '—'} highlight />
              <Row label="Based on input" value={`${form.recordedArea} ${form.areaUnit}`} />
            </div>
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
            <strong>⚠ Approximate only.</strong> This boundary is auto-generated from your location and entered area. It is not a cadastral survey. You can adjust it after saving by editing the boundary.
          </div>

          <Button variant="secondary" onClick={() => onStepChange('form-fill')} style={{ fontSize: 12.5 }}>
            ← Edit Form
          </Button>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {result && (
            <MapContainer
              center={[result.lat, result.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
                maxZoom={19}
              />
              {bbox && <FlyToBounds bbox={bbox} />}
              <Marker position={[result.lat, result.lng]} />
              {approxPoints.length >= 3 && (
                <Polygon
                  positions={approxPoints}
                  pathOptions={{ color: '#0d9488', fillColor: '#0d9488', fillOpacity: 0.2, weight: 2.5, dashArray: '8,4' }}
                />
              )}
              {approxPoints.map(([lat, lng], i) => (
                <CircleMarker key={i} center={[lat, lng]} radius={5}
                  pathOptions={{ color: '#fff', fillColor: '#0d9488', fillOpacity: 1, weight: 2 }} />
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => onStepChange('form-fill')}
          style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
          ← Re-enter Details
        </button>
        <div style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>
          ✅ Location auto-detected. Confirm to continue to farm details.
        </div>
        <Button
          variant="primary"
          onClick={() => onComplete(approxPoints)}
          style={{ padding: '11px 28px' }}
        >
          <CheckCircle size={16} /> Confirm Location →
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: highlight ? 13.5 : 12, fontWeight: highlight ? 700 : 500, color: highlight ? '#0d9488' : '#111827' }}>{value}</span>
    </div>
  );
}
