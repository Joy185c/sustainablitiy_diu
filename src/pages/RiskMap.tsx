import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Info, MapPin, TestTube, Satellite, AlertTriangle } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { FIELDS } from '../data/mockData';
import type { Field, RiskLevel } from '../data/mockData';
import { Card, DataStatusBadge, RiskBadge, PageHeader, DemoBanner, Button, Select } from '../components/ui';

const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#16a34a',
  moderate: '#d97706',
  high: '#dc2626',
};

function MapBoundsReset() {
  const map = useMap();
  useEffect(() => {
    map.setView([22.38, 89.1], 10);
  }, [map]);
  return null;
}

export default function RiskMap() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState<Field | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterUpazila, setFilterUpazila] = useState<string>('all');

  const upazilas = Array.from(new Set(FIELDS.map(f => f.upazila)));

  const filtered = FIELDS.filter(f => {
    if (filterRisk !== 'all' && f.risk !== filterRisk) return false;
    if (filterUpazila !== 'all' && f.upazila !== filterUpazila) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title={t.map_title} />
      <DemoBanner text={t.map_demo_label} />

      {/* Filters */}
      <Card padding="12px 16px">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{t.map_filter_location}:</span>
            <Select value={filterUpazila} onChange={e => setFilterUpazila(e.target.value)} style={{ width: 160 }}>
              <option value="all">{t.map_all}</option>
              {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{t.map_legend}:</span>
            <Select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ width: 160 }}>
              <option value="all">{t.all}</option>
              <option value="low">{t.map_low}</option>
              <option value="moderate">{t.map_moderate}</option>
              <option value="high">{t.map_high}</option>
            </Select>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
            {filtered.length} / {FIELDS.length} locations
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16, alignItems: 'start' }}>

        {/* Map */}
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <MapContainer
            center={[22.38, 89.1]}
            zoom={10}
            style={{ height: 540, width: '100%', borderRadius: 12 }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBoundsReset />
            {filtered.map(field => (
              <CircleMarker
                key={field.id}
                center={[field.lat, field.lng]}
                radius={selected?.id === field.id ? 14 : 10}
                pathOptions={{
                  color: RISK_COLORS[field.risk],
                  fillColor: RISK_COLORS[field.risk],
                  fillOpacity: 0.75,
                  weight: selected?.id === field.id ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => setSelected(field),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                    <strong>{field.name}</strong><br />
                    <span style={{ color: '#6b7280' }}>{field.upazila}, {field.district}</span><br />
                    <span style={{ color: RISK_COLORS[field.risk], fontWeight: 700, marginTop: 4, display: 'block' }}>
                      Risk: {field.risk.toUpperCase()}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Legend overlay */}
          <div style={{
            position: 'absolute', bottom: 32, left: 16, zIndex: 400,
            background: 'rgba(255,255,255,0.95)', borderRadius: 8,
            padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{t.map_legend}</div>
            {(['low', 'moderate', 'high'] as const).map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: RISK_COLORS[r] }} />
                <span style={{ fontSize: 11, color: '#374151' }}>
                  {r === 'low' ? t.map_low : r === 'moderate' ? t.map_moderate : t.map_high}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Detail Panel */}
        {selected && (
          <Card style={{ position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', lineHeight: 1.3 }}>{t.map_field_detail}</div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, fontSize: 16 }}
              >✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow icon={<MapPin size={13} />} label={t.map_field_id} value={selected.id} />
              <InfoRow icon={<MapPin size={13} />} label="Location" value={`${selected.name} · ${selected.upazila}`} />
              <InfoRow icon={<Info size={13} />} label="Area" value={`${selected.area} ${selected.area_unit}`} />

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                <InfoRow
                  icon={<AlertTriangle size={13} />}
                  label="Risk Level"
                  value={<RiskBadge risk={selected.risk} />}
                />
                <InfoRow
                  icon={<Info size={13} />}
                  label={t.map_obs_date}
                  value={selected.last_obs_date}
                />
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  <TestTube size={12} style={{ display: 'inline', marginRight: 4 }} />{t.map_soil_ec}
                </div>
                <div style={{ fontSize: 13, color: selected.soil_ec ? '#111827' : '#9ca3af' }}>
                  {selected.soil_ec
                    ? `${selected.soil_ec} ${selected.ec_unit || 'dS/m'}`
                    : t.map_no_ec}
                </div>
              </div>

              {selected.satellite_indicator && (
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    <Satellite size={12} style={{ display: 'inline', marginRight: 4 }} />{t.map_satellite}
                  </div>
                  <div style={{ fontSize: 12, color: '#4b5563' }}>{selected.satellite_indicator}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    Source: {selected.satellite_source}
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                <InfoRow label={t.map_status} value={<DataStatusBadge status={selected.data_status} />} />
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#166534', marginBottom: 4 }}>{t.map_next_step}</div>
                <div style={{ fontSize: 12.5, color: '#166534' }}>{selected.next_step}</div>
              </div>

              {selected.why_flagged && (
                <div style={{ background: '#fef9c3', borderRadius: 8, padding: '10px 12px', border: '1px solid #fde047' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#713f12', marginBottom: 4 }}>Why Flagged</div>
                  <div style={{ fontSize: 12, color: '#713f12' }}>{selected.why_flagged}</div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Field list */}
      {!selected && (
        <Card>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#374151' }}>
            {t.map_select_hint}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {filtered.map(f => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: 8,
                  border: `1px solid ${RISK_COLORS[f.risk]}30`,
                  background: `${RISK_COLORS[f.risk]}08`,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{f.id}</span>
                  <RiskBadge risk={f.risk} />
                </div>
                <div style={{ fontSize: 12, color: '#4b5563' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{f.upazila} · {f.last_obs_date}</div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 12, flexShrink: 0 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: '#111827', textAlign: 'right' }}>{value}</div>
    </div>
  );
}
