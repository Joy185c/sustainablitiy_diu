import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, X, Leaf } from 'lucide-react';
import { useFarms } from '../farms/FarmsContext';

export default function OnboardingModal() {
  const { farms, onboardingDone, dismissOnboarding } = useFarms();
  const navigate = useNavigate();

  const show = !onboardingDone && farms.length === 0;

  // Trap focus inside modal when open
  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissOnboarding();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [show, dismissOnboarding]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,59,36,0.72)', backdropFilter: 'blur(4px)' }}
        onClick={dismissOnboarding}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        maxWidth: 480, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
        animation: 'fadeInScale 0.22s ease',
      }}>
        {/* Close button */}
        <button
          onClick={dismissOnboarding}
          aria-label="Dismiss"
          style={{
            position: 'absolute', top: 16, right: 16,
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6b7280',
          }}
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #0f3b24 0%, #0d9488 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, boxShadow: '0 8px 20px rgba(13,148,136,0.3)',
        }}>
          <MapPin size={30} color="#fff" />
        </div>

        {/* Text */}
        <h2 id="onboard-title" style={{ fontSize: 22, fontWeight: 800, color: '#0f3b24', marginBottom: 10, lineHeight: 1.3 }}>
          Let's Locate Your Farm
        </h2>
        <p style={{ fontSize: 14.5, color: '#4b5563', lineHeight: 1.7, marginBottom: 24 }}>
          Select your farmland on the map to get personalized salinity forecasts and crop recommendations tailored to your exact location.
        </p>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {['🗺 Draw farm boundary', '📐 Auto area calculation', '🌱 Crop recommendations', '💾 Saved locally'].map(f => (
            <span key={f} style={{
              fontSize: 11.5, background: '#f0fdf4', color: '#166534',
              border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 10px', fontWeight: 500,
            }}>{f}</span>
          ))}
        </div>

        {/* Actions */}
        <button
          id="onboard-primary"
          onClick={() => { dismissOnboarding(); navigate('/my-farms/new'); }}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #1a5c38 0%, #0d9488 100%)',
            color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
            cursor: 'pointer', marginBottom: 10,
            boxShadow: '0 6px 20px rgba(26,92,56,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.15s ease',
          }}
        >
          <MapPin size={17} /> Select My Farm
        </button>
        <button
          onClick={dismissOnboarding}
          style={{
            width: '100%', padding: '11px 20px', borderRadius: 12,
            background: '#f9fafb', border: '1px solid #e5e7eb',
            color: '#374151', fontWeight: 500, fontSize: 14,
            cursor: 'pointer',
          }}
        >
          I'll Do This Later
        </button>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9ca3af', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Leaf size={12} color="#6ee7b7" />
          You can add and manage multiple farms anytime from <strong style={{ color: '#1a5c38' }}>&nbsp;My Farms</strong>.
        </p>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
