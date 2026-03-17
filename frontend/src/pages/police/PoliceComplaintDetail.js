import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Save, Building2, Phone, Briefcase, CheckCircle } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import OfficerAssignmentPanel from '../../components/police/OfficerAssignmentPanel';
import api from '../../utils/api';
import { getStatusBadgeClass, formatDate, getCategoryIcon, getPriorityColor, COMPLAINT_STATUSES } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PoliceComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({ status: '', comment: '', investigationNotes: '', resolution: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details | assign | history

  const load = async () => {
    try {
      const res = await api.get('/complaints/' + id);
      setComplaint(res.data.complaint);
      setUpdateForm(p => ({
        ...p,
        status: res.data.complaint.status,
        investigationNotes: res.data.complaint.investigationNotes || '',
        resolution: res.data.complaint.resolution || ''
      }));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.status) return toast.error('Select a status');
    setSaving(true);
    try {
      await api.put('/complaints/' + id + '/status', updateForm);
      toast.success('Complaint updated!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); } finally { setSaving(false); }
  };

  const handleOfficerAssigned = (updatedComplaint) => {
    setComplaint(updatedComplaint);
    setActiveTab('details');
  };

  if (loading) return (
    <Layout title="Complaint Details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 'var(--radius-lg)' }} />)}
      </div>
    </Layout>
  );

  if (!complaint) return (
    <Layout title="Not Found">
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Complaint not found.</p>
        <Link to="/police/complaints" className="btn btn-primary" style={{ marginTop: 16 }}>Go Back</Link>
      </div>
    </Layout>
  );

  const tabs = [
    { id: 'details', label: 'Details & Update' },
    { id: 'assign', label: complaint.assignedOfficer ? '👮 Officer Assigned' : '⚠️ Assign Officer' },
    { id: 'history', label: 'History (' + (complaint.statusHistory?.length || 0) + ')' },
  ];

  return (
    <Layout title="Complaint Details" subtitle={'Manage: ' + complaint.complaintId}>
      <Link to="/police/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to complaints
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Left main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header card */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{getCategoryIcon(complaint.category)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{complaint.complaintId}</span>
                  <span className={'badge ' + getStatusBadgeClass(complaint.status)}>{complaint.status}</span>
                  <span style={{ fontSize: 12, color: getPriorityColor(complaint.priority), fontWeight: 600 }}>● {complaint.priority}</span>
                  {!complaint.assignedOfficer && (
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }}>⚠ Unassigned</span>
                  )}
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{complaint.title}</h1>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{complaint.description}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>🏷 {complaint.category}</span>
              <span style={{ color: 'var(--text-muted)' }}>📅 {formatDate(complaint.createdAt)}</span>
              {complaint.locationAddress && <span style={{ color: 'var(--text-muted)' }}>📍 {complaint.locationAddress}</span>}
            </div>
          </div>

          {/* Unassigned warning */}
          {!complaint.assignedOfficer && (
            <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', items: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>No officer assigned yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Assign an available officer to start the investigation</div>
                </div>
              </div>
              <button onClick={() => setActiveTab('assign')} className="btn btn-primary btn-sm">
                👮 Assign Officer
              </button>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderBottom: '2px solid ' + (activeTab === tab.id ? 'var(--accent-blue)' : 'transparent'),
                marginBottom: -1, transition: 'all 0.15s', fontFamily: 'var(--font-body)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Details + Update */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.2s ease' }}>
              {/* Citizen info */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={15} color="var(--accent-cyan)" /> Complainant
                </h3>
                {complaint.isAnonymous ? (
                  <div style={{ padding: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8 }}>
                    <p style={{ fontSize: 13, color: '#a78bfa' }}>🕵️ Filed anonymously</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[['Name', complaint.citizenName], ['Phone', complaint.citizenPhone], ['Email', complaint.citizenEmail]].map(([lbl, val]) => (
                      <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lbl}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Update form */}
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>⚡ Update Case</h3>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select className="input select" value={updateForm.status} onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}>
                      {[...COMPLAINT_STATUSES, 'Rejected', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Comment</label>
                    <textarea className="input" rows={2} placeholder="Add a note..." value={updateForm.comment} onChange={e => setUpdateForm(p => ({ ...p, comment: e.target.value }))} style={{ resize: 'vertical' }} />
                  </div>
                  <div className="form-group">
                    <label className="label">Investigation Notes</label>
                    <textarea className="input" rows={3} placeholder="Findings, evidence collected, witnesses..." value={updateForm.investigationNotes} onChange={e => setUpdateForm(p => ({ ...p, investigationNotes: e.target.value }))} style={{ resize: 'vertical' }} />
                  </div>
                  {updateForm.status === 'Resolved' && (
                    <div className="form-group">
                      <label className="label">Resolution Summary *</label>
                      <textarea className="input" rows={3} placeholder="How was this case resolved?" value={updateForm.resolution} onChange={e => setUpdateForm(p => ({ ...p, resolution: e.target.value }))} style={{ resize: 'vertical' }} />
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={15} /> {saving ? 'Saving...' : 'Update Status'}
                  </button>
                </form>
              </div>

              {/* Resolution block */}
              {complaint.resolution && (
                <div style={{ padding: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>✅ Resolution</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{complaint.resolution}</p>
                  {complaint.resolvedAt && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Resolved: {formatDate(complaint.resolvedAt)}</p>}
                </div>
              )}
            </div>
          )}

          {/* Tab: Assign Officer */}
          {activeTab === 'assign' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <OfficerAssignmentPanel complaint={complaint} onAssigned={handleOfficerAssigned} />
            </div>
          )}

          {/* Tab: History */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.2s ease' }}>
              {complaint.statusHistory?.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No history yet</div>
              )}
              {complaint.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', borderLeft: '3px solid var(--accent-blue)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className={'badge ' + getStatusBadgeClass(h.status)}>{h.status}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{formatDate(h.timestamp)}</span>
                  </div>
                  {h.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>{h.comment}</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>By: {h.updatedByName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Assigned officer summary */}
          {complaint.assignedOfficer && (
            <div className="card" style={{ padding: 20, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} /> Officer in Charge
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#34d399' }}>
                  {complaint.assignedOfficer.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{complaint.assignedOfficer.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{complaint.assignedOfficer.rank}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{complaint.assignedOfficer.badgeNumber}</div>
                </div>
              </div>
              {complaint.assignedOfficer.specialization && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>🎯 {complaint.assignedOfficer.specialization}</div>
              )}
              {complaint.assignedOfficer.phone && (
                <a href={'tel:' + complaint.assignedOfficer.phone} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>
                  <Phone size={13} /> {complaint.assignedOfficer.phone}
                </a>
              )}
              <button onClick={() => setActiveTab('assign')} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 12, justifyContent: 'center', fontSize: 12 }}>
                🔄 Reassign Officer
              </button>
            </div>
          )}

          {/* Location */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={15} color="var(--accent-blue)" /> Incident Location
            </h3>
            {complaint.location?.coordinates && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                  {complaint.location.coordinates[1].toFixed(5)}, {complaint.location.coordinates[0].toFixed(5)}
                </div>
                {complaint.locationAddress && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>{complaint.locationAddress}</div>}
                <a href={'https://maps.google.com?q=' + complaint.location.coordinates[1] + ',' + complaint.location.coordinates[0]} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                  <MapPin size={13} /> View on Map
                </a>
                {complaint.assignedStation?.location?.coordinates && (
                  <a href={'https://maps.google.com/maps?saddr=' + complaint.assignedStation.location.coordinates[1] + ',' + complaint.assignedStation.location.coordinates[0] + '&daddr=' + complaint.location.coordinates[1] + ',' + complaint.location.coordinates[0]} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    🗺 Get Route
                  </a>
                )}
              </>
            )}
          </div>

          {/* Station */}
          {complaint.assignedStation && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={15} color="var(--accent-gold)" /> Assigned Station
              </h3>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 4 }}>{complaint.assignedStation.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{complaint.assignedStation.address}</div>
              {complaint.distanceToStation && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>📏 {complaint.distanceToStation} km from incident</div>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
