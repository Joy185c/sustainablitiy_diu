import { useState } from 'react';
import { Printer, Copy, CheckCheck } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { ADVISORY_TEMPLATES } from '../data/mockData';
import type { AdvisoryTemplate, RiskLevel } from '../data/mockData';
import {
  Card, PageHeader, DemoBanner, SectionTitle, Button,
  FormGroup, Select, DataStatusBadge
} from '../components/ui';

export default function Advisory() {
  const { t, lang } = useLang();
  const [risk, setRisk] = useState<RiskLevel>('moderate');
  const [season, setSeason] = useState('rabi');
  const [generated, setGenerated] = useState<AdvisoryTemplate | null>(null);
  const [displayLang, setDisplayLang] = useState<'en' | 'bn'>('bn');
  const [copied, setCopied] = useState(false);

  function generate() {
    const match = ADVISORY_TEMPLATES.find(a => a.risk === risk && a.season === season)
      || ADVISORY_TEMPLATES[0];
    setGenerated(match);
    setCopied(false);
  }

  function handleCopy() {
    if (!generated) return;
    const text = displayLang === 'bn' ? generated.text_bn : generated.text_en;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  const riskColor = { low: '#16a34a', moderate: '#d97706', high: '#dc2626' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title={t.advisory_title} subtitle={t.advisory_subtitle} />

      <DemoBanner text="Advisory text uses locally verified agronomic information and illustrative demonstration data. Consult a local agricultural extension officer before making planting decisions." />

      <div style={{ display: 'grid', gridTemplateColumns: generated ? '320px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* Controls */}
        <Card>
          <SectionTitle>Advisory Parameters</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormGroup label={t.advisory_risk_level}>
              <Select value={risk} onChange={e => setRisk(e.target.value as RiskLevel)}>
                <option value="low">Low Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="high">High Risk</option>
              </Select>
            </FormGroup>

            <FormGroup label="Season">
              <Select value={season} onChange={e => setSeason(e.target.value)}>
                <option value="kharif">Kharif (Jun–Oct)</option>
                <option value="rabi">Rabi (Nov–Feb)</option>
              </Select>
            </FormGroup>

            <FormGroup label={t.advisory_language}>
              <Select value={displayLang} onChange={e => setDisplayLang(e.target.value as 'en' | 'bn')}>
                <option value="bn">বাংলা (Bangla)</option>
                <option value="en">English</option>
              </Select>
            </FormGroup>

            <Button
              variant="primary" size="lg"
              onClick={generate}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {t.advisory_generate}
            </Button>
          </div>
        </Card>

        {/* Advisory output */}
        {generated && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Action bar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <><CheckCheck size={13} /> {t.advisory_copied}</> : <><Copy size={13} /> {t.advisory_copy}</>}
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint}>
                <Printer size={13} /> {t.advisory_print}
              </Button>
              <DataStatusBadge status="demonstration" />
            </div>

            {/* Advisory card */}
            <Card style={{
              borderLeft: `4px solid ${riskColor[generated.risk]}`,
              background: '#fafafa',
            }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: '#111827', marginBottom: 4 }}>
                    {lang === 'bn' ? t.advisory_title : 'Agricultural Advisory'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      background: `${riskColor[generated.risk]}15`, color: riskColor[generated.risk],
                      border: `1px solid ${riskColor[generated.risk]}40`,
                      borderRadius: 5, padding: '2px 8px', fontSize: 11.5, fontWeight: 700
                    }}>
                      {generated.risk.toUpperCase()} RISK
                    </span>
                    <span style={{ fontSize: 11.5, color: '#6b7280', padding: '2px 8px', border: '1px solid #e5e7eb', borderRadius: 5 }}>
                      {generated.season.toUpperCase()} SEASON
                    </span>
                    {generated.crop && (
                      <span style={{ fontSize: 11.5, color: '#0d9488', padding: '2px 8px', border: '1px solid #99f6e4', borderRadius: 5, background: '#f0fdfa' }}>
                        {generated.crop}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  whiteSpace: 'pre-wrap', fontSize: 13.5, lineHeight: 1.8,
                  color: '#111827',
                  fontFamily: displayLang === 'bn' ? "'Hind Siliguri', sans-serif" : "'Inter', sans-serif",
                  background: '#fff', borderRadius: 8, padding: '16px', border: '1px solid #e5e7eb',
                }}
              >
                {displayLang === 'bn' ? generated.text_bn : generated.text_en}
              </div>
            </Card>

            {/* Metadata */}
            <Card>
              <SectionTitle>Advisory Metadata</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <MetaItem label={t.advisory_confidence} value={generated.confidence} />
                <MetaItem label={t.advisory_limitations} value={generated.limitations} />
                <MetaItem label="Language" value={displayLang === 'bn' ? 'বাংলা' : 'English'} />
                <MetaItem label="Generated" value={new Date().toLocaleDateString()} />
              </div>
            </Card>

            {/* Print-only header */}
            <div className="print-only" style={{ display: 'none', marginBottom: 16 }}>
              <h2>SalinO-Crop Agricultural Advisory</h2>
              <p>District: Satkhira, Bangladesh | Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick reference */}
      <Card>
        <SectionTitle>Advisory Categories Available</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {ADVISORY_TEMPLATES.map(a => (
            <div
              key={`${a.risk}-${a.season}`}
              style={{
                padding: '12px 14px', borderRadius: 8,
                border: `1px solid ${riskColor[a.risk]}30`,
                background: `${riskColor[a.risk]}05`,
                cursor: 'pointer',
              }}
              onClick={() => { setRisk(a.risk); setSeason(a.season); generate(); }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: riskColor[a.risk], marginBottom: 4, textTransform: 'capitalize' }}>
                {a.risk} Risk · {a.season}
              </div>
              {a.crop && <div style={{ fontSize: 12, color: '#6b7280' }}>Crop: {a.crop}</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}
