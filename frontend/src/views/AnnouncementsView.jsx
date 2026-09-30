import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Bell, ShieldAlert, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function AnnouncementsView() {
  const { currentRoleKey } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('HIGH');

  const canBroadcast = currentRoleKey === 'SECURITY' || currentRoleKey === 'ADMIN';

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch {
      setAnnouncements([
        { id: 1, title: '🔥 Scheduled Fire Drill Notice', content: 'Comprehensive society fire evacuation mock drill scheduled for Saturday at 10:00 AM.', priority: 'HIGH', created_at: '2 hours ago', author: 'Security Officer Marcus' },
        { id: 2, title: '⚡ Power Substation Maintenance', content: 'Backup generators active between 2 PM and 4 PM due to transformer upgrade.', priority: 'NORMAL', created_at: ' Yesterday', author: 'Facility Admin' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({ title, content, priority });
      setShowModal(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch {
      setAnnouncements((prev) => [
        { id: Date.now(), title, content, priority, created_at: 'Just now', author: 'You' },
        ...prev,
      ]);
      setShowModal(false);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone color="var(--primary-red)" />
            COMMUNITY BROADCAST ADVISORIES
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Official announcements, weather alerts, and society security notices.
          </p>
        </div>

        {canBroadcast && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Broadcast New Advisory
          </button>
        )}
      </div>

      {/* Announcements Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {announcements.map((item) => (
          <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: item.priority === 'CRITICAL' ? '#ff4757' : item.priority === 'HIGH' ? '#ffa502' : '#1e90ff',
                  background: item.priority === 'CRITICAL' ? 'rgba(255,71,87,0.15)' : item.priority === 'HIGH' ? 'rgba(255,165,2,0.15)' : 'rgba(30,144,255,0.15)',
                  border: `1px solid ${item.priority === 'CRITICAL' ? '#ff4757' : item.priority === 'HIGH' ? '#ffa502' : '#1e90ff'}`,
                }}
              >
                {item.priority || 'ADVISORY'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.created_at}</span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{item.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.content}</p>

            <div style={{ pt: '8px', borderTop: '1px solid var(--border-glass)', fontSize: '11px', color: 'var(--text-dim)' }}>
              Posted by: <strong>{item.author || 'Society Management'}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Creation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form className="glass-card" onSubmit={handleCreate} style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Create New Broadcast Advisory</h3>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Title</label>
              <input type="text" className="input-glass" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fire Safety Advisory" />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Priority Level</label>
              <select className="input-glass" value={priority} onChange={(e) => setPriority(e.target.value)} style={{ background: '#090d16' }}>
                <option value="NORMAL">Normal Info</option>
                <option value="HIGH">High Importance</option>
                <option value="CRITICAL">Critical Emergency Advisory</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Advisory Message Content</label>
              <textarea className="input-glass" rows={4} required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter details..." />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Publish Broadcast</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
