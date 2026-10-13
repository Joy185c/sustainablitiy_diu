import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { CLIMATE_DATA_2024_2025, RISK_TREND_DATA } from '../data/mockData';
import { Card, PageHeader, DemoBanner, DataStatusBadge, SectionTitle, StatCard, Select, SourceNote } from '../components/ui';

export default function Climate() {
  const { t } = useLang();
  const [period, setPeriod] = useState('all');

  const data = period === 'last6'
    ? CLIMATE_DATA_2024_2025.slice(-6)
    : CLIMATE_DATA_2024_2025;

  const latest = CLIMATE_DATA_2024_2025[CLIMATE_DATA_2024_2025.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title={t.climate_title}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: '#6b7280' }}>{t.climate_period}:</span>
            <Select value={period} onChange={e => setPeriod(e.target.value)} style={{ width: 160 }}>
              <option value="all">{t.climate_all_periods}</option>
              <option value="last6">Last 6 Months</option>
            </Select>
          </div>
        }
      />

      <DemoBanner text={`${t.climate_demo_notice} · ${t.climate_last_updated}: 2025-10-05`} />

      {/* Current conditions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard
          icon={<Thermometer size={18} color="#dc2626" />}
          label={t.climate_temperature}
          value={`${latest.temp_max_c}°C`}
          sub={`Min: ${latest.temp_min_c}°C · Oct 2025`}
          color="#dc2626"
          badge={<DataStatusBadge status="demonstration" />}
        />
        <StatCard
          icon={<CloudRain size={18} color="#3b82f6" />}
          label={t.climate_rainfall}
          value={`${latest.rainfall_mm} mm`}
          sub="Monthly total · Oct 2025"
          color="#3b82f6"
          badge={<DataStatusBadge status="demonstration" />}
        />
        <StatCard
          icon={<Droplets size={18} color="#0d9488" />}
          label={t.climate_humidity}
          value={`${latest.humidity_pct}%`}
          sub="Relative humidity · Oct 2025"
          color="#0d9488"
          badge={<DataStatusBadge status="demonstration" />}
        />
        <StatCard
          icon={<Wind size={18} color="#6b7280" />}
          label={t.climate_wind}
          value={`${latest.wind_kmh} km/h`}
          sub="Average wind speed · Oct 2025"
          color="#6b7280"
          badge={<DataStatusBadge status="demonstration" />}
        />
      </div>

      {/* Rainfall chart */}
      <Card>
        <SectionTitle>{t.climate_seasonal}</SectionTitle>
        <SourceNote source="NASA POWER API format (sample dataset)" date="2025-10-05" />
        <div style={{ height: 260, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis unit=" mm" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [`${v} mm`, 'Rainfall']}
              />
              <Bar dataKey="rainfall_mm" name="Rainfall (mm)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Temperature chart */}
      <Card>
        <SectionTitle>Temperature Range</SectionTitle>
        <SourceNote source="Sample dataset (NASA POWER API format)" date="2025-10-05" />
        <div style={{ height: 260, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis unit="°C" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number, n: string) => [`${v}°C`, n === 'temp_max_c' ? 'Max Temp' : 'Min Temp']}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="temp_max_c" name="Max Temp (°C)" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temp_min_c" name="Min Temp (°C)" stroke="#f97316" strokeWidth={2} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Humidity & Wind */}
      <Card>
        <SectionTitle>Humidity & Wind Speed</SectionTitle>
        <SourceNote source="Sample dataset" date="2025-10-05" />
        <div style={{ height: 240, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="humidity_pct" name="Humidity (%)" stroke="#0d9488" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="wind_kmh" name="Wind (km/h)" stroke="#6b7280" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Salinity risk trend */}
      <Card>
        <SectionTitle>{t.climate_salinity_trend}</SectionTitle>
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 4 }}>
          ⚠ Illustrative demonstration data. Satellite-derived spectral proxy — not a direct EC measurement.
        </div>
        <SourceNote source="Sentinel-2 spectral proxy (Demo) · BRRI historical records" date="2025-10-05" />
        <div style={{ height: 240, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={RISK_TREND_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="risk_index" name="Risk Index (0-10)" stroke="#d97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="avg_ec_proxy" name="EC Proxy (dS/m)" stroke="#0f3b24" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Data sources table */}
      <Card>
        <SectionTitle>Environmental Data Sources</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                {['Variable', 'Source', 'Format', 'Status', 'Notes'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Rainfall', 'NASA POWER', 'Daily mm', 'Demonstration', 'Sample values matching NASA POWER API schema'],
                ['Temperature', 'NASA POWER', '°C', 'Demonstration', 'Max and min monthly averages'],
                ['Relative Humidity', 'NASA POWER', '%', 'Demonstration', 'Monthly average relative humidity'],
                ['Wind Speed', 'NASA POWER', 'km/h', 'Demonstration', 'Monthly average 10m wind speed'],
                ['Salinity Risk Index', 'Sentinel-2 (Demo)', 'Proxy (0–10)', 'Demonstration', 'Spectral proxy — not direct EC measurement'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '9px 12px', color: '#374151', fontSize: 12.5 }}>
                      {j === 3 ? <DataStatusBadge status="demonstration" bn={cell} /> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
