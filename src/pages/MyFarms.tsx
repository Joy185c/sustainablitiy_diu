import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Eye, Edit, Map, Sprout, LayoutGrid, List } from 'lucide-react';
import { useFarms } from '../farms/FarmsContext';
import { Card, PageHeader, StatCard, Button, DemoBanner } from '../components/ui';

type SortKey = 'name' | 'area' | 'updatedAt';

export default function MyFarmsPage() {
  const { farms, deleteFarm } = useFarms();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = farms
    .filter(f => {
      const q = search.toLowerCase();
      return !q || f.name.toLowerCase().includes(q) || f.village.toLowerCase().includes(q) || f.upazila.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'area') return (b.estimatedArea ?? 0) - (a.estimatedArea ?? 0);
      return b.updatedAt.localeCompare(a.updatedAt);
    });


  const handleDelete = (id: string) => {
    deleteFarm(id);
    setDeleteConfirm(null);
  };

  // ── Empty state
  if (farms.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader title="My Farms" subtitle="Register and manage your farmland locations" />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px', textAlign: 'center',
          background: '#fff', borderRadius: 16, border: '2px dashed #d1d5db',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌾</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0f3b24', marginBottom: 8 }}>No Farms Registered Yet</div>
          <div style={{ fontSize: 14, color: '#6b7280', maxWidth: 380, lineHeight: 1.7, marginBottom: 28 }}>
            Add your first farm to get personalized salinity analysis, crop recommendations, and boundary tracking.
          </div>
          <Button variant="primary" onClick={() => navigate('/my-farms/new')} style={{ padding: '13px 28px', fontSize: 15 }}>
            <Plus size={16} /> Add Your First Farm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="My Farms"
        subtitle={`${farms.length} registered farm${farms.length > 1 ? 's' : ''} · stored locally in this browser`}
        actions={
          <Button variant="primary" onClick={() => navigate('/my-farms/new')}>
            <Plus size={14} /> Add New Farm
          </Button>
        }
      />

      <DemoBanner text="Farm records are stored in your browser's local storage. Clearing browser data will remove them. No data is sent to any server." />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon={<span style={{ fontSize: 20 }}>🌾</span>} label="Total Farms" value={farms.length} color="#1a5c38" sub="Registered in this browser" />
        <StatCard icon={<span style={{ fontSize: 20 }}>📐</span>} label="With Boundaries" value={farms.filter(f => f.polygonGeometry).length} color="#0d9488" sub="Have drawn polygon" />
        <StatCard icon={<Sprout size={18} color="#d97706" />} label="With Crop Info" value={farms.filter(f => f.primaryCrop).length} color="#d97706" sub="Primary crop set" />
        <StatCard icon={<span style={{ fontSize: 20 }}>🧪</span>} label="With EC Data" value={farms.filter(f => f.soilSalinityEC).length} color="#7c3aed" sub="Soil EC provided" />
      </div>

      {/* Controls */}
      <Card padding="12px 16px">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px' }}>
            <Search size={14} color="#9ca3af" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search farms..."
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13.5, width: '100%', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#6b7280' }}>Sort:</span>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
              style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="updatedAt">Last Updated</option>
              <option value="name">Name</option>
              <option value="area">Area</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {[{ v: 'grid', Icon: LayoutGrid }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
              <button key={v} onClick={() => setViewMode(v as 'grid' | 'list')}
                style={{ padding: '6px 8px', borderRadius: 7, border: `1px solid ${viewMode === v ? '#1a5c38' : '#e5e7eb'}`, background: viewMode === v ? '#f0fdf4' : '#fff', cursor: 'pointer', color: viewMode === v ? '#1a5c38' : '#9ca3af' }}>
                <Icon size={15} />
              </button>
            ))}
          </div>

          <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} farm{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </Card>

      {/* Farm list / grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 14 }}>No farms match your search.</div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(farm => (
            <FarmCard key={farm.id} farm={farm}
              onView={() => navigate(`/my-farms/${farm.id}`)}
              onEdit={() => navigate(`/my-farms/${farm.id}/edit`)}
              onMap={() => navigate(`/my-farms/${farm.id}`)}
              onDelete={() => setDeleteConfirm(farm.id)}
            />
          ))}
        </div>
      ) : (
        <Card padding={0}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                {['Farm', 'Location', 'Area', 'Crop', 'Updated', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11.5, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((farm, i) => (
                <tr key={farm.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{farm.name}</td>
                  <td style={{ padding: '10px 14px', color: '#4b5563', fontSize: 12 }}>{farm.village}, {farm.upazila}</td>
                  <td style={{ padding: '10px 14px', color: '#1a5c38', fontWeight: 600, fontSize: 12 }}>
                    {farm.estimatedArea ? `${farm.estimatedArea.toFixed(2)} ${farm.estimatedAreaUnit}` : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>{farm.primaryCrop || '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 11.5, color: '#9ca3af' }}>{new Date(farm.updatedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => navigate(`/my-farms/${farm.id}`)} title="View" style={btnStyle('#0d9488')}><Eye size={13} /></button>
                      <button onClick={() => navigate(`/my-farms/${farm.id}/edit`)} title="Edit" style={btnStyle('#374151')}><Edit size={13} /></button>
                      <button onClick={() => setDeleteConfirm(farm.id)} title="Delete" style={btnStyle('#dc2626')}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setDeleteConfirm(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: '28px 32px', maxWidth: 380, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 10 }}>Delete Farm?</div>
            <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
              This will permanently remove <strong>"{farms.find(f => f.id === deleteConfirm)?.name}"</strong> and its boundary data from your browser. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm!)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 13.5, fontWeight: 700 }}>Delete Farm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (color: string): React.CSSProperties => ({
  background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 6,
  padding: '5px', cursor: 'pointer', color, display: 'flex', alignItems: 'center',
});

function FarmCard({ farm, onView, onEdit, onMap, onDelete }: {
  farm: ReturnType<typeof import('../farms/FarmsContext').useFarms>['farms'][0];
  onView: () => void; onEdit: () => void; onMap: () => void; onDelete: () => void;
}) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 3 }}>{farm.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{farm.village} · {farm.upazila} · {farm.district}</div>
        </div>
        <button onClick={onDelete} style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 7, padding: '5px', cursor: 'pointer', color: '#dc2626' }}>
          <Trash2 size={13} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Chip label="Est. Area" value={farm.estimatedArea ? `${farm.estimatedArea.toFixed(2)} ${farm.estimatedAreaUnit}` : '—'} />
        <Chip label="Crop" value={farm.primaryCrop || '—'} />
        <Chip label="Boundary" value={farm.polygonGeometry ? '✓ Saved' : '—'} color={farm.polygonGeometry ? '#16a34a' : undefined} />
        <Chip label="Soil EC" value={farm.soilSalinityEC ? `${farm.soilSalinityEC} dS/m` : '—'} />
      </div>

      <div style={{ fontSize: 11, color: '#9ca3af' }}>Updated {new Date(farm.updatedAt).toLocaleDateString()}</div>

      <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
        <button onClick={onView} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Eye size={13} /> View
        </button>
        <button onClick={onEdit} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 12.5, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Edit size={13} /> Edit
        </button>
        <button onClick={onMap} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', fontSize: 12.5, color: '#1a5c38', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Map size={13} /> Map
        </button>
      </div>
    </Card>
  );
}

function Chip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 7, padding: '7px 10px' }}>
      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: color || '#111827' }}>{value}</div>
    </div>
  );
}
