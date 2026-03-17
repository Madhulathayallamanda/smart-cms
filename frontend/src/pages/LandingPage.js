import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Clock, ChevronRight, CheckCircle, Zap, Lock, BarChart3 } from 'lucide-react';

const features = [
  { icon: MapPin, title: 'Auto Location Detection', desc: 'GPS-based live location capture with automatic routing to nearest police station.', color: 'var(--accent-cyan)' },
  { icon: Zap, title: 'Instant Assignment', desc: 'Haversine distance algorithm assigns complaints to the closest station instantly.', color: 'var(--accent-gold)' },
  { icon: Clock, title: 'Real-Time Tracking', desc: 'Monitor complaint status updates live. Know every step of the investigation.', color: 'var(--accent-green)' },
  { icon: Lock, title: 'Secure & Anonymous', desc: 'File complaints anonymously with military-grade JWT authentication protection.', color: 'var(--accent-purple)' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive dashboards for citizens, police officers and administrators.', color: 'var(--accent-blue)' },
  { icon: Shield, title: 'Multi-Role System', desc: 'Separate portals for Citizens, Police Officers and Administrators.', color: 'var(--accent-orange)' },
];

const steps = [
  { num: '01', title: 'Register & Login', desc: 'Create your account and securely log into the citizen portal.' },
  { num: '02', title: 'Allow Location', desc: 'Share your GPS coordinates for automatic station routing.' },
  { num: '03', title: 'Submit Complaint', desc: 'Fill the form with details and upload supporting evidence.' },
  { num: '04', title: 'Auto Assignment', desc: 'System calculates nearest police station and assigns complaint.' },
  { num: '05', title: 'Track Progress', desc: 'Get real-time status updates as police investigate your case.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', background: 'rgba(5,8,16,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'var(--gradient-blue)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-blue)' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>SmartCMS</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Police Complaint System</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '100px 40px 80px', textAlign: 'center', position: 'relative', background: 'var(--gradient-hero)' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.08)', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>TELANGANA POLICE — SMART PORTAL</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--text-primary)' }}>
            Report. Track.
            <br />
            <span style={{ background: 'var(--gradient-blue)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Resolve.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            File police complaints instantly with GPS-based auto-routing to the nearest police station. Real-time tracking, transparent investigations.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              File a Complaint <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Track Status
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
            {[['10+', 'Police Stations'], ['99.9%', 'Uptime'], ['< 2min', 'Assignment Time'], ['24/7', 'Availability']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>How It Works</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Five simple steps from complaint to resolution</p>
        </div>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ flex: '1 1 180px', minWidth: 160, padding: '24px 20px', position: 'relative', textAlign: 'center' }}>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', top: 36, left: '60%', right: 0, height: 1, background: 'var(--border)', zIndex: 0 }} />
              )}
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-blue)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'white' }}>{step.num}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{step.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Key Features</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Built for citizens. Optimized for police. Designed for justice.</p>
          </div>
          <div className="grid-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card" style={{ padding: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo credentials */}
      <section style={{ padding: '60px 40px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>Try Demo Accounts</h2>
        <div className="grid-3" style={{ textAlign: 'left' }}>
          {[
            { role: 'Citizen', email: 'citizen@example.com', pass: 'Citizen@123', color: 'var(--accent-cyan)' },
            { role: 'Police Officer', email: 'officer@jh.police.gov.in', pass: 'Officer@123', color: 'var(--accent-blue)' },
            { role: 'Admin', email: 'admin@police.gov.in', pass: 'Admin@123', color: 'var(--accent-gold)' },
          ].map(({ role, email, pass, color }) => (
            <div key={role} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{role}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{email}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pass}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <p>© 2025 Smart Police Complaint Management System — Telangana Police</p>
        <p style={{ marginTop: 4, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Built with React + Node.js + MongoDB Atlas</p>
      </footer>
    </div>
  );
}
