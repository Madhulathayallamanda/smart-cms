import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Shield, User, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDateShort } from '../../utils/helpers';

const ROLE_COLORS = { citizen: 'var(--accent-cyan)', police: 'var(--accent-blue)', admin: 'var(--accent-gold)' };
const ROLE_ICONS = { citizen: User, police: Shield, admin: Shield };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [officerForm, setOfficerForm] = useState({ name: '', email: '', password: '', phone: '', badgeNumber: '', rank: 'Constable', assignedStation: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (roleFilter) params.append('role', roleFilter);
      const [usersRes, stationsRes] = await Promise.all([
        api.get(`/admin/users?${params}`),
        api.get('/stations')
      ]);
      setUsers(usersRes.data.users);
      setStations(stationsRes.data.stations);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleToggle = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`);
      toast.success('User status updated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    if (!officerForm.name || !officerForm.email || !officerForm.password || !officerForm.assignedStation) {
      return toast.error('Fill all required fields');
    }
    setSaving(true);
    try {
      await api.post('/admin/officers', officerForm);
      toast.success('Officer created successfully');
      setShowAddOfficer(false);
      setOfficerForm({ name: '', email: '', password: '', phone: '', badgeNumber: '', rank: 'Constable', assignedStation: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const filtered = search ? users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) : users;

  return (
    <Layout title="User Management" subtitle={`${users.length} registered users`}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        {['', 'citizen', 'police', 'admin'].map(r => (
          <button key={r || 'all'} onClick={() => setRoleFilter(r)} style={{
            padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: roleFilter === r ? 'var(--gradient-blue)' : 'var(--bg-card)',
            color: roleFilter === r ? 'white' : 'var(--text-secondary)',
          }}>
            {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'All'}
          </button>
        ))}
        <button onClick={() => setShowAddOfficer(true)} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          <Plus size={15} /> Add Officer
        </button>
      </div>

      {/* Add officer modal */}
      {showAddOfficer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Add Police Officer</h3>
            <form onSubmit={handleAddOfficer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input className="input" value={officerForm.name} onChange={e => setOfficerForm(p => ({ ...p, name: e.target.value }))} placeholder="Officer name" />
                </div>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input className="input" value={officerForm.phone} onChange={e => setOfficerForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email *</label>
                <input className="input" type="email" value={officerForm.email} onChange={e => setOfficerForm(p => ({ ...p, email: e.target.value }))} placeholder="officer@station.gov.in" />
              </div>
              <div className="form-group">
                <label className="label">Password *</label>
                <input className="input" type="password" value={officerForm.password} onChange={e => setOfficerForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Badge Number</label>
                  <input className="input" value={officerForm.badgeNumber} onChange={e => setOfficerForm(p => ({ ...p, badgeNumber: e.target.value }))} placeholder="TS/HYD/XXX" />
                </div>
                <div className="form-group">
                  <label className="label">Rank</label>
                  <select className="input select" value={officerForm.rank} onChange={e => setOfficerForm(p => ({ ...p, rank: e.target.value }))}>
                    {['Constable', 'Head Constable', 'Sub Inspector', 'Inspector', 'DSP', 'SP'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Assigned Station *</label>
                <select className="input select" value={officerForm.assignedStation} onChange={e => setOfficerForm(p => ({ ...p, assignedStation: e.target.value }))}>
                  <option value="">Select station</option>
                  {stations.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddOfficer(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['User', 'Role', 'Contact', 'Station', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const roleColor = ROLE_COLORS[user.role];
                  const RoleIcon = ROLE_ICONS[user.role] || User;
                  return (
                    <tr key={user._id} style={{ borderTop: '1px solid var(--border)', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${roleColor}18`, border: `1px solid ${roleColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: roleColor }}>{user.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                            {user.badgeNumber && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user.badgeNumber}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: roleColor, background: `${roleColor}15`, border: `1px solid ${roleColor}30`, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.phone}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
                        {user.assignedStation?.name || '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDateShort(user.createdAt)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, color: user.isActive ? '#34d399' : '#f87171', background: user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 99 }}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => handleToggle(user._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.isActive ? '#f87171' : '#34d399', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>No users found</div>
          )}
        </div>
      )}
    </Layout>
  );
}
