import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, Loader, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import Layout from '../../components/shared/Layout';
import api from '../../utils/api';
import { COMPLAINT_CATEGORIES } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'Medium', isAnonymous: false, locationAddress: '' });
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, detecting, success, error
  const [nearestStation, setNearestStation] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLocationStatus('success');
        // Find nearest station
        try {
          const res = await api.post('/stations/nearest', { latitude, longitude });
          setNearestStation(res.data);
          toast.success(`Nearest station: ${res.data.station.name}`);
          // Try reverse geocode address
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const geoData = await geoRes.json();
            setForm(p => ({ ...p, locationAddress: geoData.display_name?.slice(0, 150) || '' }));
          } catch {}
        } catch { toast.error('Could not find nearest station'); }
      },
      (err) => {
        setLocationStatus('error');
        toast.error('Location access denied. Please enable location permission.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles].slice(0, 5));
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) return toast.error('Please fill all required fields');
    if (!location) return toast.error('Please detect your location first');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      files.forEach(f => formData.append('evidence', f));

      const res = await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Complaint submitted successfully!');
      navigate(`/citizen/complaints/${res.data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Submit Complaint" subtitle="Provide details about the incident">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Location section */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>📍 Live Location Detection</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Your complaint will be automatically routed to the nearest police station.</p>

            {locationStatus === 'idle' && (
              <button type="button" onClick={detectLocation} className="btn btn-primary">
                <Navigation size={16} /> Detect My Location
              </button>
            )}

            {locationStatus === 'detecting' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 'var(--radius-md)' }}>
                <Loader size={18} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 14, color: 'var(--accent-blue)' }}>Detecting your location...</span>
              </div>
            )}

            {locationStatus === 'error' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <AlertTriangle size={18} color="#f87171" />
                  <span style={{ fontSize: 14, color: '#f87171' }}>Location access denied. Please enable location in your browser.</span>
                </div>
                <button type="button" onClick={detectLocation} className="btn btn-secondary btn-sm">Try Again</button>
              </div>
            )}

            {locationStatus === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <CheckCircle size={18} color="#10b981" />
                  <div>
                    <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600 }}>Location detected</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {location?.latitude?.toFixed(6)}, {location?.longitude?.toFixed(6)}
                    </div>
                  </div>
                  <button type="button" onClick={detectLocation} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Refresh</button>
                </div>

                {nearestStation && (
                  <div style={{ padding: '16px', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <MapPin size={16} color="var(--accent-blue)" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Auto-assigned to:</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 4 }}>{nearestStation.station.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{nearestStation.station.address} · {nearestStation.station.city}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-cyan)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>📏 {nearestStation.distance} km away</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Location Description</label>
                  <input className="input" placeholder="e.g., Near SBI Bank, Jubilee Hills" value={form.locationAddress} onChange={e => setForm(p => ({ ...p, locationAddress: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          {/* Complaint details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>📋 Complaint Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="label">Complaint Title *</label>
                <input className="input" placeholder="Brief title of the incident" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Category *</label>
                  <select className="input select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Priority</label>
                  <select className="input select" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Detailed Description *</label>
                <textarea className="input" rows={6} placeholder="Describe the incident in detail — when, what happened, involved persons, etc." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical', minHeight: 120 }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(p => ({ ...p, isAnonymous: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent-blue)' }} />
                <div>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Submit Anonymously</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>Your identity will be hidden from police officers</span>
                </div>
              </label>
            </div>
          </div>

          {/* Evidence */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>📎 Evidence Upload</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Upload photos, videos, or documents (max 5 files, 10MB each)</p>

            <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary" style={{ marginBottom: files.length ? 12 : 0 }}>
              <Upload size={16} /> Choose Files
            </button>

            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', items: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{file.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate('/citizen')} className="btn btn-secondary btn-lg">Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !location}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : '🚀 Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
