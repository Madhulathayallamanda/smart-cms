import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import { getStatusBadgeClass, getCategoryIcon, formatDate, getPriorityColor } from '../../utils/helpers';
import { MapPin, Navigation, ExternalLink, X, Phone, Building2 } from 'lucide-react';

export default function PoliceMap() {
  const [complaints, setComplaints] = useState([]);
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, resolved
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const stationMarkersRef = useRef([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/complaints/station/assigned?limit=100'),
          api.get('/stations')
        ]);
        setComplaints(cRes.data.complaints);
        setStations(sRes.data.stations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load Leaflet dynamically
  useEffect(() => {
    if (loading || mapInstanceRef.current) return;

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.onload = () => initMap();
    document.head.appendChild(scriptEl);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;

    // Init map centered on Hyderabad
    const map = L.map(mapRef.current, { zoomControl: true }).setView([17.385, 78.4867], 12);
    mapInstanceRef.current = map;

    // OpenStreetMap tiles — completely free, no key needed
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom complaint marker icon
    const complaintIcon = (status) => {
      const colors = {
        'Submitted': '#3b82f6',
        'Accepted': '#8b5cf6',
        'Under Investigation': '#f59e0b',
        'Resolved': '#10b981',
        'Rejected': '#ef4444',
      };
      const color = colors[status] || '#3b82f6';
      return L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
    };

    // Station marker icon
    const stationIcon = L.divIcon({
      className: '',
      html: `<div style="width:22px;height:22px;border-radius:6px;background:#1e40af;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:11px;">🏛</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Add station markers
    stations.forEach(station => {
      if (!station.location?.coordinates) return;
      const [lon, lat] = station.location.coordinates;
      const marker = L.marker([lat, lon], { icon: stationIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#1e3a8a;">🏛 ${station.name}</div>
            <div style="font-size:12px;color:#555;margin-bottom:4px;">${station.address}</div>
            <div style="font-size:12px;color:#555;">📞 ${station.phone}</div>
            <div style="font-size:11px;color:#888;margin-top:4px;">${station.activeComplaints || 0} active complaints</div>
          </div>
        `);
      stationMarkersRef.current.push(marker);
    });

    // Add complaint markers
    addComplaintMarkers(complaints, map, complaintIcon);
  };

  const addComplaintMarkers = (data, map, complaintIcon) => {
    if (!map) return;
    const L = window.L;
    const iconFn = complaintIcon || ((status) => {
      const colors = { 'Submitted': '#3b82f6', 'Accepted': '#8b5cf6', 'Under Investigation': '#f59e0b', 'Resolved': '#10b981', 'Rejected': '#ef4444' };
      const color = colors[status] || '#3b82f6';
      return L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
    });

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    data.forEach(c => {
      if (!c.location?.coordinates) return;
      const [lon, lat] = c.location.coordinates;
      const marker = L.marker([lat, lon], { icon: iconFn(c.status) })
        .addTo(map)
        .on('click', () => setSelected(c));

      marker.bindTooltip(`<div style="font-size:12px;font-weight:600">${c.title}</div><div style="font-size:11px;color:#666">${c.status}</div>`, {
        direction: 'top', offset: [0, -8]
      });
      markersRef.current.push(marker);
    });
  };

  // Re-render markers when filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const filtered = filter === 'all' ? complaints
      : filter === 'active' ? complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected')
      : complaints.filter(c => c.status === 'Resolved');
    addComplaintMarkers(filtered, mapInstanceRef.current);
  }, [filter, complaints]);

  // Pan to selected complaint
  useEffect(() => {
    if (!selected || !mapInstanceRef.current) return;
    if (!selected.location?.coordinates) return;
    const [lon, lat] = selected.location.coordinates;
    mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 0.8 });
  }, [selected]);

  const openRoute = (complaint) => {
    if (!complaint?.location?.coordinates || !complaint?.assignedStation?.location?.coordinates) return;
    const [cLon, cLat] = complaint.location.coordinates;
    const [sLon, sLat] = complaint.assignedStation.location.coordinates;
    window.open(`https://www.google.com/maps/dir/${sLat},${sLon}/${cLat},${cLon}`, '_blank');
  };

  const openOSMRoute = (complaint) => {
    if (!complaint?.location?.coordinates) return;
    const [cLon, cLat] = complaint.location.coordinates;
    window.open(`https://www.openstreetmap.org/?mlat=${cLat}&mlon=${cLon}&zoom=16`, '_blank');
  };

  const filteredComplaints = filter === 'all' ? complaints
    : filter === 'active' ? complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected')
    : complaints.filter(c => c.status === 'Resolved');

  const statusColors = {
    'Submitted': '#3b82f6', 'Accepted': '#8b5cf6',
    'Under Investigation': '#f59e0b', 'Resolved': '#10b981', 'Rejected': '#ef4444'
  };

  return (
    <Layout title="Complaint Map" subtitle="Live location view — powered by OpenStreetMap (free)">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 160px)', minHeight: 500 }}>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

          {/* Header + filter */}
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              Complaints ({filteredComplaints.length})
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'active', 'resolved'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'capitalize', transition: 'all 0.15s',
                  background: filter === f ? 'var(--gradient-blue)' : 'var(--bg-secondary)',
                  color: filter === f ? 'white' : 'var(--text-secondary)',
                }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '6px 12px', flexShrink: 0 }}>
            {Object.entries(statusColors).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#1e40af', fontSize: 8 }}>🏛</div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Station</span>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 8 }} />)}
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No complaints to show</div>
            ) : (
              filteredComplaints.map(c => (
                <div key={c._id} onClick={() => setSelected(selected?._id === c._id ? null : c)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    background: selected?._id === c._id ? 'rgba(37,99,235,0.1)' : 'transparent',
                    borderLeft: `3px solid ${selected?._id === c._id ? 'var(--accent-blue)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (selected?._id !== c._id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (selected?._id !== c._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[c.status] || '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                    {getCategoryIcon(c.category)} {c.category} · {c.complaintId}
                  </div>
                  {c.locationAddress && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {c.locationAddress?.slice(0, 45)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map + detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

          {/* Selected complaint detail */}
          {selected && (
            <div className="card" style={{ padding: '12px 16px', flexShrink: 0, animation: 'slideIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16 }}>{getCategoryIcon(selected.category)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{selected.title}</span>
                    <span className={`badge ${getStatusBadgeClass(selected.status)}`}>{selected.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {selected.citizenName} · {selected.stationName} · {selected.distanceToStation} km away
                  </div>
                  {selected.location?.coordinates && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {selected.location.coordinates[1].toFixed(5)}, {selected.location.coordinates[0].toFixed(5)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openOSMRoute(selected)} className="btn btn-secondary btn-sm">
                    <ExternalLink size={13} /> OSM
                  </button>
                  <button onClick={() => openRoute(selected)} className="btn btn-primary btn-sm">
                    <Navigation size={13} /> Route
                  </button>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map container */}
          <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', minHeight: 400 }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', zIndex: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTop: '3px solid var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading map...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Free badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 99, fontSize: 11, color: '#34d399', fontWeight: 600 }}>
                ✓ OpenStreetMap — 100% Free, No API Key
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{complaints.filter(c => c.location?.coordinates).length} pinned locations · {stations.length} stations</span>
            </div>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>
              © OpenStreetMap contributors
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
