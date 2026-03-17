import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import ComplaintCard from '../../components/shared/ComplaintCard';
import api from '../../utils/api';
import { COMPLAINT_STATUSES } from '../../utils/helpers';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 10 });
        if (filter) params.append('status', filter);
        const res = await api.get(`/complaints/my?${params}`);
        setComplaints(res.data.complaints);
        setTotal(res.data.total);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [filter, page]);

  const filtered = search ? complaints.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.complaintId?.toLowerCase().includes(search.toLowerCase())) : complaints;

  return (
    <Layout title="My Complaints" subtitle={`${total} total complaint${total !== 1 ? 's' : ''}`}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search by title or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input select" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">All Statuses</option>
          {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Link to="/citizen/submit" className="btn btn-primary">
          <Plus size={16} /> New Complaint
        </Link>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', ...COMPLAINT_STATUSES].map(s => (
          <button key={s || 'all'} onClick={() => { setFilter(s); setPage(1); }} style={{
            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'var(--transition)',
            background: filter === s ? 'var(--gradient-blue)' : 'var(--bg-card)',
            color: filter === s ? 'white' : 'var(--text-secondary)',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>📋</p>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No complaints found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{filter ? `No ${filter} complaints` : 'You haven\'t filed any complaints yet.'}</p>
          {!filter && <Link to="/citizen/submit" className="btn btn-primary">Submit Your First Complaint</Link>}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => <ComplaintCard key={c._id} complaint={c} />)}
          </div>
          {total > 10 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: page === i + 1 ? 'var(--gradient-blue)' : 'var(--bg-card)',
                  color: page === i + 1 ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
                }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
