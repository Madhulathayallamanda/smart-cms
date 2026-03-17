import React, { useState, useEffect } from 'react';
import { Users, FileText, Building2, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/StatCard';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const PIE_COLORS = ['#3b82f6', '#a78bfa', '#fbbf24', '#34d399', '#f87171'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Citizens', value: data?.stats?.totalUsers, icon: Users, color: 'var(--accent-cyan)' },
    { label: 'Total Complaints', value: data?.stats?.totalComplaints, icon: FileText, color: 'var(--accent-blue)' },
    { label: 'Active Stations', value: data?.stats?.totalStations, icon: Building2, color: 'var(--accent-gold)' },
    { label: 'Resolved Cases', value: data?.stats?.resolvedComplaints, icon: CheckCircle, color: 'var(--accent-green)' },
  ];

  const stationChartData = data?.stationStats?.map(s => ({ name: s.name.replace('Police Station', 'PS').replace('Jubilee Hills', 'JH').replace('Banjara Hills', 'BH').replace('Madhapur', 'MPR').replace('Secunderabad', 'SEC').replace('Kukatpally', 'KP'), active: s.activeComplaints, resolved: s.resolvedComplaints })) || [];

  const resolutionRate = data?.stats?.totalComplaints
    ? Math.round((data.stats.resolvedComplaints / data.stats.totalComplaints) * 100)
    : 0;

  const pieData = [
    { name: 'Resolved', value: data?.stats?.resolvedComplaints || 0 },
    { name: 'Active', value: (data?.stats?.totalComplaints || 0) - (data?.stats?.resolvedComplaints || 0) },
  ];

  return (
    <Layout title="Admin Dashboard" subtitle="System-wide overview and management">
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Station activity chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Station Activity</h3>
          {loading ? <div className="skeleton" style={{ height: 240 }} /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stationChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Bar dataKey="active" name="Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Resolution rate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Resolution Rate</h3>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
                <circle cx={60} cy={60} r={50} fill="none" stroke="url(#grad)" strokeWidth={10}
                  strokeDasharray={`${resolutionRate * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{resolutionRate}%</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>of complaints resolved</p>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Quick Links</h3>
            {[
              { label: 'Manage Users', to: '/admin/users', color: 'var(--accent-cyan)' },
              { label: 'Manage Stations', to: '/admin/stations', color: 'var(--accent-gold)' },
              { label: 'All Complaints', to: '/police/complaints', color: 'var(--accent-blue)' },
            ].map(({ label, to, color }) => (
              <a key={label} href={to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-secondary)', borderRadius: 8, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, marginBottom: 6, transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                {label}
                <span style={{ color }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Station stats table */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Station Performance</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Station Name', 'Active Complaints', 'Resolved', 'Total', 'Resolution Rate'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.stationStats?.map((s, i) => {
                const total = s.activeComplaints + s.resolvedComplaints;
                const rate = total ? Math.round((s.resolvedComplaints / total) * 100) : 0;
                return (
                  <tr key={s._id || i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#60a5fa', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{s.activeComplaints}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{s.resolvedComplaints}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{total}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99 }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: rate > 60 ? '#10b981' : rate > 30 ? '#f59e0b' : '#ef4444', borderRadius: 99, transition: 'width 1s ease' }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', width: 36 }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
