import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import OnboardingModal from './OnboardingModal';
import AIChatbot from './AIChatbot';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#faf7f2' }}>
      {/* Sidebar — hidden on small screens, visible md+ */}
      <div className="sidebar-desktop no-print">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header onMenuToggle={() => setMobileOpen(o => !o)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
          <div className="animate-in" style={{ width: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
      <OnboardingModal />
      <AIChatbot />

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .demo-notice { display: none !important; }
        }
        .sidebar-link-item:hover {
          background: rgba(255,255,255,0.12) !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
