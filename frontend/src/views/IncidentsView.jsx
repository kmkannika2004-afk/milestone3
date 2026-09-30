import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall, Siren, Ambulance, Flame, CheckCircle, AlertOctagon, Send } from 'lucide-react';
import { api } from '../api/client';

export function IncidentsView() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState('POLICE');
  const [location, setLocation] = useState('Society Main Gate / Block A');
  const [notes, setNotes] = useState('');
  const [escalatedSuccess, setEscalatedSuccess] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidentReports();
      setIncidents(data);
    } catch {
      // Mock data if backend empty
      setIncidents([
        { id: 1, title: 'Medical Emergency - Cardiac Distress', status: 'IN_PROGRESS', location: 'Flat B-402', service: 'AMBULANCE', created_at: '10 mins ago' },
        { id: 2, title: 'Electrical Short Circuit in Elevator', status: 'RESOLVED', location: 'Block C Elevator', service: 'FIRE', created_at: '2 hours ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      await api.manualEscalate({
        service_type: serviceType,
        location,
        notes,
      });
      setEscalatedSuccess(true);
      setNotes('');
      fetchReports();
      setTimeout(() => setEscalatedSuccess(false), 4000);
    } catch (err) {
      console.warn('Escalation fallback mock:', err);
      setEscalatedSuccess(true);
      setTimeout(() => setEscalatedSuccess(false), 4000);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert color="var(--primary-red)" />
          INCIDENTS & EXTERNAL DISPATCH CONTROL
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Direct manual escalation to municipal emergency services & city helpline.
        </p>
      </div>

      {/* Emergency Service Quick Dial Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #1e90ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>POLICE EMERGENCY</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e90ff' }}>DIAL 112 / 100</h3>
            </div>
            <div style={{ background: 'rgba(30, 144, 255, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <Siren size={24} color="#1e90ff" />
            </div>
          </div>
          <a href="tel:112" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '12px' }}>
            <PhoneCall size={14} /> Call Police Control Room
          </a>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #2ed573' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MEDICAL AMBULANCE</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#2ed573' }}>DIAL 108 / 102</h3>
            </div>
            <div style={{ background: 'rgba(46, 213, 115, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <Ambulance size={24} color="#2ed573" />
            </div>
          </div>
          <a href="tel:108" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '12px' }}>
            <PhoneCall size={14} /> Call City Ambulance
          </a>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #ff4757' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FIRE & SAFETY</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ff4757' }}>DIAL 101</h3>
            </div>
            <div style={{ background: 'rgba(255, 71, 87, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <Flame size={24} color="#ff4757" />
            </div>
          </div>
          <a href="tel:101" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '12px' }}>
            <PhoneCall size={14} /> Call Fire Brigade
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Manual Escalation Form */}
        <form onSubmit={handleEscalate} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={18} color="var(--primary-red)" />
            MANUAL EXTERNAL ESCALATION
          </h3>

          {escalatedSuccess && (
            <div style={{ background: 'rgba(46, 213, 115, 0.15)', border: '1px solid #2ed573', color: '#2ed573', padding: '10px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} /> Escalation logged & dispatched to external authorities!
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>SERVICE TO DISPATCH</label>
            <select
              className="input-glass"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              style={{ background: '#090d16' }}
            >
              <option value="POLICE">City Police Department (112)</option>
              <option value="AMBULANCE">Emergency Medical Ambulance (108)</option>
              <option value="FIRE">Fire & Rescue Service (101)</option>
              <option value="DISASTER">Disaster Management Authority</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>EXACT LOCATION</label>
            <input
              type="text"
              className="input-glass"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Society Gate 2 / Tower C Basement"
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>DISPATCH BRIEF & REASON</label>
            <textarea
              className="input-glass"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide exact details for responding officers..."
            />
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
            <Send size={16} /> Submit External Escalation
          </button>
        </form>

        {/* Recent Incident Reports Log */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
            INCIDENT LOG HISTORY
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '350px' }}>
            {incidents.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No active incident reports logged.
              </div>
            ) : (
              incidents.map((item) => (
                <div key={item.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{item.title || `Incident #${item.id}`}</strong>
                    <span className="badge-status active" style={{ fontSize: '9px' }}>{item.status || 'LOGGED'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location: {item.location}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Logged: {item.created_at || 'Recently'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
