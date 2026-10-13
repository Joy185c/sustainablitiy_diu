import { useState } from 'react';
import { Download, Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, TestTube } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { FIELDS } from '../data/mockData';
import type { Field, RiskLevel } from '../data/mockData';
import {
  Card, PageHeader, DemoBanner, SectionTitle, Button,
  DataStatusBadge, RiskBadge, Input, Select, StatCard
} from '../components/ui';

export default function Extension() {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Field | null>(null);

  const flagged = FIELDS.filter(f => f.flagged);
  const needsTesting = FIELDS.filter(f => f.needs_soil_test);

  const filtered = FIELDS.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !search || f.name.toLowerCase().includes(q) || f.upazila.toLowerCase().includes(q) || f.id.toLowerCase().includes(q);
    const matchRisk = filterRisk === 'all' || f.risk === filterRisk;
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'flagged' && f.flagged)
      || (filterStatus === 'testing' && f.needs_soil_test);
    return matchSearch && matchRisk && matchStatus;
  });

  function exportCSV() {
    const headers = ['Field ID', 'Name', 'Upazila', 'District', 'Risk', 'Last Observation', 'Flagged', 'Needs Testing', 'Data Status', 'Next Step'];
    const rows = filtered.map(f => [
      f.id, f.name, f.upazila, f.district, f.risk,
      f.last_obs_date, f.flagged ? 'Yes' : 'No',
      f.needs_soil_test ? 'Yes' : 'No', f.data_status, f.next_step,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `salino-crop-extension-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const riskColor = { low: '#16a34a', moderate: '#d97706', high: '#dc2626' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title={t.ext_title}
        subtitle={t.ext_subtitle}
        actions={
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={13} /> {t.ext_export}
          </Button>
        }
      />

      <DemoBanner text={t.ext_disclaimer} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard
          icon={<AlertTriangle size={18} color="#dc2626" />}
          label={t.ext_flagged}
          value={flagged.length}
          sub="Locations needing verification"
          color="#dc2626"
        />
        <StatCard
          icon={<TestTube size={18} color="#d97706" />}
          label={t.ext_needs_testing}
          value={needsTesting.length}
          sub="Fields need soil EC test"
          color="#d97706"
        />
        <StatCard
          icon={<CheckCircle size={18} color="#16a34a" />}
          label="Total Locations"
          value={FIELDS.length}
          sub={`Satkhira District · Demo data`}
          color="#16a34a"
        />
        <StatCard
          icon={<CheckCircle size={18} color="#0d9488" />}
          label={t.ext_latest_obs}
          value="2025-10-05"
          sub="Sentinel-2 (Demo)"
          color="#0d9488"
        />
      </div>

      {/* Filters */}
      <Card padding="12px 16px">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 12px' }}>
            <Search size={14} color="#9ca3af" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t.ext_search}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13.5, width: '100%', fontFamily: 'inherit' }}
            />
          </div>
          <Select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ width: 150 }}>
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="high">High Risk</option>
          </Select>
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
            <option value="all">All Status</option>
            <option value="flagged">Flagged Only</option>
            <option value="testing">Needs Testing</option>
          </Select>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{filtered.length} locations</span>
        </div>
      </Card>

      {/* Table */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  {[t.ext_field, t.ext_location, t.ext_risk, t.ext_ec, t.ext_date, t.ext_status, t.ext_action].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11.5, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr
                    key={f.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: selected?.id === f.id ? '#f0fdf4' : i % 2 === 0 ? '#fff' : '#fafafa',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelected(f)}
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{f.id}</div>
                      {f.flagged && (
                        <span style={{ fontSize: 10, background: '#fee2e2', color: '#991b1b', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>FLAGGED</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ color: '#111827', fontSize: 12.5 }}>{f.upazila}</div>
                      <div style={{ color: '#9ca3af', fontSize: 11 }}>{f.name}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}><RiskBadge risk={f.risk} /></td>
                    <td style={{ padding: '10px 14px', color: f.soil_ec ? '#111827' : '#9ca3af', fontSize: 12 }}>
                      {f.soil_ec ? `${f.soil_ec} ${f.ec_unit}` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>{f.last_obs_date}</td>
                    <td style={{ padding: '10px 14px' }}><DataStatusBadge status={f.data_status} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(f); }}>
                        {t.ext_view}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      No locations match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card style={{ position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Field Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{selected.upazila}, {selected.district}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <RiskBadge risk={selected.risk} />
                {selected.flagged && <span style={{ fontSize: 11, background: '#fee2e2', color: '#991b1b', padding: '2px 7px', borderRadius: 4, fontWeight: 700, border: '1px solid #fca5a5' }}>FLAGGED</span>}
                {selected.needs_soil_test && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: 4, fontWeight: 700, border: '1px solid #fcd34d' }}>NEEDS TEST</span>}
              </div>

              <div style={{ fontSize: 12.5 }}>
                <strong>Area:</strong> {selected.area} {selected.area_unit}<br />
                <strong>Last Observation:</strong> {selected.last_obs_date}<br />
                <strong>Soil EC:</strong> {selected.soil_ec ? `${selected.soil_ec} ${selected.ec_unit}` : 'Not measured'}<br />
              </div>

              {selected.satellite_indicator && (
                <div style={{ background: '#ede9fe', borderRadius: 7, padding: '10px 12px', border: '1px solid #c4b5fd' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6d28d9', marginBottom: 4 }}>Satellite Indicator</div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>{selected.satellite_indicator}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Source: {selected.satellite_source}</div>
                </div>
              )}

              {selected.why_flagged && (
                <div style={{ background: '#fef3c7', borderRadius: 7, padding: '10px 12px', border: '1px solid #fcd34d' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>{t.ext_why_flagged}</div>
                  <div style={{ fontSize: 12, color: '#713f12' }}>{selected.why_flagged}</div>
                </div>
              )}

              <div style={{ background: '#f0fdf4', borderRadius: 7, padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Recommended Next Step</div>
                <div style={{ fontSize: 12.5, color: '#166534' }}>{selected.next_step}</div>
              </div>

              <DataStatusBadge status={selected.data_status} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
