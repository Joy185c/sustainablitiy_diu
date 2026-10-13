import { Link } from 'react-router-dom';
import {
  AlertTriangle, Calendar, CloudRain, Flag, TrendingUp,
  Sprout, Bell, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useLang } from '../i18n/LangContext';
import {
  DASHBOARD_SUMMARY, RISK_TREND_DATA, CROP_RULES, RECENT_ADVISORIES
} from '../data/mockData';
import {
  Card, StatCard, SectionTitle, DemoBanner, DataStatusBadge, RiskBadge, PageHeader, Button
} from '../components/ui';



export default function Dashboard() {
  const { t, lang } = useLang();
  const s = DASHBOARD_SUMMARY;
  const topCrops = CROP_RULES.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title={t.dash_welcome}
        subtitle={t.dash_subtitle}
      />

      <DemoBanner text={t.dash_demo_banner} />

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          icon={<AlertTriangle size={18} color="#d97706" />}
          label={t.dash_card_risk}
          value={s.risk_value}
          sub={lang === 'bn' ? t.dash_risk_moderate : s.risk_label}
          color="#d97706"
          badge={<RiskBadge risk={s.risk_level} label={lang === 'bn' ? t.moderate : undefined} />}
        />
        <StatCard
          icon={<Calendar size={18} color="#0d9488" />}
          label={t.dash_card_date}
          value={s.latest_obs_date}
          sub={s.latest_obs_source}
          color="#0d9488"
          badge={<DataStatusBadge status="demonstration" />}
        />
        <StatCard
          icon={<CloudRain size={18} color="#3b82f6" />}
          label={t.dash_card_rain}
          value={`${s.rainfall_7day_mm} mm`}
          sub="Declining after monsoon peak"
          color="#3b82f6"
          badge={<DataStatusBadge status="demonstration" />}
        />
        <StatCard
          icon={<Flag size={18} color="#dc2626" />}
          label={t.dash_card_fields}
          value={`${s.fields_flagged} / ${s.fields_total}`}
          sub={t.dash_fields_label}
          color="#dc2626"
          badge={<DataStatusBadge status="requires_verification" />}
        />
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <SectionTitle>{t.dash_trend_title}</SectionTitle>
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 12 }}>
          📌 Illustrative demonstration data — not a validated predictive model
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={RISK_TREND_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v, n) => [Number(v).toFixed(1), n === 'risk_index' ? 'Risk Index (0–10)' : 'EC Proxy (dS/m)']}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="risk_index" name="Risk Index" stroke="#d97706" strokeWidth={2} fill="url(#riskGrad)" dot={false} />
              <Area type="monotone" dataKey="avg_ec_proxy" name="EC Proxy (dS/m)" stroke="#0d9488" strokeWidth={2} fill="url(#ecGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom row: Crops + Advisories */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Top Crops */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionTitle>{t.dash_crops_title}</SectionTitle>
            <Link to="/crop-planner" style={{ fontSize: 12, color: '#1a5c38', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              {t.view_all} <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCrops.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '10px 12px', borderRadius: 8,
                background: i === 0 ? '#f0fdf4' : '#fafafa',
                border: i === 0 ? '1px solid #bbf7d0' : '1px solid #f3f4f6',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i === 0 ? '#16a34a' : i === 1 ? '#0d9488' : '#6b7280',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {lang === 'bn' ? c.crop_name_bn : c.crop_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {c.salinity_tolerance_label} · {c.water_req_label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Advisories */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionTitle>{t.dash_advisory_title}</SectionTitle>
            <Link to="/advisory" style={{ fontSize: 12, color: '#1a5c38', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              {t.view_all} <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECENT_ADVISORIES.map(a => (
              <div key={a.id} style={{
                display: 'flex', gap: 10, padding: '10px 12px',
                borderRadius: 8, border: '1px solid #f3f4f6',
                background: '#fafafa',
              }}>
                <div style={{ marginTop: 2 }}>
                  {a.risk === 'high'
                    ? <AlertCircle size={15} color="#dc2626" />
                    : a.risk === 'moderate'
                    ? <AlertTriangle size={15} color="#d97706" />
                    : <CheckCircle size={15} color="#16a34a" />}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: '#374151' }}>{a.type}</span>
                    <span style={{ fontSize: 10.5, color: '#9ca3af' }}>· {a.date}</span>
                    <RiskBadge risk={a.risk} />
                  </div>
                  <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{a.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Data Quality Footer */}
      <Card style={{ background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TrendingUp size={15} color="#374151" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{t.dash_data_quality}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(['demonstration', 'satellite_derived', 'requires_verification', 'measured', 'unavailable'] as const).map(s => (
            <DataStatusBadge key={s} status={s} />
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11.5, color: '#9ca3af' }}>
          All data displayed on this platform is labelled with its source type. Demonstration data is used throughout this MVP. See{' '}
          <Link to="/methodology" style={{ color: '#1a5c38' }}>Data & Methodology</Link> for full details.
        </div>
      </Card>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/risk-map">
          <Button variant="primary" size="md">
            <AlertTriangle size={15} /> View Risk Map
          </Button>
        </Link>
        <Link to="/crop-planner">
          <Button variant="secondary" size="md">
            <Sprout size={15} /> Plan Crops
          </Button>
        </Link>
        <Link to="/advisory">
          <Button variant="secondary" size="md">
            <Bell size={15} /> Generate Advisory
          </Button>
        </Link>
      </div>
    </div>
  );
}
