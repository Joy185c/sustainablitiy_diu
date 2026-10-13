import { useState } from 'react';
import { ChevronRight, MapPinned, FileSearch } from 'lucide-react';
import FarmSelector from '../farms/FarmSelector';
import FarmDetailsForm from '../farms/FarmDetailsForm';
import FormBasedSelector from '../farms/FormBasedSelector';

type Method = null | 'map' | 'form';
type Step = 'method' | 'map' | 'form-fill' | 'form-confirm' | 'details';

export default function NewFarmPage() {
  const [method, setMethod] = useState<Method>(null);
  const [step, setStep] = useState<Step>('method');
  const [points, setPoints] = useState<[number, number][]>([]);

  const handleMapComplete = (pts: [number, number][]) => {
    setPoints(pts);
    setStep('details');
  };

  const handleFormDetect = (pts: [number, number][]) => {
    setPoints(pts);
    setStep('details');
  };

  // Stepper labels
  const steps: { key: Step; label: string }[] = method === 'map'
    ? [{ key: 'map', label: 'Draw Boundary' }, { key: 'details', label: 'Farm Details' }]
    : [{ key: 'form-fill', label: 'Location Info' }, { key: 'form-confirm', label: 'Confirm Area' }, { key: 'details', label: 'Farm Details' }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Stepper header */}
      {step !== 'method' && (
        <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, maxWidth: 600 }}>
            {steps.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
                <StepPill label={s.label} active={step === s.key} done={steps.findIndex(x => x.key === step) > i} num={i + 1} />
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: steps.findIndex(x => x.key === step) > i ? '#1a5c38' : '#e5e7eb', margin: '0 4px', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: step === 'details' || step === 'form-fill' || step === 'form-confirm' ? 'auto' : 'hidden' }}>
        {step === 'method' && <MethodSelector onSelect={(m) => { setMethod(m); setStep(m === 'map' ? 'map' : 'form-fill'); }} />}
        {step === 'map' && <FarmSelector initialPoints={points} onComplete={handleMapComplete} />}
        {(step === 'form-fill' || step === 'form-confirm') && (
          <FormBasedSelector
            onComplete={handleFormDetect}
            onBack={() => setStep('method')}
            step={step}
            onStepChange={setStep}
          />
        )}
        {step === 'details' && (
          <FarmDetailsForm
            points={points}
            onBack={() => method === 'map' ? setStep('map') : setStep('form-confirm')}
          />
        )}
      </div>
    </div>
  );
}

function MethodSelector({ onSelect }: { onSelect: (m: Method) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 32 }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #0f3b24, #1a5c38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapPinned size={26} color="#6ee7b7" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f3b24', marginBottom: 10 }}>Add Your Farm</h2>
        <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.7 }}>
          Choose how you'd like to identify your farmland. Both methods result in accurate location and area data.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%', maxWidth: 680 }}>
        {/* Option 1 */}
        <button onClick={() => onSelect('map')} style={{ all: 'unset', cursor: 'pointer' }}>
          <div style={{
            border: '2px solid #e5e7eb', borderRadius: 18, padding: '28px 24px',
            background: '#fff', textAlign: 'left', transition: 'all 0.2s ease',
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a5c38'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(26,92,56,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #0f3b24, #1a5c38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPinned size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#0f3b24', marginBottom: 6 }}>Draw on Map</div>
              <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7 }}>
                Navigate to your farm on an interactive satellite map and click to draw the exact boundary. Best for accurate area calculation.
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['🗺 Satellite view', '✏️ Click to draw', '📐 Auto area'].map(t => (
                <span key={t} style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', borderRadius: 20, padding: '3px 9px', border: '1px solid #bbf7d0' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1a5c38', fontWeight: 700, fontSize: 13.5 }}>
              Select & Draw <ChevronRight size={16} />
            </div>
          </div>
        </button>

        {/* Option 2 */}
        <button onClick={() => onSelect('form')} style={{ all: 'unset', cursor: 'pointer' }}>
          <div style={{
            border: '2px solid #e5e7eb', borderRadius: 18, padding: '28px 24px',
            background: '#fff', textAlign: 'left', transition: 'all 0.2s ease',
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0d9488'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(13,148,136,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #0d9488, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSearch size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#0f3b24', marginBottom: 6 }}>Fill Location Form</div>
              <div style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7 }}>
                Enter your village, upazila, or land record details. The system will automatically detect your land location on the map.
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Fill form', 'Auto-detect location', 'Confirm & save'].map(t => (
                <span key={t} style={{ fontSize: 11, background: '#f0fdfa', color: '#0f766e', borderRadius: 20, padding: '3px 9px', border: '1px solid #99f6e4' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0d9488', fontWeight: 700, fontSize: 13.5 }}>
              Fill Form <ChevronRight size={16} />
            </div>
          </div>
        </button>
      </div>

      <div style={{ fontSize: 12.5, color: '#9ca3af', textAlign: 'center', maxWidth: 400 }}>
        Tip: The "Fill Form" option works great if you know your village name, upazila, or land record numbers (Dag/JL).
      </div>
    </div>
  );
}

function StepPill({ label, active, done, num }: { label: string; active: boolean; done: boolean; num: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, background: done ? '#1a5c38' : active ? '#f0fdf4' : '#f9fafb', border: `2px solid ${done ? '#1a5c38' : active ? '#1a5c38' : '#e5e7eb'}`, color: done ? '#fff' : active ? '#1a5c38' : '#9ca3af' }}>
        {done ? '✓' : num}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? '#1a5c38' : done ? '#374151' : '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}
