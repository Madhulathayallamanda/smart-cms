import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import ComplaintCard from '../../components/shared/ComplaintCard';
import api from '../../utils/api';
import { COMPLAINT_STATUSES } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function MyCases() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [available, setAvailable] = useState(user?.isAvailable !== false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: 20 });
        if (status) params.append('status', status);
        const res = await api.get('/police/my-cases?' + params);
        setComplaints(res.data.complaints);
        setTotal(res.data.total);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [status]);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await api.put('/police/availability', { isAvailable: !available });
      setAvailable(res.data.user.isAvailable);
    } catch {} finally { setToggling(false); }
  };

  const filtered = search ? complaints.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.complaintId?.toLowerCase().includes(search.toLowerCase())) : complaints;

  return (
    <Layout title="My Cases" subtitle={'Cases assigned to you · ' + total + ' total'}>
      {/* Availability toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: available ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: '1px solid ' + (available ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'), borderRadius: 'var(--radius-lg)', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', items: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: available ? '#10b981' : '#ef4444', boxShadow: '0 0 6px ' + (available ? '#10b981' : '#ef4444') }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: available ? '#34d399' : '#f87171' }}>
              {available ? 'You are Available' : 'You are Unavailable'}
            </span>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
              {available ? 'New cases can be assigned to you' : 'No new cases will be assigned to you'}
            </p>
          </div>
        </div>
        <button onClick={toggleAvailability} disabled={toggling} className={'btn btn-sm ' + (available ? 'btn-danger' : 'btn-primary')} style={{ flexShrink: 0 }}>
          {toggling ? 'Updating...' : available ? 'Set Unavailable' : 'Set Available'}
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <select className="input select" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
          <option value="">All Statuses</option>
          {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...COMPLAINT_STATUSES].map(s => (
          <button key={s || 'all'} onClick={() => setStatus(s)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: status === s ? 'var(--gradient-blue)' : 'var(--bg-card)', color: status === s ? 'white' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No cases assigned to you yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => <ComplaintCard key={c._id} complaint={c} linkPrefix="/police" />)}
        </div>
      )}
    </Layout>
  );
}
