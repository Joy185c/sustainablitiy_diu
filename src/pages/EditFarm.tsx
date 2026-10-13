import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useFarms } from '../farms/FarmsContext';
import type { AreaUnit, SurveyType } from '../farms/farmTypes';
import { Card, FormGroup, Input, Select, Button, SectionTitle } from '../components/ui';

const DISTRICTS = ['Satkhira', 'Khulna', 'Bagerhat'];
const UPAZILAS: Record<string, string[]> = {
  Satkhira: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
  Khulna: ['Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsa', 'Terokhada'],
  Bagerhat: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
};
const CROPS = ['', 'BRRI dhan 47', 'BRRI dhan 40', 'Sunflower', 'Mustard', 'Sweet Potato', 'Red Amaranth', 'Other'];
const SURVEY_TYPES: SurveyType[] = ['CS', 'SA', 'RS', 'BS/BRS', 'Unknown'];

export default function EditFarmPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFarm, updateFarm } = useFarms();
  const farm = getFarm(id!);

  const [form, setForm] = useState({
    name: farm?.name ?? '',
    district: farm?.district ?? 'Satkhira',
    upazila: farm?.upazila ?? 'Satkhira Sadar',
    village: farm?.village ?? '',
    mouzaName: farm?.mouzaName ?? '',
    jlNumber: farm?.jlNumber ?? '',
    dagNumber: farm?.dagNumber ?? '',
    khatianNumber: farm?.khatianNumber ?? '',
    surveyType: (farm?.surveyType ?? 'Unknown') as SurveyType,
    estimatedAreaUnit: (farm?.estimatedAreaUnit ?? 'bigha') as AreaUnit,
    recordedArea: farm?.recordedArea?.toString() ?? '',
    recordedAreaUnit: (farm?.recordedAreaUnit ?? 'bigha') as AreaUnit,
    primaryCrop: farm?.primaryCrop ?? '',
    soilSalinityEC: farm?.soilSalinityEC?.toString() ?? '',
    notes: farm?.notes ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  if (!farm) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Farm not found. <button onClick={() => navigate('/my-farms')} style={{ color: '#1a5c38', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Back to My Farms</button></div>;
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.village.trim()) e.village = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateFarm(farm.id, {
      name: form.name.trim(),
      district: form.district,
      upazila: form.upazila,
      village: form.village.trim(),
      mouzaName: form.mouzaName || undefined,
      jlNumber: form.jlNumber || undefined,
      dagNumber: form.dagNumber || undefined,
      khatianNumber: form.khatianNumber || undefined,
      surveyType: form.surveyType,
      estimatedAreaUnit: form.estimatedAreaUnit,
      recordedArea: form.recordedArea ? parseFloat(form.recordedArea) : undefined,
      recordedAreaUnit: form.recordedArea ? form.recordedAreaUnit : undefined,
      primaryCrop: form.primaryCrop || undefined,
      soilSalinityEC: form.soilSalinityEC ? parseFloat(form.soilSalinityEC) : undefined,
      notes: form.notes || undefined,
    });
    setSaved(true);
    setTimeout(() => navigate(`/my-farms/${farm.id}`), 900);
  };

  if (saved) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, fontSize: 18, fontWeight: 700, color: '#1a5c38' }}>✓ Saved! Redirecting…</div>;
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(`/my-farms/${farm.id}`)}
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#0f3b24' }}>Edit Farm Details</div>
      </div>

      <Card>
        <SectionTitle>Farm Information</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormGroup label="Farm Name *">
            <Input value={form.name} onChange={set('name')} />
            {errors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.name}</span>}
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="District">
              <Select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, upazila: UPAZILAS[e.target.value]?.[0] || '' }))}>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Upazila">
              <Select value={form.upazila} onChange={set('upazila')}>
                {(UPAZILAS[form.district] || []).map(u => <option key={u} value={u}>{u}</option>)}
              </Select>
            </FormGroup>
          </div>
          <FormGroup label="Village *">
            <Input value={form.village} onChange={set('village')} />
            {errors.village && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.village}</span>}
          </FormGroup>
        </div>
      </Card>

      <Card>
        <SectionTitle>Land Records (Optional)</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Mouza"><Input value={form.mouzaName} onChange={set('mouzaName')} /></FormGroup>
            <FormGroup label="JL Number"><Input value={form.jlNumber} onChange={set('jlNumber')} /></FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Dag No."><Input value={form.dagNumber} onChange={set('dagNumber')} /></FormGroup>
            <FormGroup label="Khatian"><Input value={form.khatianNumber} onChange={set('khatianNumber')} /></FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
            <FormGroup label="Survey Type">
              <Select value={form.surveyType} onChange={set('surveyType')}>
                {SURVEY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Recorded Area">
              <Input type="number" min="0" step="0.01" value={form.recordedArea} onChange={set('recordedArea')} />
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

      <Card>
        <SectionTitle>Crop & Soil</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormGroup label="Primary Crop">
            <Select value={form.primaryCrop} onChange={set('primaryCrop')}>
              {CROPS.map(c => <option key={c} value={c}>{c || '— Select —'}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Soil EC (dS/m)">
            <Input type="number" min="0" step="0.1" value={form.soilSalinityEC} onChange={set('soilSalinityEC')} placeholder="Optional" />
          </FormGroup>
          <FormGroup label="Notes">
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
          </FormGroup>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="secondary" onClick={() => navigate(`/my-farms/${farm.id}`)}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} style={{ marginLeft: 'auto' }}><Save size={14} /> Save Changes</Button>
      </div>
    </div>
  );
}
