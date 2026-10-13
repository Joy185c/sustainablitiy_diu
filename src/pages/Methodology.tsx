import { ExternalLink } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { Card, PageHeader, SectionTitle, DataStatusBadge } from '../components/ui';

export default function Methodology() {
  const { t } = useLang();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader title={t.meth_title} />

      {/* Purpose */}
      <Card>
        <SectionTitle>{t.meth_purpose}</SectionTitle>
        <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
          <p>SalinO-Crop is a prototype agricultural intelligence platform designed to help coastal Bangladeshi farmers, extension workers, and policymakers understand salinity-related agricultural risks and make better-informed crop-planning decisions.</p>
          <p>The platform combines satellite-derived environmental indicators, locally verified crop-suitability rules, seasonal context, and user-provided farm conditions to generate crop recommendations, risk maps, and bilingual advisories.</p>
          <p><strong>Pilot region:</strong> Satkhira District, Bangladesh. Future expansion planned for Khulna and Bagerhat.</p>
        </div>
      </Card>

      {/* Data Quality Labels */}
      <Card>
        <SectionTitle>{t.meth_quality_labels}</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {([
            ['measured',              'Direct soil EC measurement by a certified instrument at a specific field and date.'],
            ['satellite_derived',     'Derived from satellite imagery analysis (e.g., Sentinel-2 spectral indices). Not a direct measurement.'],
            ['model_estimate',        'Estimate from a statistical or process-based model. Subject to model assumptions and uncertainty.'],
            ['demonstration',         'Illustrative values used in this MVP demonstration. Not real field measurements.'],
            ['unavailable',           'Data not yet available for this variable or location.'],
            ['requires_verification', 'Preliminary indicator that has not been validated with ground truth.'],
          ] as const).map(([status, desc]) => (
            <div key={status} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <DataStatusBadge status={status} />
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Sources */}
      <Card>
        <SectionTitle>{t.meth_sources}</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                {['Source', 'Type', 'Variables', 'Resolution', 'Status', 'URL'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11.5, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Copernicus Data Space / Sentinel-2', 'Satellite imagery', 'NDVI, SWIR bands, spectral proxies', '10 m (VIS/NIR), 20 m (SWIR)', 'Not integrated (Demo)', 'https://dataspace.copernicus.eu'],
                ['Sentinel-1 SAR', 'Satellite SAR', 'Waterlogging fraction, inundation extent', '10 m', 'Not integrated (Demo)', 'https://dataspace.copernicus.eu'],
                ['NASA POWER', 'Meteorological', 'Rainfall, temperature, humidity, wind', 'Regional (~50 km)', 'Sample dataset', 'https://power.larc.nasa.gov'],
                ['BRRI (Bangladesh Rice Research Institute)', 'Crop science', 'Rice variety salinity tolerance, cultivation guides', 'National', 'Reference data used', 'https://brri.gov.bd'],
                ['BARI (Bangladesh Agricultural Research Institute)', 'Crop science', 'Oilseed & vegetable variety data', 'National', 'Reference data used', 'https://bari.gov.bd'],
                ['BARC Crop Zoning Map 2023', 'Agricultural planning', 'District-level crop suitability zones', 'District', 'Reference data used', 'https://barc.gov.bd'],
                ['DAE Bangladesh', 'Extension data', 'Field advisory bulletins, crop calendars', 'Upazila', 'Reference data used', 'https://dae.gov.bd'],
                ['WorldFish / CGIAR', 'Aquaculture', 'Integrated mangrove-aquaculture systems', 'Regional', 'Reference only', 'https://www.worldfishcenter.org'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 500, color: '#111827', fontSize: 12.5 }}>{row[0]}</td>
                  <td style={{ padding: '9px 12px', color: '#374151' }}>{row[1]}</td>
                  <td style={{ padding: '9px 12px', color: '#374151' }}>{row[2]}</td>
                  <td style={{ padding: '9px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{row[3]}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <DataStatusBadge status={row[4].includes('Demo') || row[4].includes('Sample') ? 'demonstration' : 'requires_verification'} bn={row[4]} />
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    <a href={row[5]} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#1a5c38', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExternalLink size={11} /> Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Methodology */}
      <Card>
        <SectionTitle>Model Methods Implemented</SectionTitle>
        <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
          <p><strong>Crop Suitability Engine:</strong> A transparent rules-based system using crop-specific salinity tolerance thresholds sourced from BRRI, BARI, and BARC publications. Crops are scored and ranked based on user-provided soil EC, water availability, season, and farmer priority. This is not a trained machine learning model. It is a deterministic rules engine with configurable thresholds.</p>
          <p><strong>Risk Indexing:</strong> The salinity risk index displayed on the dashboard and maps is a composite illustrative indicator derived from satellite spectral proxies, regional flooding history, and known agricultural patterns. It is presented as an indicative tool only and does not constitute a scientifically validated predictive model.</p>
          <p><strong>Satellite Bands Used (If Integrated):</strong> Sentinel-2 bands B4 (Red, 10 m), B8 (NIR, 10 m), B11 and B12 (SWIR, 20 m). Note that SWIR bands at 20 m resolution are used for spectral salinity proxies. All imagery would require atmospheric correction (L2A level) before use.</p>
          <p><strong>What we do NOT claim:</strong> No trained ML model exists in this MVP. No 90-day salinity forecasting. Satellite bands do not directly measure root-zone soil EC. No claim is made that coloured map markers constitute a validated heatmap.</p>
        </div>
      </Card>

      {/* Limitations */}
      <Card>
        <SectionTitle>{t.meth_limitations}</SectionTitle>
        <ul style={{ fontSize: 13.5, color: '#374151', lineHeight: 2, paddingLeft: 20 }}>
          <li>All field data in this MVP is demonstration data. No real field EC measurements are used.</li>
          <li>Satellite imagery has not been downloaded or processed. Spectral indicators are illustrative.</li>
          <li>The risk index is not validated against independent ground truth measurements.</li>
          <li>Crop recommendations are based on published tolerance thresholds, not locally calibrated models.</li>
          <li>Weather data uses a sample dataset in NASA POWER format, not live API calls.</li>
          <li>The platform currently covers Satkhira District only. Expansion to Khulna and Bagerhat is planned.</li>
          <li>Recommendations support, but do not replace, local agricultural expertise and extension advice.</li>
          <li>Salinity conditions in coastal Bangladesh change dynamically with tides, cyclones, and seasonal rainfall. Static indicators can become stale quickly.</li>
        </ul>
      </Card>

      {/* Validation Status */}
      <Card>
        <SectionTitle>{t.meth_validation}</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fef9c3', borderRadius: 8, padding: '14px', border: '1px solid #fde047' }}>
            <div style={{ fontWeight: 700, color: '#713f12', marginBottom: 6 }}>Not Yet Validated</div>
            <ul style={{ fontSize: 12.5, color: '#713f12', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
              <li>Crop suitability rules vs. on-farm outcomes</li>
              <li>Satellite spectral proxies vs. measured EC</li>
              <li>Risk index vs. independent reference data</li>
            </ul>
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '14px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: 6 }}>Sourced from Validated References</div>
            <ul style={{ fontSize: 12.5, color: '#166534', lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
              <li>BRRI variety salinity tolerance data</li>
              <li>BARI oilseed crop guidance</li>
              <li>BARC District crop zoning maps</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <SectionTitle>{t.meth_privacy}</SectionTitle>
        <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>
          <p>This prototype does not collect or store any personal data. All data entered in the crop planner or farm planner forms is processed locally in the browser and not transmitted to any server.</p>
          <p>No farmer phone numbers, precise GPS coordinates, or identifying information are collected. The map markers use illustrative coordinates at approximate village-level locations, not precise farm boundaries.</p>
          <p>In a production deployment, any real farmer data collection would require explicit consent, clear purpose limitation, and compliance with Bangladesh's Digital Security Act and applicable data protection regulations.</p>
        </div>
      </Card>
    </div>
  );
}
