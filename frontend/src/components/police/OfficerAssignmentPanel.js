import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Shield, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const RankBadge = ({ rank }) => {
  const colors = {
    'Inspector': { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    'Sub-Inspector': { bg: 'rgba(37,99,235,0.12)', color: '#60a5fa', border: 'rgba(37,99,235,0.3)' },
    'Head Constable': { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
    'Constable': { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  };
  const c = colors[rank] || colors['Constable'];
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: 'var(--font-mono)' }}>{rank || 'Officer'}</span>;
};

const WorkloadBar = ({ active, max = 10 }) => {
  const pct = Math.min((active / max) * 100, 100);
  const color = pct < 40 ? '#10b981' : pct < 70 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Workload</span>
        <span style={{ fontSize: 10, color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{active} active</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};

export default function OfficerAssignmentPanel({ complaint, onAssigned }) {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const loadOfficers = async () => {
    setLoading(true);
    try {
      const stationId = complaint.assignedStation?._id || complaint.assignedStation;
      const res = await api.get('/police/officers' + (stationId ? '?stationId=' + stationId : ''));
      setOfficers(res.data.officers);
    } catch { toast.error('Could not load officers'); } finally { setLoading(false); }
  };

  useEffect(() => { loadOfficers(); }, [complaint._id]);

  const handleAssign = async (officerId) => {
    setAssigning(true);
    try {
      const res = await api.put('/complaints/' + complaint._id + '/assign-officer', { officerId });
      toast.success(res.data.message);
      onAssigned(res.data.complaint);
      setSelectedOfficer(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); } finally { setAssigning(false); }
  };

  const handleUnassign = async () => {
    if (!window.confirm('Remove this officer assignment? Case returns to unassigned queue.')) return;
    setAssigning(true);
    try {
      const res = await api.put('/complaints/' + complaint._id + '/unassign-officer');
      toast.success('Officer unassigned');
      onAssigned(res.data.complaint);
    } catch { toast.error('Failed to unassign'); } finally { setAssigning(false); }
  };

  const assignedId = complaint.assignedOfficer?._id || complaint.assignedOfficer;
  const otherOfficers = officers.filter(o => o._id !== assignedId);
  const availableOfficers = otherOfficers.filter(o => o.isAvailable);
  const busyOfficers = otherOfficers.filter(o => !o.isAvailable);
  const displayOfficers = showAll ? otherOfficers : availableOfficers;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={15} color="var(--accent-purple)" /> Officer Assignment
        </h3>
        <button onClick={loadOfficers} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} title="Refresh">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Currently assigned */}
      {complaint.assignedOfficer && (
        <div style={{ marginBottom: 14, padding: '12px 14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--accent-blue)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Currently Assigned</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(37,99,235,0.2)', border: '2px solid rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--accent-blue)', flexShrink: 0 }}>
                {complaint.assignedOfficer.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{complaint.assignedOfficer.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <RankBadge rank={complaint.assignedOfficer.rank} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{complaint.assignedOfficer.badgeNumber}</span>
                </div>
                {complaint.assignedOfficer.specialization && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>🎯 {complaint.assignedOfficer.specialization}</div>
                )}
              </div>
            </div>
            <button onClick={handleUnassign} disabled={assigning} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#f87171', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', flexShrink: 0 }}>
              <UserX size={11} /> Unassign
            </button>
          </div>
        </div>
      )}

      {/* Reassign label */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {complaint.assignedOfficer ? 'Reassign to another officer' : 'Select an officer'}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}
        </div>
      ) : officers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          <AlertTriangle size={22} style={{ marginBottom: 8, opacity: 0.5, display: 'block', margin: '0 auto 8px' }} />
          No officers found for this station
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>{availableOfficers.length} available</span>
              {busyOfficers.length > 0 && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', fontWeight: 600 }}>{busyOfficers.length} busy</span>}
            </div>
            {busyOfficers.length > 0 && (
              <button onClick={() => setShowAll(!showAll)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)' }}>
                {showAll ? 'Available only' : 'Show all'} <ChevronDown size={11} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
            )}
          </div>

          {displayOfficers.length === 0 && !showAll && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              No available officers.{' '}
              <button onClick={() => setShowAll(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', fontSize: 12, fontFamily: 'var(--font-body)' }}>Show busy officers</button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayOfficers.map(officer => {
              const isSelected = selectedOfficer === officer._id;
              return (
                <div key={officer._id}
                  onClick={() => setSelectedOfficer(isSelected ? null : officer._id)}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid ' + (isSelected ? 'rgba(37,99,235,0.35)' : 'var(--border)'),
                    transition: 'all 0.15s',
                    opacity: !officer.isAvailable ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: officer.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', border: '2px solid ' + (officer.isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: officer.isAvailable ? '#34d399' : '#f87171', flexShrink: 0 }}>
                        {officer.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{officer.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <RankBadge rank={officer.rank} />
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{officer.badgeNumber}</span>
                        </div>
                        {officer.specialization && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>🎯 {officer.specialization}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {officer.isAvailable
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#34d399', fontWeight: 600 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 4px #34d399' }} />Available</div>
                        : <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#f87171', fontWeight: 600 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171' }} />Busy</div>
                      }
                    </div>
                  </div>
                  <div style={{ paddingLeft: 44, marginTop: 2 }}>
                    <WorkloadBar active={officer.activeCases || 0} />
                    <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>📋 {officer.totalAssigned || 0} total</span>
                      <span style={{ fontSize: 10, color: '#34d399' }}>✅ {officer.resolvedCases || 0} resolved</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      <button onClick={e => { e.stopPropagation(); handleAssign(officer._id); }} disabled={assigning} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                        <UserCheck size={14} /> {assigning ? 'Assigning...' : 'Assign to ' + officer.name.split(' ')[0]}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
