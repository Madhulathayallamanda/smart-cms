import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, title, subtitle }) {
  const [sidebarWidth, setSidebarWidth] = useState(240);

  // Listen for sidebar collapse
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const aside = document.querySelector('aside');
      if (aside) setSidebarWidth(aside.offsetWidth);
    });
    const aside = document.querySelector('aside');
    if (aside) {
      observer.observe(aside, { attributes: true, attributeFilter: ['style'] });
      setSidebarWidth(aside.offsetWidth);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
        <div style={{
          padding: '20px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {title && <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
