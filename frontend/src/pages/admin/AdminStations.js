import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, MapPin, Users, FileText } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editStation, setEditStation] = useState(null);
  const [form, setForm] = useState({
    name: '', stationCode: '', address: '', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana',
    phone: '', email: '', inCharge: '', latitude: '', longitude: ''
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stations');
      setStations(res.data.stations);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (station) => {
    setEditStation(station);
    setForm({
      name: station.name, stationCode: station.stationCode, address: station.address,
      city: station.city, district: station.district, state: station.state,
      phone: station.phone, email: station.email || '', inCharge: station.inCharge || '',
      latitude: station.location.coordinates[1], longitude: station.location.coordinates[0]
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.stationCode || !form.phone || !form.latitude || !form.longitude) {
      return toast.error('Fill all required fields');
    }
    setSaving(true);
    try {
      const payload = { ...form, location: { type: 'Point', coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)] } };
      delete payload.latitude; delete payload.longitude;

      if (editStation) {
        await api.put(`/stations/${editStation._id}`, payload);
        toast.success('Station updated');
      } else {
        await api.post('/stations', payload);
        toast.success('Station created');
      }
      setShowAdd(false); setEditStation(null);
      setForm({ name: '', stationCode: '', address: '', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', phone: '', email: '', inCharge: '', latitude: '', longitude: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <Layout title="Station Management" subtitle={`${stations.length} active police stations`}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button onClick={() => { setEditStation(null); setShowAdd(true); }} className="btn btn-primary">
          <Plus size={15} /> Add Station
        </button>
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              {editStation ? 'Edit Station' : 'Add Police Station'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Station Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Jubilee Hills PS" />
                </div>
                <div className="form-group">
                  <label className="label">Station Code *</label>
                  <input className="input" value={form.stationCode} onChange={e => setForm(p => ({ ...p, stationCode: e.target.value }))} placeholder="e.g. JH001" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Address *</label>
                <input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">City</label>
                  <input className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label">District</label>
                  <input className="input" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Latitude *</label>
                  <input className="input" type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} placeholder="17.4311" />
                </div>
                <div className="form-group">
                  <label className="label">Longitude *</label>
                  <input className="input" type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} placeholder="78.4050" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Phone *</label>
                  <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="040-XXXXXXXX" />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="station@police.gov.in" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Officer In Charge</label>
                <input className="input" value={form.inCharge} onChange={e => setForm(p => ({ ...p, inCharge: e.target.value }))} placeholder="Inspector name" />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => { setShowAdd(false); setEditStation(null); }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editStation ? 'Update Station' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : (
        <div className="grid-2">
          {stations.map(station => (
            <div key={station._id} className="card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, background: 'var(--accent-gold)', opacity: 0.05, borderRadius: '50%', filter: 'blur(15px)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 38, height: 38, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={18} color="var(--accent-gold)" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{station.stationCode}</div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{station.name}</h3>
                  </div>
                </div>
                <button onClick={() => openEdit(station)} style={{ fontSize: 12, color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <MapPin size={12} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{station.address}, {station.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={12} color="var(--text-muted)" />
                  <a href={`tel:${station.phone}`} style={{ fontSize: 12, color: 'var(--accent-green)', textDecoration: 'none' }}>{station.phone}</a>
                </div>
                {station.inCharge && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>In Charge: {station.inCharge}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#60a5fa' }}>{station.activeComplaints}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#34d399' }}>{station.resolvedComplaints}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text-secondary)' }}>{station.totalOfficers}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Officers</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
