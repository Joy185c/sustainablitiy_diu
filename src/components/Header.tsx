import { Menu, MapPin, Globe, Bell } from 'lucide-react';
import { useLang } from '../i18n/LangContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { t, toggleLang, lang } = useLang();

  return (
    <header style={{
      height: 56,
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }} className="no-print">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          borderRadius: 6,
          color: '#374151',
        }}
        className="mobile-menu-btn"
      >
        <Menu size={22} />
      </button>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'auto' }}>
        <MapPin size={15} color="#0d9488" />
        <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>{t.header_region}</span>
        <span style={{
          fontSize: 10, background: '#fef3c7', color: '#92400e',
          border: '1px solid #fcd34d', borderRadius: 4,
          padding: '1px 6px', fontWeight: 600, marginLeft: 4,
        }}>DEMO</span>
      </div>

      {/* Demo notice */}
      <div style={{
        fontSize: 11.5, color: '#6b7280',
        background: '#f9fafb', border: '1px solid #e5e7eb',
        borderRadius: 6, padding: '3px 10px',
        display: 'flex', alignItems: 'center', gap: 6,
      }} className="demo-notice">
        <Bell size={12} color="#6b7280" />
        {t.header_demo_notice}
      </div>

      {/* Lang toggle */}
      <button
        onClick={toggleLang}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '5px 12px',
          cursor: 'pointer', color: '#166534',
          fontWeight: 600, fontSize: 12.5,
          transition: 'all 0.15s ease',
        }}
        title="Switch language / ভাষা পরিবর্তন করুন"
      >
        <Globe size={14} />
        {t.header_lang}
      </button>
    </header>
  );
}
