import { useLang } from '../i18n/LangContext';
import { Card, PageHeader, SectionTitle } from '../components/ui';

const SDGs = [
  {
    number: 2, title: 'Zero Hunger', emoji: '🌾',
    color: '#DDA63A', desc: 'Improving crop planning and food security for coastal farming families facing salinity threats.',
    status: 'primary', implemented: true,
  },
  {
    number: 13, title: 'Climate Action', emoji: '🌍',
    color: '#3F7E44', desc: 'Building climate resilience by helping farmers adapt crop choices to changing salinity and weather conditions.',
    status: 'primary', implemented: true,
  },
  {
    number: 15, title: 'Life on Land', emoji: '🌿',
    color: '#56C02B', desc: 'Protecting agricultural land from salinisation through informed management and soil health monitoring.',
    status: 'primary', implemented: true,
  },
  {
    number: 6, title: 'Clean Water', emoji: '💧',
    color: '#26BDE2', desc: 'Supporting awareness of water quality in salt-affected coastal areas for agricultural use.',
    status: 'primary', implemented: true,
  },
  {
    number: 12, title: 'Responsible Consumption', emoji: '♻️',
    color: '#BF8B2E', desc: 'Encouraging efficient input use through crop-specific recommendations, reducing waste and over-application.',
    status: 'secondary', implemented: true,
  },
  {
    number: 4, title: 'Quality Education', emoji: '📚',
    color: '#C5192D', desc: 'Providing accessible, Bangla-language agricultural guidance to improve farmer knowledge and decision-making.',
    status: 'secondary', implemented: true,
  },
  {
    number: 5, title: 'Gender Equality', emoji: '⚖️',
    color: '#FF3A21', desc: 'Platform designed for accessibility and low-literacy users to reach women farmers and marginalised groups.',
    status: 'secondary', implemented: false,
  },
  {
    number: 9, title: 'Innovation & Infrastructure', emoji: '⚙️',
    color: '#FD6925', desc: 'Demonstrating how satellite data and AI can be made accessible for smallholder agriculture in developing regions.',
    status: 'secondary', implemented: true,
  },
  {
    number: 10, title: 'Reduced Inequalities', emoji: '🤝',
    color: '#DD1367', desc: 'SMS and voice advisory features to reach farmers without web access, reducing the digital divide.',
    status: 'secondary', implemented: true,
  },
];

const PILLARS = [
  { icon: '🌿', title: 'Environmental Sustainability', desc: 'Monitor soil and environmental health, track salinity trends, and identify vulnerable agricultural zones.' },
  { icon: '🌊', title: 'Climate Resilience', desc: 'Help farmers adapt to rising sea levels, increased cyclone frequency, and shifting rainfall patterns in coastal Bangladesh.' },
  { icon: '🌾', title: 'Sustainable Agriculture', desc: 'Promote salinity-tolerant crop varieties, responsible input use, and locally verified agronomic knowledge.' },
  { icon: '📱', title: 'Inclusive Innovation', desc: 'Bangla-first design, SMS and voice advisory for non-web users, and low-bandwidth accessibility for marginalised farming communities.' },
];

export default function About() {
  const { t } = useLang();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title={t.about_title} />

      {/* Hero */}
      <Card style={{ background: 'linear-gradient(135deg, #0f3b24 0%, #1a5c38 50%, #0d9488 100%)', border: 'none' }}>
        <div style={{ padding: '8px 0' }}>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>SalinO-Crop</h1>
          <p style={{ color: '#a7f3d0', fontSize: 15, margin: '0 0 16px', lineHeight: 1.6 }}>
            AI-Assisted Salinity Risk Intelligence and Climate-Resilient Crop Planning for Coastal Bangladesh
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['SUSTAINABLE PROJECT COMPETITION - 2026', 'Environmental Sustainability', 'Climate Resilience', 'Satkhira Pilot'].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Problem */}
      <Card>
        <SectionTitle>{t.about_problem}</SectionTitle>
        <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
          <p>Coastal Bangladesh faces accelerating soil salinisation driven by sea-level rise, cyclone-induced tidal flooding, and saltwater aquaculture (shrimp gher) expansion. In districts like Satkhira, Khulna, and Bagerhat, millions of smallholder farmers face crop failures, land abandonment, and food insecurity as salinity renders previously productive fields unsuitable for conventional crops.</p>
          <p>Agricultural extension services are overstretched. Soil EC testing is infrequent and results are rarely communicated in accessible formats. Farmers lack access to salinity-tolerant crop information specific to their local conditions, and most agricultural guidance is available only in English or complex technical formats.</p>
          <p><strong>Key data gap:</strong> While satellite imagery can detect broad vegetation stress, it cannot directly measure root-zone soil salinity. This distinction is critical — and SalinO-Crop is designed to be transparent about it.</p>
        </div>
      </Card>

      {/* Four Pillars */}
      <Card>
        <SectionTitle>{t.about_pillars}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {PILLARS.map((p, i) => (
            <div key={i} style={{
              background: i % 2 === 0 ? '#f0fdf4' : '#f0fdfa',
              borderRadius: 10, padding: '16px',
              border: i % 2 === 0 ? '1px solid #bbf7d0' : '1px solid #99f6e4',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f3b24', marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* SDGs */}
      <Card>
        <SectionTitle>{t.about_sdgs}</SectionTitle>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          SalinO-Crop directly addresses the following SDGs. Implemented status reflects features available in this MVP.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {SDGs.map(sdg => (
            <div key={sdg.number} style={{
              borderRadius: 10, padding: '14px', border: `2px solid ${sdg.color}30`,
              background: `${sdg.color}08`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 22 }}>{sdg.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: sdg.color }}>SDG {sdg.number}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{sdg.title}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: sdg.status === 'primary' ? '#1a5c38' : '#e5e7eb',
                    color: sdg.status === 'primary' ? '#fff' : '#374151',
                  }}>
                    {sdg.status === 'primary' ? 'PRIMARY' : 'SECONDARY'}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: sdg.implemented ? '#dcfce7' : '#fef3c7',
                    color: sdg.implemented ? '#15803d' : '#92400e',
                  }}>
                    {sdg.implemented ? '✓ MVP' : 'PLANNED'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5 }}>{sdg.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Implemented features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <SectionTitle>✅ {t.about_implemented}</SectionTitle>
          <ul style={{ fontSize: 13, color: '#374151', lineHeight: 2, paddingLeft: 18, margin: 0 }}>
            <li>Interactive salinity risk map (Leaflet)</li>
            <li>7 illustrative demonstration field locations</li>
            <li>Crop planning assistant with rules engine</li>
            <li>7 locally referenced crop rules (BRRI, BARI)</li>
            <li>Farm cost & scenario comparison</li>
            <li>Bangla/English bilingual interface</li>
            <li>Bangla advisory generation (3 templates)</li>
            <li>SMS advisory generation & character count</li>
            <li>Voice script generation & TTS preview</li>
            <li>Extension worker dashboard + CSV export</li>
            <li>Climate dashboard (sample dataset)</li>
            <li>Full data methodology documentation</li>
            <li>Transparent data status labels throughout</li>
          </ul>
        </Card>
        <Card>
          <SectionTitle>🔭 {t.about_future}</SectionTitle>
          <ul style={{ fontSize: 13, color: '#374151', lineHeight: 2, paddingLeft: 18, margin: 0 }}>
            <li>Live Sentinel-2 imagery integration</li>
            <li>NASA POWER API live data connection</li>
            <li>Actual soil EC measurements from field surveys</li>
            <li>Trained ML model (when labelled data available)</li>
            <li>Spatially validated salinity heatmaps</li>
            <li>Expansion to Khulna & Bagerhat districts</li>
            <li>SMS gateway integration (Teletalk / Robi API)</li>
            <li>IVR / community radio voice delivery</li>
            <li>User-submitted farm observations</li>
            <li>Offline-capable Progressive Web App</li>
            <li>Supabase database for persistent data</li>
            <li>Farmer consent and data protection system</li>
          </ul>
        </Card>
      </div>

      {/* Team */}
      <Card style={{ background: 'linear-gradient(135deg, #f0fdf4, #f0fdfa)', border: '1px solid #bbf7d0' }}>
        <SectionTitle>{t.about_team}</SectionTitle>
        <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
          <p>SalinO-Crop was developed for the <strong>SUSTAINABLE PROJECT COMPETITION - 2026</strong> under the <strong>Environmental Sustainability and Climate Resilience</strong> track.</p>
          <p>The project addresses a real and urgent challenge facing millions of smallholder farmers in coastal Bangladesh, where salinity is one of the fastest-growing threats to food security and agricultural livelihoods.</p>
          <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
            Built with: React · TypeScript · Tailwind CSS · Leaflet · Recharts · Bangla (Hind Siliguri) typography
          </div>
        </div>
      </Card>
    </div>
  );
}
