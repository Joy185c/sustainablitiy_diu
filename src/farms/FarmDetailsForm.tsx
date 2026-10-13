import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, MapPin, Info } from 'lucide-react';
import { useFarms } from '../farms/FarmsContext';
import {
  calcGeodesicAreaM2, calcPerimeterM, convertArea, fmtArea,
} from '../farms/farmTypes';
import type { Farm, AreaUnit, SurveyType, GeoJsonPolygon } from '../farms/farmTypes';
import { Card, FormGroup, Input, Select, Button, SectionTitle } from '../components/ui';

interface Props {
  points: [number, number][]; // [lat, lng]
  onBack: () => void;
}

const DISTRICTS = ['Satkhira', 'Khulna', 'Bagerhat'];
const UPAZILAS: Record<string, string[]> = {
  Satkhira: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
  Khulna: ['Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsa', 'Terokhada'],
  Bagerhat: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
};
const CROPS = ['BRRI dhan 47', 'BRRI dhan 40', 'Sunflower', 'Mustard', 'Sweet Potato', 'Red Amaranth', 'Other'];
const SURVEY_TYPES: SurveyType[] = ['CS', 'SA', 'RS', 'BS/BRS', 'Unknown'];

export default function FarmDetailsForm({ points, onBack }: Props) {
  const navigate = useNavigate();
  const { addFarm } = useFarms();

  // Convert [lat,lng] → GeoJSON [lng,lat]
  const geoCoords: [number, number][] = points.map(([lat, lng]) => [lng, lat]);
  const areaM2 = calcGeodesicAreaM2(geoCoords);
  const perimM  = calcPerimeterM(geoCoords);

  // Centroid (simple average)
  const centLat = points.reduce((s, [lat]) => s + lat, 0) / points.length;
  const centLng = points.reduce((s, [, lng]) => s + lng, 0) / points.length;

  const [form, setForm] = useState({
    name: '',
    district: 'Satkhira',
    upazila: 'Satkhira Sadar',
    village: '',
    mouzaName: '',
    jlNumber: '',
    dagNumber: '',
    khatianNumber: '',
    surveyType: 'Unknown' as SurveyType,
    estimatedAreaUnit: 'bigha' as AreaUnit,
    recordedArea: '',
    recordedAreaUnit: 'bigha' as AreaUnit,
    primaryCrop: '',
    soilSalinityEC: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saved, setSaved] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Farm name is required';
    if (!form.village.trim()) e.village = 'Village or locality is required';
    if (form.soilSalinityEC && isNaN(parseFloat(form.soilSalinityEC))) e.soilSalinityEC = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const polygon: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [[...geoCoords, geoCoords[0]]], // close the ring
    };
    const farm: Farm = {
      id: `farm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(),
      district: form.district,
      upazila: form.upazila,
      village: form.village.trim(),
      mouzaName: form.mouzaName || undefined,
      jlNumber: form.jlNumber || undefined,
      dagNumber: form.dagNumber || undefined,
      khatianNumber: form.khatianNumber || undefined,
      surveyType: form.surveyType,
      polygonGeometry: polygon,
      centroidLatitude: centLat,
      centroidLongitude: centLng,
      estimatedArea: convertArea(areaM2, form.estimatedAreaUnit),
      estimatedAreaUnit: form.estimatedAreaUnit,
      recordedArea: form.recordedArea ? parseFloat(form.recordedArea) : undefined,
      recordedAreaUnit: form.recordedArea ? form.recordedAreaUnit : undefined,
      perimeterMeters: perimM,
      primaryCrop: form.primaryCrop || undefined,
      soilSalinityEC: form.soilSalinityEC ? parseFloat(form.soilSalinityEC) : undefined,
      notes: form.notes || undefined,
      createdAt: now,
      updatedAt: now,
    };
    addFarm(farm);
    setSaved(true);
    setTimeout(() => navigate(`/my-farms/${farm.id}`), 1200);
  };

  if (saved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Save size={32} color="#16a34a" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f3b24' }}>Farm Saved!</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Redirecting to your farm details…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack}
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}>
          <ArrowLeft size={14} /> Back to Map
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#0f3b24' }}>Farm Details</div>
          <div style={{ fontSize: 12.5, color: '#6b7280' }}>Enter information about your farm to save it</div>
        </div>
      </div>

      {/* Boundary summary */}
      <Card style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} color="#1a5c38" />
            <span style={{ fontSize: 13, color: '#374151' }}>
              Centroid: <strong>{centLat.toFixed(5)}, {centLng.toFixed(5)}</strong>
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#374151' }}>
            <strong>{points.length}</strong> boundary points
          </div>
          <div style={{ fontSize: 13, color: '#374151' }}>
            Est. area: <strong style={{ color: '#1a5c38' }}>{fmtArea(areaM2, form.estimatedAreaUnit)}</strong>
          </div>
          <div style={{ fontSize: 13, color: '#374151' }}>
            Perimeter: <strong>{(perimM / 1000).toFixed(3)} km</strong>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
          <Info size={11} style={{ display: 'inline', marginRight: 4 }} />
          Estimated from drawn boundary. Not an official cadastral survey.
        </div>
      </Card>

      {/* ── Required info */}
      <Card>
        <SectionTitle>Farm Information *</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormGroup label="Farm Name *" hint={errors.name}>
            <Input value={form.name} onChange={set('name')} placeholder='e.g. "My Main Paddy Field"' />
            {errors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.name}</span>}
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="District *">
              <Select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, upazila: UPAZILAS[e.target.value]?.[0] || '' }))}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Upazila *">
              <Select value={form.upazila} onChange={set('upazila')}>
                {(UPAZILAS[form.district] || []).map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormGroup>
          </div>

          <FormGroup label="Village / Locality *" hint="Para, mahalla, or nearest locality name">
            <Input value={form.village} onChange={set('village')} placeholder="e.g. Nalta Para" />
            {errors.village && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.village}</span>}
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
            <FormGroup label="Display Area Unit">
              <Select value={form.estimatedAreaUnit} onChange={set('estimatedAreaUnit')}>
                <option value="bigha">Bigha (BD)</option>
                <option value="decimal">Decimal / Shatak</option>
                <option value="acre">Acre</option>
                <option value="hectare">Hectare</option>
              </Select>
            </FormGroup>
            <FormGroup label="Calc. Area">
              <div style={{ padding: '8px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#1a5c38' }}>
                {fmtArea(areaM2, form.estimatedAreaUnit).split(' ')[0]}
              </div>
            </FormGroup>
          </div>
        </div>
      </Card>

      {/* ── Optional land records */}
      <Card>
        <SectionTitle>Land Records (Optional)</SectionTitle>
        <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
          If you have official land records, you may enter them below. These are stored locally and not verified.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Mouza Name">
              <Input value={form.mouzaName} onChange={set('mouzaName')} placeholder="Optional" />
            </FormGroup>
            <FormGroup label="JL Number">
              <Input value={form.jlNumber} onChange={set('jlNumber')} placeholder="Optional" />
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Dag / Plot Number">
              <Input value={form.dagNumber} onChange={set('dagNumber')} placeholder="Optional" />
            </FormGroup>
            <FormGroup label="Khatian Number">
              <Input value={form.khatianNumber} onChange={set('khatianNumber')} placeholder="Optional" />
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
            <FormGroup label="Survey Type">
              <Select value={form.surveyType} onChange={set('surveyType')}>
                {SURVEY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Recorded Area">
              <Input type="number" min="0" step="0.01" value={form.recordedArea} onChange={set('recordedArea')} placeholder="Optional" />
            </FormGroup>
            <FormGroup label="Unit">
              <Select value={form.recordedAreaUnit} onChange={set('recordedAreaUnit')}>
                <option value="bigha">Bigha</option>
                <option value="decimal">Decimal</option>
                <option value="acre">Acre</option>
                <option value="hectare">Hectare</option>
              </Select>
            </FormGroup>
          </div>
        </div>
      </Card>

      {/* ── Agronomic info */}
      <Card>
        <SectionTitle>Crop & Soil Information (Optional)</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormGroup label="Primary Crop">
            <Select value={form.primaryCrop} onChange={set('primaryCrop')}>
              <option value="">— Select crop —</option>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Soil EC (dS/m)" hint="If you have a measured value. Leave blank if unknown.">
            <Input type="number" min="0" step="0.1" value={form.soilSalinityEC} onChange={set('soilSalinityEC')} placeholder="e.g. 3.5" />
            {errors.soilSalinityEC && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.soilSalinityEC}</span>}
          </FormGroup>
          <FormGroup label="Notes">
            <textarea
              value={form.notes} onChange={set('notes')}
              rows={3} placeholder="Anything else about this farm..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </FormGroup>
        </div>
      </Card>

      {/* ── Actions */}
      <div style={{ display: 'flex', gap: 10, paddingBottom: 24 }}>
        <Button variant="secondary" onClick={onBack}>← Back to Map</Button>
        <Button variant="primary" onClick={handleSave} style={{ marginLeft: 'auto', padding: '11px 28px' }}>
          <Save size={15} /> Save Farm
        </Button>
      </div>
    </div>
  );
}
