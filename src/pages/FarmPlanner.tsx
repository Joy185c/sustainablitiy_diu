import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import { useLang } from '../i18n/LangContext';
import { Card, PageHeader, DemoBanner, SectionTitle, FormGroup, Input, Select, Button } from '../components/ui';

interface ScenarioForm {
  crop: string;
  area: string;
  area_unit: string;
  seed: string;
  fertilizer: string;
  labor: string;
  irrigation: string;
  other: string;
  yield_kg: string;
  price_bdt: string;
}

const DEFAULT_SCENARIOS: Record<string, Partial<ScenarioForm>> = {
  'BRRI dhan 47': { seed: '1200', fertilizer: '4500', labor: '6000', irrigation: '2000', other: '1500', yield_kg: '3200', price_bdt: '18' },
  'Mustard':      { seed: '600',  fertilizer: '2800', labor: '3500', irrigation: '800',  other: '900',  yield_kg: '1400', price_bdt: '45' },
  'Sunflower':    { seed: '900',  fertilizer: '3200', labor: '4000', irrigation: '1200', other: '1100', yield_kg: '1900', price_bdt: '38' },
  'Sweet Potato': { seed: '1800', fertilizer: '2000', labor: '4500', irrigation: '500',  other: '700',  yield_kg: '14000', price_bdt: '8' },
};

interface Results {
  total_cost: number;
  gross_revenue: number;
  gross_margin: number;
  margin_pct: number;
  scenarios: { name: string; cost: number; revenue: number; margin: number }[];
}

function calculate(form: ScenarioForm): Results {
  const n = (v: string) => parseFloat(v) || 0;
  const total_cost = n(form.seed) + n(form.fertilizer) + n(form.labor) + n(form.irrigation) + n(form.other);
  const gross_revenue = n(form.yield_kg) * n(form.price_bdt);
  const gross_margin = gross_revenue - total_cost;
  const margin_pct = gross_revenue > 0 ? (gross_margin / gross_revenue) * 100 : 0;

  const scenarios = [
    { name: 'Low (Pessimistic)', cost: total_cost * 1.1, revenue: gross_revenue * 0.75, margin: gross_revenue * 0.75 - total_cost * 1.1 },
    { name: 'Medium (Base)',     cost: total_cost,       revenue: gross_revenue,         margin: gross_margin },
    { name: 'High (Optimistic)', cost: total_cost * 0.9, revenue: gross_revenue * 1.2, margin: gross_revenue * 1.2 - total_cost * 0.9 },
  ];

  return { total_cost, gross_revenue, gross_margin, margin_pct, scenarios };
}

export default function FarmPlanner() {
  const { t } = useLang();
  const [form, setForm] = useState<ScenarioForm>({
    crop: 'BRRI dhan 47', area: '2.5', area_unit: 'bigha',
    ...DEFAULT_SCENARIOS['BRRI dhan 47'],
  } as ScenarioForm);
  const [results, setResults] = useState<Results | null>(null);

  function handleCropChange(crop: string) {
    const defaults = DEFAULT_SCENARIOS[crop] || {};
    setForm(f => ({ ...f, crop, ...defaults }));
    setResults(null);
  }

  const set = (key: keyof ScenarioForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  function handleCalc(e: React.FormEvent) {
    e.preventDefault();
    setResults(calculate(form));
  }

  const fmt = (v: number) => `৳${v.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title={t.farm_title} subtitle={t.farm_subtitle} />
      <DemoBanner text={t.farm_disclaimer} />

      <div style={{ display: 'grid', gridTemplateColumns: results ? 'minmax(340px, 420px) 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* Form */}
        <Card>
          <SectionTitle>Cost & Yield Assumptions</SectionTitle>
          <form onSubmit={handleCalc} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormGroup label={t.farm_crop}>
              <Select value={form.crop} onChange={e => handleCropChange(e.target.value)}>
                {Object.keys(DEFAULT_SCENARIOS).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other (enter manually)</option>
              </Select>
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
              <FormGroup label={t.farm_area} hint="All costs should be for this total area">
                <Input type="number" min="0" step="0.1" value={form.area} onChange={set('area')} />
              </FormGroup>
              <FormGroup label="Unit">
                <Select value={form.area_unit} onChange={set('area_unit')}>
                  <option value="bigha">Bigha</option>
                  <option value="hectare">Hectare</option>
                  <option value="acre">Acre</option>
                </Select>
              </FormGroup>
            </div>

            <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Cultivation Costs (BDT)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([['seed', t.farm_seed], ['fertilizer', t.farm_fertilizer], ['labor', t.farm_labor], ['irrigation', t.farm_irrigation], ['other', t.farm_other]] as const).map(([k, l]) => (
                  <FormGroup key={k} label={l}>
                    <Input type="number" min="0" value={form[k]} onChange={set(k)} placeholder="0" />
                  </FormGroup>
                ))}
              </div>
            </div>

            <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Revenue Assumptions</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FormGroup label={t.farm_yield} hint="Total expected harvest (kg)">
                  <Input type="number" min="0" value={form.yield_kg} onChange={set('yield_kg')} />
                </FormGroup>
                <FormGroup label={t.farm_price} hint="BDT per kg at farm gate">
                  <Input type="number" min="0" step="0.5" value={form.price_bdt} onChange={set('price_bdt')} />
                </FormGroup>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#9ca3af', background: '#f9fafb', borderRadius: 6, padding: '8px 10px' }}>
              ℹ Default values are illustrative. Enter your own estimates for accurate results.
            </div>

            <Button type="submit" variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center' }}>
              {t.farm_calculate}
            </Button>
          </form>
        </Card>

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <SummaryCard label={t.farm_total_cost} value={fmt(results.total_cost)} color="#dc2626" />
              <SummaryCard label={t.farm_gross_revenue} value={fmt(results.gross_revenue)} color="#16a34a" />
              <SummaryCard
                label={t.farm_gross_margin}
                value={fmt(results.gross_margin)}
                color={results.gross_margin >= 0 ? '#0d9488' : '#dc2626'}
                sub={`${results.margin_pct.toFixed(1)}% margin`}
              />
            </div>

            {/* Scenario chart */}
            <Card>
              <SectionTitle>{t.farm_scenarios}</SectionTitle>
              <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 12 }}>
                Low scenario: +10% cost, -25% yield · High scenario: -10% cost, +20% yield
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.scenarios} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      formatter={(v, n) => [fmt(Number(v)), String(n)]}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="cost" name="Total Cost (BDT)" fill="#dc2626" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="revenue" name="Gross Revenue (BDT)" fill="#16a34a" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="margin" name="Gross Margin (BDT)" fill="#0d9488" radius={[3, 3, 0, 0]}>
                      {results.scenarios.map((s, i) => (
                        <Cell key={i} fill={s.margin >= 0 ? '#0d9488' : '#dc2626'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Scenario table */}
            <Card>
              <SectionTitle>Detailed Scenarios</SectionTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      {['Scenario', 'Total Cost', 'Gross Revenue', 'Gross Margin', 'Margin %'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.scenarios.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i === 1 ? '#f0fdf4' : '#fff' }}>
                        <td style={{ padding: '9px 12px', fontWeight: i === 1 ? 700 : 400 }}>{s.name}</td>
                        <td style={{ padding: '9px 12px', color: '#dc2626' }}>{fmt(s.cost)}</td>
                        <td style={{ padding: '9px 12px', color: '#16a34a' }}>{fmt(s.revenue)}</td>
                        <td style={{ padding: '9px 12px', color: s.margin >= 0 ? '#0d9488' : '#dc2626', fontWeight: 700 }}>{fmt(s.margin)}</td>
                        <td style={{ padding: '9px 12px', color: '#374151' }}>
                          {s.revenue > 0 ? `${((s.margin / s.revenue) * 100).toFixed(1)}%` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, fontSize: 11.5, color: '#9ca3af', lineHeight: 1.6 }}>
                ⚠ {t.farm_disclaimer}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <Card style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}
