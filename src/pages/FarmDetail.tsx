import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit, Trash2, ArrowLeft, MapPin, Sprout, Maximize2, ExternalLink } from 'lucide-react';
import { useFarms } from '../farms/FarmsContext';
import { fmtArea } from '../farms/farmTypes';
import { Card, SectionTitle, Button } from '../components/ui';

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFarm, deleteFarm } = useFarms();
  const [showDelete, setShowDelete] = useState(false);

  const farm = getFarm(id!);

  if (!farm) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🌾</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Farm Not Found</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>This farm may have been deleted or the ID is incorrect.</div>
        <Button variant="primary" onClick={() => navigate('/my-farms')}>← Back to My Farms</Button>
      </div>
    );
  }

  // Extract polygon coordinates [lat,lng] for Leaflet
  const leafletPoints: [number, number][] = farm.polygonGeometry
    ? farm.polygonGeometry.coordinates[0].map(([lng, lat]) => [lat, lng])
    : [];

  const handleDelete = () => {
    deleteFarm(farm.id);
    navigate('/my-farms');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/my-farms')}
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', flexShrink: 0 }}>
          <ArrowLeft size={14} /> My Farms
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f3b24', lineHeight: 1.2 }}>{farm.name}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
            {farm.village}, {farm.upazila}, {farm.district}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => navigate(`/my-farms/${farm.id}/edit`)}>
            <Edit size={14} /> Edit Farm
          </Button>
          <Button variant="ghost" onClick={() => setShowDelete(true)} style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      {/* Map */}
      {leafletPoints.length >= 3 && farm.centroidLatitude && farm.centroidLongitude ? (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ height: 380, position: 'relative' }}>
            <MapContainer
              center={[farm.centroidLatitude, farm.centroidLongitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri — Source: Esri, Maxar"
                maxZoom={19}
              />
              <Polygon
                positions={leafletPoints}
                pathOptions={{ color: '#1a5c38', fillColor: '#16a34a', fillOpacity: 0.25, weight: 3 }}
              />
              {leafletPoints.map(([lat, lng], i) => (
                <CircleMarker key={i} center={[lat, lng]} radius={5}
                  pathOptions={{ color: '#fff', fillColor: '#1a5c38', fillOpacity: 1, weight: 2 }} />
              ))}
            </MapContainer>
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 500 }}>
              <button
                onClick={() => navigate(`/my-farms/${farm.id}/edit-boundary`)}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Maximize2 size={13} /> Edit Boundary
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: '32px', background: '#f9fafb' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
          <div style={{ fontWeight: 600, color: '#374151', marginBottom: 8 }}>No Boundary Saved</div>
          <Button variant="secondary" onClick={() => navigate(`/my-farms/${farm.id}/edit-boundary`)}>
            Draw Farm Boundary
          </Button>
        </Card>
      )}

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <MetricCard label="Estimated Area" value={farm.estimatedArea ? fmtArea(farm.estimatedArea * getM2Factor(farm.estimatedAreaUnit), farm.estimatedAreaUnit) : '—'} icon="📐" />
        <MetricCard label="Perimeter" value={farm.perimeterMeters ? `${(farm.perimeterMeters / 1000).toFixed(3)} km` : '—'} icon="📏" />
        <MetricCard label="Boundary Points" value={`${leafletPoints.length}`} icon="📍" />
        {farm.recordedArea && (
          <MetricCard label="Recorded Area" value={`${farm.recordedArea} ${farm.recordedAreaUnit}`} icon="📋" />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Farm info */}
        <Card>
          <SectionTitle>Farm Information</SectionTitle>
          <InfoTable rows={[
            ['District', farm.district],
            ['Upazila', farm.upazila],
            ['Village', farm.village],
            farm.mouzaName ? ['Mouza', farm.mouzaName] : null,
            farm.dagNumber ? ['Dag No.', farm.dagNumber] : null,
            farm.jlNumber ? ['JL No.', farm.jlNumber] : null,
            farm.khatianNumber ? ['Khatian', farm.khatianNumber] : null,
            farm.surveyType && farm.surveyType !== 'Unknown' ? ['Survey Type', farm.surveyType] : null,
          ].filter(Boolean) as [string, string][]} />
        </Card>

        {/* Agronomy */}
        <Card>
          <SectionTitle>Agronomic Info</SectionTitle>
          <InfoTable rows={[
            ['Primary Crop', farm.primaryCrop || '—'],
            ['Soil EC (dS/m)', farm.soilSalinityEC ? `${farm.soilSalinityEC} dS/m (user-provided)` : '—'],
            ['Centroid Lat', farm.centroidLatitude?.toFixed(5) || '—'],
            ['Centroid Lng', farm.centroidLongitude?.toFixed(5) || '—'],
            ['Created', new Date(farm.createdAt).toLocaleDateString()],
            ['Updated', new Date(farm.updatedAt).toLocaleDateString()],
          ]} />
          {farm.notes && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#4b5563', background: '#f9fafb', borderRadius: 8, padding: '10px 12px', border: '1px solid #f3f4f6', lineHeight: 1.6 }}>
              <strong>Notes:</strong> {farm.notes}
            </div>
          )}
        </Card>
      </div>

      {/* CTA: Go to Crop Planner with this farm pre-selected */}
      <Card style={{ background: 'linear-gradient(135deg, #0f3b24 0%, #1a5c38 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              <Sprout size={16} style={{ display: 'inline', marginRight: 7 }} />
              Get Crop Recommendations for This Farm
            </div>
            <div style={{ fontSize: 13, color: '#a7f3d0', lineHeight: 1.6 }}>
              Use the Crop Planning tool with this farm's district, upazila
              {farm.soilSalinityEC ? ` and soil EC of ${farm.soilSalinityEC} dS/m` : ''} pre-filled.
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/crop-planner')}
            style={{ background: '#fff', color: '#1a5c38', border: 'none', fontWeight: 700 }}
          >
            <ExternalLink size={14} /> Open Crop Planner
          </Button>
        </div>
      </Card>

      {/* Delete confirm */}
      {showDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowDelete(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 380, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 10 }}>Delete "{farm.name}"?</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
              This will permanently remove this farm and all its boundary data from your browser. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDelete(false)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Delete Farm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getM2Factor(unit: string) {
  switch (unit) {
    case 'bigha':   return 1338.0;
    case 'decimal': return 40.4686;
    case 'acre':    return 4046.856;
    case 'hectare': return 10000;
    default:        return 1;
  }
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Card style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{label}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{value}</div>
      </div>
    </Card>
  );
}

function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {rows.map(([label, value], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
          <span style={{ fontSize: 12.5, color: '#6b7280' }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        </div>
      ))}
    </div>
  );
}
