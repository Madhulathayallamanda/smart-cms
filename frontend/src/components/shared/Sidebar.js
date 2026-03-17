import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, MapPin, Plus, User, Shield,
  Users, Building2, LogOut, ChevronLeft, ChevronRight, Bell, Settings, UserCheck
} from 'lucide-react';

const citizenNav = [
  { path: '/citizen', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/citizen/submit', icon: Plus, label: 'Submit Complaint' },
  { path: '/citizen/complaints', icon: FileText, label: 'My Complaints' },
  { path: '/citizen/profile', icon: User, label: 'Profile' },
];

const policeNav = [
  { path: '/police', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/police/my-cases', icon: UserCheck, label: 'My Cases' },
  { path: '/police/complaints', icon: FileText, label: 'All Complaints' },
  { path: '/police/map', icon: MapPin, label: 'Map View' },
];

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/stations', icon: Building2, label: 'Stations' },
  { path: '/police/complaints', icon: FileText, label: 'All Complaints' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'police' ? policeNav : citizenNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role === 'police' ? 'Officer' : 'Citizen';
  const roleColor = user?.role === 'admin' ? 'var(--accent-gold)' : user?.role === 'police' ? 'var(--accent-blue)' : 'var(--accent-cyan)';

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: 'var(--gradient-blue)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-blue)' }}>
          <Shield size={18} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2 }}>SmartCMS</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Police Portal</div>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${roleColor}22`, border: `2px solid ${roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: roleColor }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: roleColor, fontFamily: 'var(--font-mono)' }}>{roleLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px 18px' : '11px 20px',
              margin: '2px 8px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-blue)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-blue)' : 'none',
              transition: 'var(--transition)',
              position: 'relative',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title={collapsed ? label : ''}
            >
              <Icon size={18} />
              {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>}
              {isActive && !collapsed && <div style={{ position: 'absolute', right: 12, width: 6, height: 6, borderRadius: '50%', background: 'white', opacity: 0.8 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '11px 18px' : '11px 12px',
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-md)',
          transition: 'var(--transition)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={18} />
          {!collapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position: 'absolute',
        top: 22,
        right: -12,
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        zIndex: 101,
        transition: 'var(--transition)',
      }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
