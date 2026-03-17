import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import ComplaintCard from '../../components/shared/ComplaintCard';
import api from '../../utils/api';
import { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES } from '../../utils/helpers';

export default function PoliceComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12 });
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        const res = await api.get(`/complaints/station/assigned?${params}`);
        setComplaints(res.data.complaints);
        setTotal(res.data.total);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [status, category, page]);

  const filtered = search ? complaints.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.complaintId?.toLowerCase().includes(search.toLowerCase()) ||
    c.citizenName?.toLowerCase().includes(search.toLowerCase())
  ) : complaints;

  return (
    <Layout title="Complaints" subtitle={`${total} assigned complaint${total !== 1 ? 's' : ''}`}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">All Statuses</option>
          {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">All Categories</option>
          {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...COMPLAINT_STATUSES].map(s => (
          <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }} style={{
            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: status === s ? 'var(--gradient-blue)' : 'var(--bg-card)',
            color: status === s ? 'white' : 'var(--text-secondary)',
            transition: 'var(--transition)',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>📋</p>
          <p style={{ color: 'var(--text-secondary)' }}>No complaints found</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
            {filtered.map(c => <ComplaintCard key={c._id} complaint={c} linkPrefix="/police" />)}
          </div>
          {total > 12 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {Array.from({ length: Math.ceil(total / 12) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: page === i + 1 ? 'var(--gradient-blue)' : 'var(--bg-card)',
                  color: page === i + 1 ? 'white' : 'var(--text-secondary)', fontWeight: 600,
                }}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
