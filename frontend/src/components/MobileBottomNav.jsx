import React from 'react';
import { LayoutDashboard, AlertCircle, ShieldAlert, MessageSquare, PhoneCall } from 'lucide-react';

export function MobileBottomNav({ activeTab, setActiveTab, activeAlertCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Feed', icon: LayoutDashboard, badge: activeAlertCount },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
    { id: 'sos', label: 'SOS', icon: AlertCircle, isPanic: true },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'directory', label: 'Contacts', icon: PhoneCall },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65px',
        background: 'rgba(9, 13, 22, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 999,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isPanic) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn-sos-pulse"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4757, #d63031)',
                border: '2px solid #fff',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '-24px',
                boxShadow: '0 4px 15px rgba(255, 71, 87, 0.6)',
                cursor: 'pointer',
              }}
            >
              <AlertCircle size={22} />
              <span style={{ fontSize: '9px', fontWeight: 900 }}>SOS</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--primary-red)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              cursor: 'pointer',
              position: 'relative',
              flex: 1,
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>

            {tab.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: 'calc(50% - 14px)',
                  background: 'var(--primary-red)',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
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
