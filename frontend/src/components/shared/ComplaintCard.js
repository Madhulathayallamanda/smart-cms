import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { getStatusBadgeClass, timeAgo, truncate, getCategoryIcon, getPriorityColor } from '../../utils/helpers';

export default function ComplaintCard({ complaint, linkPrefix = '/citizen' }) {
  return (
    <Link to={`${linkPrefix}/complaints/${complaint._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: 20, cursor: 'pointer', transition: 'var(--transition)', animation: 'fadeIn 0.3s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{getCategoryIcon(complaint.category)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{complaint.complaintId}</span>
                <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>{complaint.status}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {complaint.title}
              </h3>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
        </div>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
          {truncate(complaint.description, 100)}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {complaint.locationAddress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{truncate(complaint.locationAddress, 35)}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(complaint.createdAt)}</span>
          </div>
          {complaint.priority && complaint.priority !== 'Medium' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} color={getPriorityColor(complaint.priority)} />
              <span style={{ fontSize: 12, color: getPriorityColor(complaint.priority), fontWeight: 600 }}>{complaint.priority}</span>
            </div>
          )}
          {complaint.stationName && (
            <span style={{ fontSize: 12, color: 'var(--accent-blue)', marginLeft: 'auto' }}>
              {truncate(complaint.stationName, 30)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
