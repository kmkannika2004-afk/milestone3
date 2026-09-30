import React, { useState } from 'react';
import { PhoneCall, Search, Shield, Stethoscope, Wrench, ShieldAlert } from 'lucide-react';

export function DirectoryView() {
  const [search, setSearch] = useState('');

  const contacts = [
    { id: 1, name: 'Main Gate Security Station', category: 'Security', phone: '9876543220', note: '24/7 Gate Guard Desk' },
    { id: 2, name: 'Society Medical First-Aid Desk', category: 'Medical', phone: '9876543230', note: 'Nurse & Oxygen Station' },
    { id: 3, name: 'Facility Electrical & Generator', category: 'Maintenance', phone: '9876543240', note: 'Power backup technician' },
    { id: 4, name: 'Elevator Emergency Service Desk', category: 'Maintenance', phone: '9876543250', note: 'Lift entrapment rescue' },
    { id: 5, name: 'Municipal Fire Brigade Headquarters', category: 'External Services', phone: '101', note: 'City Fire Dispatch' },
    { id: 6, name: 'Local Police Precinct Control', category: 'External Services', phone: '112', note: 'Emergency Police Dispatch' },
  ];

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PhoneCall color="var(--accent-cyan)" />
          EMERGENCY CONTACT DIRECTORY
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Verified hotlines for security posts, medical staff, and municipal emergency control.
        </p>
      </div>

      {/* Search Input */}
      <div className="glass-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          className="input-glass"
          placeholder="Filter directory by contact name, department, or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Directory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-cyan)', background: 'rgba(30,144,255,0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--accent-cyan)' }}>
                {item.category.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>{item.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.note}</p>
            </div>

            <div style={{ pt: '10px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '16px', color: 'var(--success-emerald)' }}>
                {item.phone}
              </span>
              <a href={`tel:${item.phone}`} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <PhoneCall size={14} /> Call Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
