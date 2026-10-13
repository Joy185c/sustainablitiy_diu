import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { CROP_RULES } from '../data/mockData';
import type { CropRule } from '../data/mockData';
import {
  Card, PageHeader, DemoBanner, DataStatusBadge,
  Button, FormGroup, Input, Select, SectionTitle
} from '../components/ui';

interface FormValues {
  district: string;
  field_name: string;
  soil_ec: string;
  ec_unit: string;
  ec_date: string;
  season: string;
  water: string;
  irrigation: string;
  priority: string;
  area: string;
  area_unit: string;
}

interface RankedCrop {
  rule: CropRule;
  score: number;
  suitability: 'excellent' | 'good' | 'marginal' | 'unsuitable';
  reasons: string[];
  missing: string[];
  confidence: string;
}

function rankCrops(form: FormValues): RankedCrop[] {
  const ec = form.soil_ec ? parseFloat(form.soil_ec) : null;
  const hasEC = ec !== null && !isNaN(ec);

  return CROP_RULES
    .filter(r => r.applicable_seasons.includes(form.season))
    .map(rule => {
      let score = 50;
      const reasons: string[] = [];
      const missing: string[] = [];

      // EC scoring
      if (hasEC) {
        if (ec <= rule.max_salinity_ec_ds_m * 0.5) {
          score += 30;
          reasons.push(`Soil EC (${ec} dS/m) is well within the tolerance range (≤${rule.max_salinity_ec_ds_m} dS/m).`);
        } else if (ec <= rule.max_salinity_ec_ds_m) {
          score += 15;
          reasons.push(`Soil EC (${ec} dS/m) is within the tolerance range (≤${rule.max_salinity_ec_ds_m} dS/m).`);
        } else {
          score -= 30;
          reasons.push(`⚠ Soil EC (${ec} dS/m) exceeds the tolerance threshold for this crop (${rule.max_salinity_ec_ds_m} dS/m).`);
        }
      } else {
        missing.push('Soil EC measurement — recommendation confidence is lower without this.');
      }

      // Water scoring
      const waterMap: Record<string, number> = { limited: 1, moderate: 2, adequate: 3 };
      const minWater = waterMap[rule.min_water_availability];
      const avail = waterMap[form.water];
      if (avail >= minWater) {
        score += 15;
        reasons.push(`Water availability (${form.water}) meets the minimum requirement for this crop.`);
      } else {
        score -= 20;
        reasons.push(`⚠ Water availability (${form.water}) may be insufficient. This crop requires ${rule.min_water_availability} or more.`);
      }

      // Priority
      if (form.priority && rule.priority_fit.includes(form.priority as any)) {
        score += 10;
        reasons.push(`Aligns with your stated priority: ${form.priority.replace('_', ' ')}.`);
      }

      // Input level
      if (rule.input_level === 'low' && form.priority === 'lower_cost') {
        score += 5;
        reasons.push('Low input requirement matches cost-reduction priority.');
      }

      const suitability: RankedCrop['suitability'] =
        score >= 85 ? 'excellent' : score >= 65 ? 'good' : score >= 45 ? 'marginal' : 'unsuitable';

      const confidence = hasEC ? 'Medium (EC provided, season matched)' : 'Low (no EC data, regional defaults used)';

      return { rule, score, suitability, reasons, missing, confidence };
    })
    .sort((a, b) => b.score - a.score);
}

const SUIT_COLORS = {
  excellent: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  good:      { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  marginal:  { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  unsuitable:{ bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

export default function CropPlanner() {
  const { t, lang } = useLang();
  const [form, setForm] = useState<FormValues>({
    district: 'Satkhira', field_name: '', soil_ec: '', ec_unit: 'dS/m',
    ec_date: '', season: 'rabi', water: 'moderate', irrigation: 'yes',
    priority: 'risk_reduction', area: '', area_unit: 'bigha',
  });
  const [results, setResults] = useState<RankedCrop[] | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [compared, setCompared] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.district) e.district = 'Required';
    if (form.soil_ec && isNaN(parseFloat(form.soil_ec))) e.soil_ec = 'Must be a number';
    if (form.soil_ec && parseFloat(form.soil_ec) < 0) e.soil_ec = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setResults(rankCrops(form));
    setExpanded([]);
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleCompare(id: string) {
    setCompared(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title={t.crop_title} subtitle={t.crop_subtitle} />

      <DemoBanner text={t.crop_rules_notice} />

      <div style={{ display: 'grid', gridTemplateColumns: results ? '380px 1fr' : '1fr', gap: 20 }}>

        {/* Form */}
        <Card>
          <SectionTitle>Farm Conditions</SectionTitle>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormGroup label={t.crop_district} required>
              <Select value={form.district} onChange={set('district')}>
                <option value="Satkhira">Satkhira</option>
                <option value="Khulna">Khulna (Future)</option>
                <option value="Bagerhat">Bagerhat (Future)</option>
              </Select>
            </FormGroup>

            <FormGroup label={t.crop_field_name}>
              <Input value={form.field_name} onChange={set('field_name')} placeholder="e.g. North plot" />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
              <FormGroup label={t.crop_soil_ec} hint="Leave blank if unavailable — confidence will be lower">
                <Input
                  type="number" min="0" step="0.1"
                  value={form.soil_ec} onChange={set('soil_ec')}
                  placeholder="e.g. 3.5"
                />
                {errors.soil_ec && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.soil_ec}</span>}
              </FormGroup>
              <FormGroup label={t.crop_ec_unit}>
                <Select value={form.ec_unit} onChange={set('ec_unit')}>
                  <option value="dS/m">dS/m</option>
                  <option value="mS/cm">mS/cm</option>
                </Select>
              </FormGroup>
            </div>

            {!form.soil_ec && (
              <div style={{ background: '#fef9c3', borderRadius: 7, padding: '8px 12px', fontSize: 11.5, color: '#713f12', border: '1px solid #fde047' }}>
                <Info size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t.crop_no_ec_notice}
              </div>
            )}

            <FormGroup label={t.crop_season} required>
              <Select value={form.season} onChange={set('season')}>
                <option value="kharif">{t.crop_season_kharif}</option>
                <option value="rabi">{t.crop_season_rabi}</option>
                <option value="pre_kharif">{t.crop_season_pre_kharif}</option>
              </Select>
            </FormGroup>

            <FormGroup label={t.crop_water} required>
              <Select value={form.water} onChange={set('water')}>
                <option value="limited">{t.crop_water_limited}</option>
                <option value="moderate">{t.crop_water_moderate}</option>
                <option value="adequate">{t.crop_water_adequate}</option>
              </Select>
            </FormGroup>

            <FormGroup label={t.crop_irrigation}>
              <Select value={form.irrigation} onChange={set('irrigation')}>
                <option value="yes">{t.crop_yes}</option>
                <option value="no">{t.crop_no}</option>
              </Select>
            </FormGroup>

            <FormGroup label={t.crop_priority}>
              <Select value={form.priority} onChange={set('priority')}>
                <option value="lower_cost">{t.crop_priority_cost}</option>
                <option value="risk_reduction">{t.crop_priority_risk}</option>
                <option value="potential_return">{t.crop_priority_return}</option>
              </Select>
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
              <FormGroup label={t.crop_area}>
                <Input type="number" min="0" value={form.area} onChange={set('area')} placeholder="e.g. 2.5" />
              </FormGroup>
              <FormGroup label={t.crop_area_unit}>
                <Select value={form.area_unit} onChange={set('area_unit')}>
                  <option value="bigha">Bigha</option>
                  <option value="hectare">Hectare</option>
                  <option value="acre">Acre</option>
                </Select>
              </FormGroup>
            </div>

            <Button type="submit" variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {t.crop_submit}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionTitle>{t.crop_results_title}</SectionTitle>
              {compared.length >= 2 && (
                <Button variant="secondary" size="sm" onClick={() => {}}>
                  {t.crop_compare} ({compared.length})
                </Button>
              )}
            </div>

            {results.map((item, i) => {
              const s = SUIT_COLORS[item.suitability];
              const isExpanded = expanded.includes(item.rule.id);
              const isCompared = compared.includes(item.rule.id);

              return (
                <Card key={item.rule.id} style={{ border: i === 0 ? '2px solid #bbf7d0' : '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Rank */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: i === 0 ? '#16a34a' : i === 1 ? '#0d9488' : '#6b7280',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                            {lang === 'bn' ? item.rule.crop_name_bn : item.rule.crop_name}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            Season: {item.rule.applicable_seasons.join(', ')} · {item.rule.verification_status}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11.5, fontWeight: 700, padding: '3px 9px',
                            borderRadius: 5, border: `1px solid ${s.border}`,
                            background: s.bg, color: s.color,
                          }}>
                            {item.suitability.charAt(0).toUpperCase() + item.suitability.slice(1)}
                          </span>
                          <DataStatusBadge status={item.rule.verification_status === 'locally_verified' ? 'measured' : item.rule.verification_status === 'reference_based' ? 'satellite_derived' : 'demonstration'} />
                        </div>
                      </div>

                      {/* Quick stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, margin: '12px 0' }}>
                        <InfoChip label="Salinity Tolerance" value={item.rule.salinity_tolerance_label} />
                        <InfoChip label="Water Requirement" value={item.rule.water_req_label} />
                        <InfoChip label="Input Level" value={item.rule.input_level} />
                        <InfoChip label="Yield Range" value={item.rule.expected_yield_range} />
                      </div>

                      {/* Confidence */}
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                        <strong>Confidence:</strong> {item.confidence}
                      </div>

                      {/* Local relevance */}
                      <div style={{ fontSize: 12.5, color: '#374151', marginBottom: 10, lineHeight: 1.5 }}>
                        {item.rule.local_relevance}
                      </div>

                      {/* Expandable section */}
                      <button
                        onClick={() => toggleExpand(item.rule.id)}
                        style={{
                          background: 'none', border: '1px solid #e5e7eb', borderRadius: 7,
                          padding: '6px 12px', cursor: 'pointer', fontSize: 12.5,
                          color: '#1a5c38', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        {t.crop_why} {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {isExpanded && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Recommendation Reasoning:</div>
                            {item.reasons.map((r, j) => (
                              <div key={j} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#4b5563', marginBottom: 4 }}>
                                <CheckCircle size={12} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                                {r}
                              </div>
                            ))}
                          </div>

                          {item.missing.length > 0 && (
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>{t.crop_missing_info}:</div>
                              {item.missing.map((m, j) => (
                                <div key={j} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#92400e', marginBottom: 4 }}>
                                  <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                                  {m}
                                </div>
                              ))}
                            </div>
                          )}

                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Salinity Tolerance Evidence:</div>
                            <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{item.rule.salinity_tolerance_ref}</div>
                          </div>

                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{t.crop_next}:</div>
                            <div style={{ fontSize: 12, color: '#4b5563' }}>{item.rule.notes}</div>
                          </div>

                          <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', gap: 8 }}>
                            <ExternalLink size={11} />
                            Source: {item.rule.source}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compare checkbox */}
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 11.5, color: '#6b7280' }}>
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(item.rule.id)}
                          style={{ accentColor: '#1a5c38' }}
                        />
                        Compare
                      </label>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Compare table */}
            {compared.length >= 2 && (
              <Card>
                <SectionTitle>{t.crop_compare}</SectionTitle>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: 600 }}>Attribute</th>
                        {results.filter(r => compared.includes(r.rule.id)).map(r => (
                          <th key={r.rule.id} style={{ textAlign: 'left', padding: '8px 12px', color: '#374151', fontWeight: 700 }}>
                            {lang === 'bn' ? r.rule.crop_name_bn : r.rule.crop_name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Suitability', (r: RankedCrop) => r.suitability],
                        ['Score', (r: RankedCrop) => `${r.score}/100`],
                        ['Salt Tolerance', (r: RankedCrop) => r.rule.salinity_tolerance_label],
                        ['Water Need', (r: RankedCrop) => r.rule.water_req_label],
                        ['Input Level', (r: RankedCrop) => r.rule.input_level],
                        ['Yield Range', (r: RankedCrop) => r.rule.expected_yield_range],
                        ['Confidence', (r: RankedCrop) => r.confidence],
                      ].map(([label, fn]) => (
                        <tr key={label as string} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 12px', color: '#6b7280', fontWeight: 500 }}>{label as string}</td>
                          {results.filter(r => compared.includes(r.rule.id)).map(r => (
                            <td key={r.rule.id} style={{ padding: '8px 12px', color: '#111827' }}>
                              {(fn as Function)(r)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 7, padding: '7px 10px', border: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: 10.5, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{value}</div>
    </div>
  );
}
