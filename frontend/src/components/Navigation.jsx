import React from 'react';
import { LayoutDashboard, AlertCircle, ShieldAlert, MessageSquare, Megaphone, PhoneCall } from 'lucide-react';

export function Navigation({ activeTab, setActiveTab, activeAlertCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Live Feed & Dashboard', icon: LayoutDashboard, badge: activeAlertCount },
    { id: 'sos', label: 'Trigger Emergency SOS', icon: AlertCircle, highlight: true },
    { id: 'incidents', label: 'Incidents & Dispatch', icon: ShieldAlert },
    { id: 'chat', label: 'Community Chat', icon: MessageSquare },
    { id: 'announcements', label: 'Broadcast Advisories', icon: Megaphone },
    { id: 'directory', label: 'Emergency Contacts', icon: PhoneCall },
  ];

  return (
    <nav
      className="desktop-nav"
      style={{
        background: 'rgba(13, 18, 30, 0.7)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0 24px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? '3px solid var(--primary-red)' : '3px solid transparent',
              color: isActive ? 'var(--primary-red)' : tab.highlight ? '#ff4757' : 'var(--text-muted)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={18} color={isActive ? 'var(--primary-red)' : tab.highlight ? '#ff4757' : 'currentColor'} />
            {tab.label}

            {tab.badge > 0 && (
              <span
                style={{
                  background: 'var(--primary-red)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
