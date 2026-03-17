import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, TrendingUp, CheckCircle, AlertTriangle, MapPin, Users, UserCheck } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/StatCard';
import ComplaintCard from '../../components/shared/ComplaintCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStatusBadgeClass } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#06b6d4'];

const OfficerWorkloadCard = ({ officer }) => {
  const pct = Math.min(((officer.activeCases || 0) / 10) * 100, 100);
  const barColor = pct < 40 ? '#10b981' : pct < 70 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: officer.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', border: '2px solid ' + (officer.isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: officer.isAvailable ? '#34d399' : '#f87171', flexShrink: 0 }}>
          {officer.name?.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{officer.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{officer.rank} · {officer.badgeNumber}</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: officer.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)', color: officer.isAvailable ? '#34d399' : '#f87171', border: '1px solid ' + (officer.isAvailable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'), flexShrink: 0 }}>
          {officer.isAvailable ? 'Free' : 'Busy'}
        </div>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{officer.activeCases || 0} active</span>
        <span style={{ fontSize: 10, color: '#34d399' }}>✅ {officer.resolvedCases || 0} resolved</span>
      </div>
    </div>
  );
};

export default function PoliceDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, officersRes] = await Promise.all([
          api.get('/police/dashboard'),
          api.get('/police/officers')
        ]);
        setData(dashRes.data);
        setOfficers(officersRes.data.officers);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Complaints', value: data?.stats?.total, icon: FileText, color: 'var(--accent-blue)' },
    { label: 'New / Submitted', value: data?.stats?.submitted, icon: Clock, color: 'var(--accent-cyan)' },
    { label: 'Under Investigation', value: data?.stats?.underInvestigation, icon: TrendingUp, color: 'var(--accent-gold)' },
    { label: 'Resolved', value: data?.stats?.resolved, icon: CheckCircle, color: 'var(--accent-green)' },
  ];

  const availableOfficers = officers.filter(o => o.isAvailable);

  return (
    <Layout title="Police Dashboard" subtitle={user?.assignedStation ? 'Station: ' + user.assignedStation.name : 'All Stations'}>
      {/* Unassigned alert */}
      {data?.stats?.unassigned > 0 && (
        <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', items: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#fbbf24" />
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>{data.stats.unassigned} complaint{data.stats.unassigned !== 1 ? 's' : ''} without an assigned officer</span>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Assign officers to start investigations</p>
            </div>
          </div>
          <Link to="/police/complaints?status=Submitted" className="btn btn-primary btn-sm">View Unassigned →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map(card => <StatCard key={card.label} {...card} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Left */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Complaints</h2>
            <Link to="/police/complaints" style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.recentComplaints?.map(c => <ComplaintCard key={c._id} complaint={c} linkPrefix="/police" />)}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Officer workload */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={15} color="var(--accent-purple)" /> Officer Workload
              </h3>
              <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>{availableOfficers.length}/{officers.length} available</span>
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 10 }} />)}
              </div>
            ) : officers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>No officers in this station yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {officers.map(o => <OfficerWorkloadCard key={o._id} officer={o} />)}
              </div>
            )}
          </div>

          {/* Category chart */}
          {data?.categoryBreakdown?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Complaints by Category</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.categoryBreakdown} margin={{ left: -20 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-30} textAnchor="end" height={48} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick actions */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Unassigned Complaints', to: '/police/complaints?status=Submitted', icon: AlertTriangle, color: '#fbbf24', count: data?.stats?.unassigned },
                { label: 'All Complaints', to: '/police/complaints', icon: FileText, color: 'var(--accent-blue)' },
                { label: 'Map View', to: '/police/map', icon: MapPin, color: 'var(--accent-green)' },
              ].map(({ label, to, icon: Icon, color, count }) => (
                <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, textDecoration: 'none', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
                  </div>
                  {count > 0 && <span style={{ fontSize: 11, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>{count}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
