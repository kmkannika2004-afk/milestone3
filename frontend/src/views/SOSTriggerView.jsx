import React, { useState } from 'react';
import { AlertCircle, Stethoscope, Flame, ShieldAlert, Zap, Radio, MapPin, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SOSTriggerView({ onTriggerSOS, playSiren }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('MEDICAL');
  const [flatNumber, setFlatNumber] = useState('Flat A-101');
  const [emergencyNote, setEmergencyNote] = useState('');
  const [locationStatus, setLocationStatus] = useState('GPS Location Acquired (12.9716° N, 77.5946° E)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState(null);

  const categories = [
    { id: 'MEDICAL', label: 'Medical Emergency', icon: Stethoscope, color: '#ff4757', desc: 'Heart attack, injury, breathing issues' },
    { id: 'FIRE', label: 'Fire & Gas Leak', icon: Flame, color: '#ff6b81', desc: 'Kitchen fire, smoke, electrical sparks' },
    { id: 'CRIME', label: 'Crime & Security', icon: ShieldAlert, color: '#ffa502', desc: 'Break-in, intruder, physical assault' },
    { id: 'DISASTER', label: 'Natural Disaster', icon: Zap, color: '#9b59b6', desc: 'Earthquake, severe storm, flood' },
    { id: 'GENERAL', label: 'General Help', icon: Radio, color: '#1e90ff', desc: 'Elevator trap, elderly assistance' },
  ];

  const handleFetchLocation = () => {
    setLocationStatus('Acquiring high-precision GPS position...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus(`GPS Locked (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`);
        },
        () => {
          setLocationStatus('GPS fallback: Society Block A, Flat A-101');
        }
      );
    }
  };

  const handleSOSTrigger = async () => {
    setIsSubmitting(true);
    playSiren();

    const payload = {
      category: selectedCategory,
      alert_type: selectedCategory.toLowerCase(),
      flat_number: flatNumber,
      location: flatNumber,
      note: emergencyNote || `Urgent ${selectedCategory} emergency reported by ${user?.name || 'Resident'}!`,
      latitude: 12.9716,
      longitude: 77.5946,
    };

    try {
      const res = await onTriggerSOS(payload);
      setSubmittedAlert(res || payload);
    } catch (err) {
      console.error('Trigger SOS error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <AlertCircle size={28} />
          PANIC BUTTON & SOS DISPATCH
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Instantly alert nearby security officers, medical responders, and society guardians.
        </p>
      </div>

      {submittedAlert ? (
        <div className="glass-card" style={{ borderColor: 'var(--success-emerald)', textAlign: 'center', padding: '30px' }}>
          <CheckCircle2 size={56} color="var(--success-emerald)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success-emerald)' }}>SOS EMERGENCY BROADCASTED!</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '12px 0 20px 0' }}>
            Emergency response teams and security officers have received your coordinates. Stay calm and remain in place.
          </p>
          <button className="btn-secondary" onClick={() => setSubmittedAlert(null)}>
            Trigger Another Alert
          </button>
        </div>
      ) : (
        <>
          {/* Main Giant Red SOS Pulse Button */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <button
              onClick={handleSOSTrigger}
              disabled={isSubmitting}
              className="btn-sos-pulse"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ff6b81 0%, #ff4757 70%, #d63031 100%)',
                border: '4px solid rgba(255, 255, 255, 0.4)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow-red)',
                transition: 'all 0.2s',
              }}
            >
              <AlertCircle size={48} />
              <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '1px', marginTop: '6px' }}>
                {isSubmitting ? 'SENDING...' : 'SOS'}
              </span>
              <span style={{ fontSize: '10px', opacity: 0.9 }}>TAP TO BROADCAST</span>
            </button>
          </div>

          {/* Emergency Category Pill Selector */}
          <div className="glass-card">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-muted)' }}>
              1. SELECT EMERGENCY TYPE
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      background: isSelected ? `${cat.color}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? cat.color : 'var(--border-glass)'}`,
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={24} color={cat.color} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? cat.color : 'var(--text-main)' }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Details Form */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
              2. LOCATION & ADDITIONAL DETAILS
            </h3>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                FLAT / UNIT NUMBER
              </label>
              <input
                type="text"
                className="input-glass"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. Flat A-101, Block B"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>GEOLOCATION STAMP</label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <MapPin size={12} /> Refetch GPS
                </button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                {locationStatus}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                OPTIONAL EMERGENCY NOTE / INSTRUCTIONS
              </label>
              <textarea
                className="input-glass"
                rows={3}
                placeholder="Describe situation (e.g. Gas odor detected, elderly person fallen)..."
                value={emergencyNote}
                onChange={(e) => setEmergencyNote(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
              onClick={handleSOSTrigger}
              disabled={isSubmitting}
            >
              <AlertCircle size={18} />
              {isSubmitting ? 'DISPATCHING EMERGENCY ALERT...' : 'CONFIRM & SEND SOS DISPATCH'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
