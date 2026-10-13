import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFarms } from '../farms/FarmsContext';
import {
  calcGeodesicAreaM2, calcPerimeterM, convertArea,
} from '../farms/farmTypes';
import type { GeoJsonPolygon } from '../farms/farmTypes';
import FarmSelector from '../farms/FarmSelector';

export default function EditBoundaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFarm, updateFarm } = useFarms();
  const farm = getFarm(id!);
  const [saved, setSaved] = useState(false);

  if (!farm) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Farm not found.</div>;
  }

  // Convert existing GeoJSON [lng,lat] back to [lat,lng] for the selector
  const initialPoints: [number, number][] = farm.polygonGeometry
    ? farm.polygonGeometry.coordinates[0]
        .slice(0, -1) // Remove the closing point (same as first)
        .map(([lng, lat]) => [lat, lng])
    : [];

  const handleComplete = (points: [number, number][]) => {
    const geoCoords: [number, number][] = points.map(([lat, lng]) => [lng, lat]);
    const areaM2 = calcGeodesicAreaM2(geoCoords);
    const perimM = calcPerimeterM(geoCoords);
    const centLat = points.reduce((s, [lat]) => s + lat, 0) / points.length;
    const centLng = points.reduce((s, [, lng]) => s + lng, 0) / points.length;

    const polygon: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [[...geoCoords, geoCoords[0]]],
    };

    updateFarm(farm.id, {
      polygonGeometry: polygon,
      centroidLatitude: centLat,
      centroidLongitude: centLng,
      estimatedArea: convertArea(areaM2, farm.estimatedAreaUnit),
      perimeterMeters: perimM,
    });

    setSaved(true);
    setTimeout(() => navigate(`/my-farms/${farm.id}`), 900);
  };

  if (saved) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12, fontSize: 18, fontWeight: 700, color: '#1a5c38' }}>
        ✓ Boundary Updated! Redirecting…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => navigate(`/my-farms/${farm.id}`)}
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#374151' }}>
          ← Cancel
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#0f3b24' }}>Edit Boundary — {farm.name}</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <FarmSelector initialPoints={initialPoints} onComplete={handleComplete} />
      </div>
    </div>
  );
}
