import { ReactNode } from 'react';
import type { DataStatus, RiskLevel } from '../data/mockData';

// ── DataStatusBadge ──────────────────────────────────────────
const STATUS_STYLES: Record<DataStatus, { bg: string; color: string; border: string; label: string }> = {
  measured:              { bg: '#dcfce7', color: '#15803d', border: '#86efac', label: 'Measured' },
  satellite_derived:     { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd', label: 'Satellite-Derived' },
  model_estimate:        { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', label: 'Model Estimate' },
  demonstration:         { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', label: 'Demo Data' },
  unavailable:           { bg: '#f9fafb', color: '#6b7280', border: '#d1d5db', label: 'Unavailable' },
  requires_verification: { bg: '#fff7ed', color: '#c2410c', border: '#fdba74', label: 'Verify Required' },
};

export function DataStatusBadge({ status, bn }: { status: DataStatus; bn?: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, padding: '2px 7px',
      borderRadius: 4, border: `1px solid ${s.border}`,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {bn || s.label}
    </span>
  );
}

// ── RiskBadge ────────────────────────────────────────────────
const RISK_STYLES: Record<RiskLevel, { bg: string; color: string; border: string }> = {
  low:      { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  moderate: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  high:     { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
};

export function RiskBadge({ risk, label }: { risk: RiskLevel; label?: string }) {
  const s = RISK_STYLES[risk];
  const defaultLabel = risk === 'low' ? 'Low Risk' : risk === 'moderate' ? 'Moderate Risk' : 'High Risk';
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px',
      borderRadius: 4, border: `1px solid ${s.border}`,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      {label || defaultLabel}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  padding?: number | string;
}
export function Card({ children, style, className, padding = 20 }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── SectionTitle ─────────────────────────────────────────────
export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>{children}</h2>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{sub}</p>}
    </div>
  );
}

// ── DemoBanner ───────────────────────────────────────────────
export function DemoBanner({ text }: { text: string }) {
  return (
    <div style={{
      background: '#fef9c3', border: '1px solid #fde047',
      borderRadius: 8, padding: '10px 14px',
      fontSize: 12.5, color: '#713f12',
      display: 'flex', alignItems: 'flex-start', gap: 8,
      marginBottom: 16,
    }}>
      <span style={{ flexShrink: 0 }}>⚠</span>
      <span>{text}</span>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  badge?: ReactNode;
}
export function StatCard({ icon, label, value, sub, color = '#1a5c38', badge }: StatCardProps) {
  return (
    <Card className="card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
          <span style={{ fontSize: 12.5, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        </div>
        {badge}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{sub}</div>}
    </Card>
  );
}

// ── Page Header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 24, gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f3b24' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#6b7280' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}
export function Button({ variant = 'primary', size = 'md', children, loading, style, ...props }: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: '#1a5c38', color: '#fff', border: 'none' },
    secondary: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    ghost:     { background: 'transparent', color: '#374151', border: '1px solid #d1d5db' },
    danger:    { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  };
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13.5 },
    lg: { padding: '11px 22px', fontSize: 15 },
  };
  return (
    <button
      style={{
        borderRadius: 8, fontWeight: 600, cursor: props.disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'all 0.15s ease', fontFamily: 'inherit',
        opacity: props.disabled ? 0.6 : 1,
        ...styles[variant],
        ...sizes[size],
        ...style,
      }}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
}

// ── FormGroup ────────────────────────────────────────────────
export function FormGroup({ label, children, required, hint }: { label: string; children: ReactNode; required?: boolean; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: '#9ca3af' }}>{hint}</span>}
    </div>
  );
}

// ── Input / Select ───────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  border: '1px solid #d1d5db', borderRadius: 7, padding: '7px 11px',
  fontSize: 13.5, width: '100%', outline: 'none',
  fontFamily: 'inherit', background: '#fff', color: '#111827',
  transition: 'border-color 0.15s ease',
};
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={INPUT_STYLE} {...props} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select style={INPUT_STYLE} {...props} />;
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', gap: 12, color: '#9ca3af',
    }}>
      <div style={{ opacity: 0.4, transform: 'scale(1.5)' }}>{icon}</div>
      <div style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, textAlign: 'center' }}>{sub}</div>}
    </div>
  );
}

// ── SourceNote ───────────────────────────────────────────────
export function SourceNote({ source, date }: { source: string; date?: string }) {
  return (
    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <span>📌 Source: {source}</span>
      {date && <span>· Last updated: {date}</span>}
    </div>
  );
}
