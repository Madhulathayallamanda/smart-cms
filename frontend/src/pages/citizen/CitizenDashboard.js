import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, XCircle, TrendingUp, MapPin } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/StatCard';
import ComplaintCard from '../../components/shared/ComplaintCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          api.get('/complaints/stats/summary'),
          api.get('/complaints/my?limit=5')
        ]);
        setStats(statsRes.data.stats);
        setComplaints(complaintsRes.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusCards = [
    { label: 'Total Filed', value: stats?.total, icon: FileText, color: 'var(--accent-blue)' },
    { label: 'Under Investigation', value: stats?.byStatus?.['Under Investigation'] || 0, icon: TrendingUp, color: 'var(--accent-gold)' },
    { label: 'Resolved', value: stats?.byStatus?.['Resolved'] || 0, icon: CheckCircle, color: 'var(--accent-green)' },
    { label: 'Pending', value: stats?.byStatus?.['Submitted'] || 0, icon: Clock, color: 'var(--accent-purple)' },
  ];

  return (
    <Layout title={`Welcome, ${user?.name?.split(' ')[0]} 👋`} subtitle="Track and manage your police complaints">
      {/* Quick action */}
      <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.08))', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>File a New Complaint</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your location will be detected automatically to find the nearest police station.</p>
        </div>
        <Link to="/citizen/submit" className="btn btn-primary btn-lg">
          <Plus size={18} /> Submit Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statusCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent complaints */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Complaints</h2>
            <Link to="/citizen/complaints" style={{ fontSize: 13, color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : complaints.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No complaints yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>File your first complaint with automatic police station assignment.</p>
              <Link to="/citizen/submit" className="btn btn-primary">Submit Complaint</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User card */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Your Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Name', user?.name],
                ['Email', user?.email],
                ['Phone', user?.phone],
                ['Member since', new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          {stats?.byCategory?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>By Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.byCategory.slice(0, 5).map(({ _id, count }) => (
                  <div key={_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{_id}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help card */}
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ display: 'flex', items: 'center', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={16} color="#f87171" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>Emergency?</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>For immediate emergencies, please call the police directly.</p>
            <a href="tel:100" style={{ display: 'block', textAlign: 'center', padding: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontWeight: 700, fontSize: 18, textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
              📞 100
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
