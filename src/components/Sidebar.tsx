import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, CloudRain, Sprout, Calculator,
  BookOpen, MessageSquare, Users, Database, Info,
  ChevronLeft, ChevronRight, Leaf
} from 'lucide-react';
import { useLang } from '../i18n/LangContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const NAV_ITEMS = [
  { key: 'nav_dashboard',    path: '/',              icon: LayoutDashboard },
  { key: 'nav_risk_map',     path: '/risk-map',      icon: Map },
  { key: 'nav_climate',      path: '/climate',       icon: CloudRain },
  { key: 'nav_crop_planner', path: '/crop-planner',  icon: Sprout },
  { key: 'nav_farm_planner', path: '/farm-planner',  icon: Calculator },
  { key: 'nav_advisory',     path: '/advisory',      icon: BookOpen },
  { key: 'nav_notifications',path: '/notifications', icon: MessageSquare },
  { key: 'nav_extension',    path: '/extension',     icon: Users },
  { key: 'nav_methodology',  path: '/methodology',   icon: Database },
  { key: 'nav_about',        path: '/about',         icon: Info },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useLang();
  const location = useLocation();

  const sidebarContent = (
    <div
      style={{
        width: collapsed ? 64 : 240,
        background: 'linear-gradient(180deg, #0f3b24 0%, #1a5c38 60%, #0d9488 100%)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Leaf size={20} color="#86efac" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>SalinO-Crop</div>
            <div style={{ color: '#6ee7b7', fontSize: 10, fontWeight: 400 }}>Satkhira Pilot</div>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ key, path, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onMobileClose}
              title={t[key as keyof typeof t]}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px' : '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                color: isActive ? '#ffffff' : '#a7f3d0',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13.5,
                transition: 'all 0.15s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                whiteSpace: 'nowrap',
              }}
              className="sidebar-link-item"
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{t[key as keyof typeof t]}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 24, height: 24,
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRight size={13} color="#374151" /> : <ChevronLeft size={13} color="#374151" />}
      </button>

      {/* Bottom branding */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.5,
        }}>
          Hack for Humanity 2025<br />
          Environmental Sustainability
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="no-print" style={{ display: 'flex' }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex',
          }}
          className="no-print"
        >
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
            onClick={onMobileClose}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
