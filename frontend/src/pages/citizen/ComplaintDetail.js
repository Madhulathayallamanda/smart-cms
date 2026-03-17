import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, Building2, User, FileText, CheckCircle } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import { getStatusBadgeClass, formatDate, getCategoryIcon, getPriorityColor } from '../../utils/helpers';

const StatusStep = ({ label, done, active, timestamp, comment }) => (
  <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: done ? 'var(--gradient-blue)' : active ? 'rgba(37,99,235,0.2)' : 'var(--bg-card)',
        border: active ? '2px solid var(--accent-blue)' : done ? 'none' : '2px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
        boxShadow: done ? 'var(--shadow-blue)' : 'none',
      }}>
        {done ? <CheckCircle size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? 'var(--accent-blue)' : 'var(--text-muted)' }} />}
      </div>
    </div>
    <div style={{ flex: 1, paddingBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: done || active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</div>
      {timestamp && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{formatDate(timestamp)}</div>}
      {comment && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>{comment}</div>}
    </div>
  </div>
);

const STATUS_ORDER = ['Submitted', 'Accepted', 'Under Investigation', 'Resolved'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(r => setComplaint(r.data.complaint)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

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
        <Link to="/citizen/complaints" className="btn btn-primary" style={{ marginTop: 16 }}>Go Back</Link>
      </div>
    </Layout>
  );

  const currentStatusIdx = STATUS_ORDER.indexOf(complaint.status);

  return (
    <Layout title="Complaint Details" subtitle={`ID: ${complaint.complaintId}`}>
      <Link to="/citizen/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to complaints
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header card */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{complaint.complaintId}</span>
                  <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>{complaint.status}</span>
                  <span style={{ fontSize: 12, color: getPriorityColor(complaint.priority), fontWeight: 600 }}>● {complaint.priority}</span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {getCategoryIcon(complaint.category)} {complaint.title}
                </h1>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{complaint.description}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>🏷 {complaint.category}</span>
              <span style={{ color: 'var(--text-muted)' }}>📅 Filed: {formatDate(complaint.createdAt)}</span>
              {complaint.locationAddress && <span style={{ color: 'var(--text-muted)' }}>📍 {complaint.locationAddress}</span>}
            </div>
          </div>

          {/* Investigation notes */}
          {complaint.investigationNotes && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🔍 Investigation Notes</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{complaint.investigationNotes}</p>
            </div>
          )}

          {/* Resolution */}
          {complaint.resolution && (
            <div style={{ padding: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>✅ Resolution</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{complaint.resolution}</p>
              {complaint.resolvedAt && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Resolved on: {formatDate(complaint.resolvedAt)}</p>}
            </div>
          )}

          {/* Evidence */}
          {complaint.evidence?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>📎 Evidence ({complaint.evidence.length} files)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {complaint.evidence.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <FileText size={14} color="var(--accent-blue)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ev.originalName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{(ev.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status timeline */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Progress Timeline</h3>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 2, background: 'var(--border)', zIndex: 0 }} />
              {STATUS_ORDER.map((status, i) => {
                const historyEntry = complaint.statusHistory?.find(h => h.status === status);
                return (
                  <StatusStep key={status} label={status} done={i < currentStatusIdx || (complaint.status === status && status === 'Resolved')} active={complaint.status === status} timestamp={historyEntry?.timestamp} comment={historyEntry?.comment} />
                );
              })}
              {complaint.status === 'Rejected' && (
                <StatusStep label="Rejected" done={false} active={true} timestamp={complaint.updatedAt} comment={complaint.statusHistory?.find(h => h.status === 'Rejected')?.comment} />
              )}
            </div>
          </div>

          {/* Station info */}
          {complaint.assignedStation && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} color="var(--accent-blue)" /> Assigned Station
              </h3>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-blue)', marginBottom: 4 }}>{complaint.assignedStation.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{complaint.assignedStation.address}</div>
              {complaint.distanceToStation && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>📏 {complaint.distanceToStation} km from your location</div>
              )}
              <a href={`tel:${complaint.assignedStation.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>
                <Phone size={14} /> {complaint.assignedStation.phone}
              </a>
            </div>
          )}

          {/* Assigned officer */}
          {complaint.assignedOfficer ? (
            <div className="card" style={{ padding: 20, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={15} color="#34d399" /> Officer in Charge
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#34d399', flexShrink: 0 }}>
                  {complaint.assignedOfficer.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{complaint.assignedOfficer.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{complaint.assignedOfficer.rank}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{complaint.assignedOfficer.badgeNumber}</div>
                </div>
              </div>
              {complaint.assignedOfficer.specialization && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>🎯 {complaint.assignedOfficer.specialization}</div>
              )}
              <div style={{ padding: '8px 10px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, fontSize: 12, color: '#34d399' }}>
                ✓ An officer has been assigned to your case and is investigating
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 20, border: '1px solid rgba(245,158,11,0.2)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={15} color="#fbbf24" /> Officer Assignment
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No officer assigned yet. The station will assign an officer soon.</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
