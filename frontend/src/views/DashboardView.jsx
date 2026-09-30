import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Search,
  MapPin,
  Eye,
  Users,
  Building2,
  Activity,
  PhoneCall,
  Navigation,
  MessageSquare,
  Check,
  X,
  Radio,
  Sliders,
  TrendingUp,
  Award,
  BellRing
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardView({ alerts, onSelectAlert, onRespondAlert, onResolveAlert }) {
  const { currentRoleKey, user } = useAuth();

  const [volunteerAvailable, setVolunteerAvailable] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'active' || a.status === 'RESPONDING' || a.status === 'in_progress');
  const respondingAlerts = alerts.filter(a => a.status === 'RESPONDING' || a.status === 'in_progress');
  const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED' || a.status === 'resolved');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      (alert.resident_name || alert.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.flat_number || alert.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.category || alert.alert_type || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'ACTIVE') {
      return matchesSearch && (alert.status === 'ACTIVE' || alert.status === 'active');
    }
    if (filterStatus === 'RESPONDING') {
      return matchesSearch && (alert.status === 'RESPONDING' || alert.status === 'in_progress');
    }
    if (filterStatus === 'RESOLVED') {
      return matchesSearch && (alert.status === 'RESOLVED' || alert.status === 'resolved');
    }
    return matchesSearch;
  });

  const getCategoryColor = (cat) => {
    switch ((cat || '').toUpperCase()) {
      case 'MEDICAL': return '#ff4757';
      case 'FIRE': return '#ff6b81';
      case 'CRIME':
      case 'SECURITY': return '#ffa502';
      case 'DISASTER': return '#9b59b6';
      default: return '#1e90ff';
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 1. RESIDENT DASHBOARD VIEW                                                 */
  /* -------------------------------------------------------------------------- */
  if (currentRoleKey === 'RESIDENT') {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Welcome Banner */}
        <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0.6))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Good Morning</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0' }}>Ravi Kumar</h2>
              <span style={{ fontSize: '13px', color: 'var(--accent-cyan)' }}>📍 Tower A — Flat 101</span>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '50%' }}>
              <Users size={28} color="#3b82f6" />
            </div>
          </div>
        </div>

        {/* SOS Emergency Panic Tile */}
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '28px 16px',
            background: 'radial-gradient(circle, rgba(255, 71, 87, 0.2) 0%, rgba(15, 23, 42, 0.9) 75%)',
            border: '1px solid rgba(255, 71, 87, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            className="btn-sos-pulse"
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ff4757 0%, #d63031 100%)',
              boxShadow: '0 0 40px rgba(255, 71, 87, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              border: '4px solid #ffffff'
            }}
          >
            <ShieldAlert size={48} />
            <span style={{ fontSize: '18px', fontWeight: 900, marginTop: '4px' }}>SOS</span>
            <span style={{ fontSize: '9px', fontWeight: 700 }}>Get Help Now</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>One-Tap Emergency Dispatch to Guardians & Security</span>
        </div>

        {/* Quick Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#ff4757" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>My Incidents</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Track status</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Guardians</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>3 Connected</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={20} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Emergency</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Security & Helpline</div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="#8b5cf6" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Community</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Announcements</div>
            </div>
          </div>
        </div>

        {/* Recent Incidents Feed */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Recent Incidents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{a.category || a.alert_type}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.created_at || '10 mins ago'}</div>
                </div>
                <span className={`badge-status ${a.status === 'ACTIVE' ? 'active' : 'resolved'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 2. GUARDIAN DASHBOARD VIEW                                                 */
  /* -------------------------------------------------------------------------- */
  if (currentRoleKey === 'GUARDIAN') {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Urgent Emergency Alert Header */}
        <div
          className="glass-card btn-sos-pulse"
          style={{
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9))',
            borderColor: '#10b981'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <AlertTriangle size={24} color="#ff4757" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ff4757' }}>Emergency Alert!</h3>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
            Ravi Kumar needs immediate assistance!
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <MapPin size={14} color="#10b981" />
            <span>Medical Emergency • Tower A - Flat 101</span>
          </div>
        </div>

        {/* Map Preview Location Card */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Live GPS Location</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated 10s ago</span>
          </div>
          <div style={{ height: '140px', background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Navigation size={32} color="#10b981" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tower A — Flat 101 (Lat 12.9716, Long 77.5946)</span>
          </div>
        </div>

        {/* Incident Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" style={{ flex: 1, background: '#10b981', borderColor: '#10b981', justifyContent: 'center', padding: '12px' }}>
            <Check size={18} /> Accept Incident
          </button>
          <button className="btn-secondary" style={{ flex: 1, color: '#ff4757', borderColor: '#ff4757', justifyContent: 'center', padding: '12px' }}>
            <X size={18} /> Decline
          </button>
        </div>

        {/* Direct Resident Message Box */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MessageSquare size={16} color="#10b981" />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Message from Resident</span>
          </div>
          <blockquote style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '6px', margin: 0 }}>
            "I am feeling very weak. Please send help immediately."
          </blockquote>
          <button className="btn-secondary" style={{ marginTop: '12px', width: '100%', justifyContent: 'center', fontSize: '12px' }}>
            View Full Incident Details & Chat
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. VOLUNTEER DASHBOARD VIEW                                                */
  /* -------------------------------------------------------------------------- */
  if (currentRoleKey === 'VOLUNTEER') {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Volunteer Status Header */}
        <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Volunteer Dashboard</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Community First Responder</span>
          </div>
          <button
            onClick={() => setVolunteerAvailable(!volunteerAvailable)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: volunteerAvailable ? '#10b981' : '#6b7280',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={14} /> {volunteerAvailable ? 'Available' : 'Offline'}
          </button>
        </div>

        {/* Nearby Incidents List */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Nearby Incidents</h3>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>View All</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>🚨 Fall Alert</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tower B — Flat 101 (450m away)</div>
              </div>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: '#10b981', borderColor: '#10b981' }}>
                Accept
              </button>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff4757' }}>🚨 Security Concern</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tower A — Flat 202 (150m away)</div>
              </div>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: '#10b981', borderColor: '#10b981' }}>
                Accept
              </button>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>🚨 Medical Emergency</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tower C — Flat 104 (1.2km away)</div>
              </div>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', background: '#10b981', borderColor: '#10b981' }}>
                Accept
              </button>
            </div>
          </div>
        </div>

        {/* My Active Response Card */}
        <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
          <ShieldCheck size={36} color="#f59e0b" style={{ margin: '0 auto 8px auto' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 700 }}>My Active Response</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No active incidents accepted right now. Be ready to help your community!</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 4. SECURITY DASHBOARD VIEW                                                 */
  /* -------------------------------------------------------------------------- */
  if (currentRoleKey === 'SECURITY') {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Security Header */}
        <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.9))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Security Dashboard</h2>
              <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>Officer Marcus Vance • Gate Guard 1</span>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '10px', borderRadius: '50%' }}>
              <ShieldAlert size={24} color="#8b5cf6" />
            </div>
          </div>
        </div>

        {/* Active Incidents Summary */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Active Society Incidents</span>
            <span className="badge-live">LIVE FEED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} className="glass-card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: getCategoryColor(a.category) }}>{a.category}</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>{a.resident_name} ({a.flat_number})</div>
                </div>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => onRespondAlert(a.id)}>
                  Dispatch Guard
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
            <Eye size={20} color="#8b5cf6" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '12px', fontWeight: 700 }}>View All Incidents</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
            <Activity size={20} color="#10b981" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '12px', fontWeight: 700 }}>Update Patrol Status</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
            <MessageSquare size={20} color="#3b82f6" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '12px', fontWeight: 700 }}>Communicate Team</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
            <PhoneCall size={20} color="#ff4757" style={{ margin: '0 auto 4px auto' }} />
            <div style={{ fontSize: '12px', fontWeight: 700 }}>Emergency Contacts</div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 5. SOCIETY ADMIN DASHBOARD VIEW                                            */
  /* -------------------------------------------------------------------------- */
  if (currentRoleKey === 'SOCIETY_ADMIN') {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Admin Header */}
        <div className="glass-card" style={{ borderLeft: '4px solid #14b8a6', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(15, 23, 42, 0.9))' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Society Dashboard</h2>
          <span style={{ fontSize: '12px', color: '#14b8a6' }}>Green Valley Apartments • Anita Desai</span>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#3b82f6' }}>12</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Residents</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #f59e0b' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>5</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Volunteers</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #8b5cf6' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#8b5cf6' }}>8</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Security Staff</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #ff4757' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ff4757' }}>3</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Incidents</div>
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Society Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}>
              👥 Manage Residents, Guardians & Security
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}>
              ⚙️ Configure Emergency Protocols
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}>
              📊 View Audit Logs & Society Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 6. PLATFORM ADMIN DASHBOARD VIEW                                           */
  /* -------------------------------------------------------------------------- */
  if (currentRoleKey === 'PLATFORM_ADMIN') {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Platform Admin Header */}
        <div className="glass-card" style={{ borderLeft: '4px solid #ec4899', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(15, 23, 42, 0.9))' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Platform Dashboard</h2>
          <span style={{ fontSize: '12px', color: '#ec4899' }}>Full System Access & Platform Control</span>
        </div>

        {/* Platform Overview Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #ec4899' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ec4899' }}>24</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Societies</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#3b82f6' }}>1,482</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Users</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #ff4757' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#ff4757' }}>56</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Incidents</div>
          </div>
          <div className="glass-card" style={{ padding: '14px', borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>98%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Response Rate</div>
          </div>
        </div>

        {/* System Settings & Actions */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Platform Controls</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}>
              🏬 Manage Societies & Onboarding
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}>
              ⚡ Configure Escalation Rules & Twilio/Firebase
            </button>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', fontSize: '12px' }}>
              📈 Platform Analytics & System Metrics
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* DEFAULT / GLOBAL INCIDENT FEED DASHBOARD                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE SOS ALERTS</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-red)' }}>{activeAlerts.length}</h2>
            </div>
            <div style={{ background: 'rgba(255, 71, 87, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <AlertTriangle size={24} color="var(--primary-red)" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>RESPONDERS EN-ROUTE</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--warning-amber)' }}>{respondingAlerts.length}</h2>
            </div>
            <div style={{ background: 'rgba(255, 165, 2, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <ShieldCheck size={24} color="var(--warning-amber)" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--success-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>RESOLVED TODAY</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success-emerald)' }}>{resolvedAlerts.length}</h2>
            </div>
            <div style={{ background: 'rgba(46, 213, 115, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <CheckCircle2 size={24} color="var(--success-emerald)" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL LOGGED</span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{alerts.length}</h2>
            </div>
            <div style={{ background: 'rgba(30, 144, 255, 0.15)', padding: '10px', borderRadius: '10px' }}>
              <ShieldAlert size={24} color="var(--accent-cyan)" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="input-glass"
            placeholder="Search by resident name, flat number, alert type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'ACTIVE', 'RESPONDING', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={filterStatus === st ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Alerts Feed List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <ShieldCheck size={48} color="var(--success-emerald)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>No Emergency Alerts Found</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Community status is all clear and normal.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isActive = alert.status === 'ACTIVE' || alert.status === 'active';
            const isResponding = alert.status === 'RESPONDING' || alert.status === 'in_progress';
            const isResolved = alert.status === 'RESOLVED' || alert.status === 'resolved';

            return (
              <div
                key={alert.id}
                className={`glass-card ${isActive ? 'btn-sos-pulse' : ''}`}
                style={{
                  borderColor: isActive ? 'var(--primary-red)' : isResponding ? 'var(--warning-amber)' : 'var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        color: getCategoryColor(alert.category || alert.alert_type),
                        background: 'rgba(255,255,255,0.06)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${getCategoryColor(alert.category || alert.alert_type)}`,
                      }}
                    >
                      {(alert.category || alert.alert_type || 'MEDICAL').toUpperCase()}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>
                      {alert.resident_name || alert.user?.full_name || 'Resident'}
                    </h3>
                  </div>

                  <span className={`badge-status ${isActive ? 'active' : isResponding ? 'responding' : isResolved ? 'resolved' : 'cancelled'}`}>
                    {alert.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Body details */}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <MapPin size={14} color="var(--accent-cyan)" />
                    <span>Flat {alert.flat_number || alert.location || 'A-101'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>
                    "{alert.note || alert.description || 'Emergency SOS signal broadcasted!'}"
                  </div>
                </div>

                {/* Footer action buttons */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-glass)' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px 10px', fontSize: '12px', justifyContent: 'center' }}
                    onClick={() => onSelectAlert(alert)}
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {!isResolved && (
                    <button
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => onRespondAlert(alert.id)}
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
