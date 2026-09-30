import React, { useState, useEffect } from 'react';
import { ShieldAlert, Volume2, VolumeX, Clock, UserCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({ soundEnabled, toggleSound }) {
  const { currentRoleKey, user, switchRole, availableRoles, isAuthenticating } = useAuth();
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-header">
      {/* Brand Logo & Status */}
      <div className="header-brand">
        <div className="brand-logo">
          <ShieldAlert size={24} />
        </div>
        <div>
          <div className="brand-title">
            CERP PLATFORM
            <span className="badge-live">LIVE MONITORING</span>
          </div>
          <span className="brand-subtitle">Community Emergency Response Network</span>
        </div>
      </div>

      {/* Clock, Sound, Role Simulator */}
      <div className="header-controls">
        {/* Real-time Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
          <Clock size={16} color="var(--accent-cyan)" />
          <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{timeString}</span>
        </div>

        {/* Mute/Unmute Audio Siren */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Disable Siren Sound' : 'Enable Siren Sound'}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-glass)',
            color: soundEnabled ? 'var(--text-main)' : 'var(--primary-red)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Interactive Role Switcher Simulator */}
        <div className="role-selector-container">
          <UserCheck size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '12px' }}>Simulate Role:</span>
          <select
            value={currentRoleKey}
            onChange={(e) => switchRole(e.target.value)}
            disabled={isAuthenticating}
            className="role-dropdown"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {Object.entries(availableRoles).map(([key, info]) => (
              <option key={key} value={key} style={{ background: '#090d16', color: '#fff' }}>
                {info.roleLabel}
              </option>
            ))}
          </select>
        </div>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e90ff, #9b59b6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#fff',
              fontSize: '14px',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
