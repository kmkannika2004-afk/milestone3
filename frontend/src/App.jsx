import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEmergencyAudio } from './hooks/useEmergencyAudio';
import { api } from './api/client';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AlertModal } from './components/AlertModal';

import { DashboardView } from './views/DashboardView';
import { SOSTriggerView } from './views/SOSTriggerView';
import { IncidentsView } from './views/IncidentsView';
import { ChatView } from './views/ChatView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { DirectoryView } from './views/DirectoryView';

// Initial seed alerts for immediate visual demonstration
const INITIAL_DEMO_ALERTS = [
  {
    id: 101,
    resident_name: 'Elena Rostova',
    flat_number: 'A-101',
    category: 'MEDICAL',
    alert_type: 'medical',
    note: 'Chest pain and difficulty breathing in living room.',
    status: 'ACTIVE',
    created_at: '2 mins ago',
  },
  {
    id: 102,
    resident_name: 'David Miller',
    flat_number: 'B-304',
    category: 'FIRE',
    alert_type: 'fire',
    note: 'Kitchen electrical smoke detected.',
    status: 'RESPONDING',
    responder_name: 'Officer Marcus Vance',
    created_at: '15 mins ago',
  },
  {
    id: 103,
    resident_name: 'Sophia Chen',
    flat_number: 'C-502',
    category: 'CRIME',
    alert_type: 'crime',
    note: 'Unknown person attempting lock tamper.',
    status: 'RESOLVED',
    created_at: '1 hour ago',
  },
];

function AppContent() {
  const { soundEnabled, toggleSound, playSiren } = useEmergencyAudio();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState(INITIAL_DEMO_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Fetch SOS Alerts from Django Backend API
  const loadAlerts = async () => {
    try {
      const serverAlerts = await api.getSOSAlerts();
      if (Array.isArray(serverAlerts) && serverAlerts.length > 0) {
        setAlerts(serverAlerts);
      }
    } catch {
      // Fallback to local state if server unreachable
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Handler for Triggering SOS
  const handleTriggerSOS = async (payload) => {
    let created = null;
    try {
      created = await api.triggerSOS(payload);
    } catch {
      // Mock creation
    }

    const newAlert = {
      id: created?.id || Date.now(),
      resident_name: user?.name || 'Resident in Distress',
      flat_number: payload.flat_number || 'A-101',
      category: payload.category,
      alert_type: payload.category.toLowerCase(),
      note: payload.note,
      status: 'ACTIVE',
      created_at: 'Just now',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    playSiren();
    return newAlert;
  };

  // Respond to SOS Alert
  const handleRespondAlert = async (alertId) => {
    try {
      await api.respondToSOS(alertId);
    } catch {
      // Mock update
    }
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'RESPONDING', responder_name: user?.name || 'Security Officer' }
          : a
      )
    );
  };

  // Resolve SOS Alert
  const handleResolveAlert = async (alertId, notes) => {
    try {
      await api.resolveSOS(alertId, notes);
    } catch {
      // Mock update
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED', resolution_notes: notes } : a))
    );
  };

  // Cancel SOS Alert
  const handleCancelAlert = async (alertId, reason) => {
    try {
      await api.cancelSOS(alertId, reason);
    } catch {
      // Mock update
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'CANCELLED', cancellation_reason: reason } : a))
    );
  };

  // Assign Responder
  const handleAssignResponder = async (alertId, responderName) => {
    try {
      await api.assignResponder(alertId, responderName);
    } catch {
      // Mock update
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, responder_name: responderName } : a))
    );
  };

  const activeAlertCount = alerts.filter(
    (a) => a.status === 'ACTIVE' || a.status === 'active'
  ).length;

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header soundEnabled={soundEnabled} toggleSound={toggleSound} />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Views Container */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            alerts={alerts}
            onSelectAlert={(a) => setSelectedAlert(a)}
            onRespondAlert={handleRespondAlert}
            onResolveAlert={(id, notes) => handleResolveAlert(id, notes)}
          />
        )}

        {activeTab === 'sos' && (
          <SOSTriggerView onTriggerSOS={handleTriggerSOS} playSiren={playSiren} />
        )}

        {activeTab === 'incidents' && <IncidentsView />}

        {activeTab === 'chat' && <ChatView />}

        {activeTab === 'announcements' && <AnnouncementsView />}

        {activeTab === 'directory' && <DirectoryView />}
      </main>

      {/* Modal for Alert Details & Actions */}
      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onRespond={handleRespondAlert}
        onResolve={handleResolveAlert}
        onCancel={handleCancelAlert}
        onAssignResponder={handleAssignResponder}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertCount={activeAlertCount}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
