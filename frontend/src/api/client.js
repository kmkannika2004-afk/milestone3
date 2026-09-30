/* -------------------------------------------------------------------------- */
/* CERP React API Client                                                       */
/* -------------------------------------------------------------------------- */

const API_BASE = '/api/v1';

export const DEMO_ROLES = {
  RESIDENT: { phone_number: '9876543210', password: 'Password123', name: 'Ravi Kumar', roleLabel: 'Resident (Flat A-101)', roleKey: 'RESIDENT', color: '#3b82f6' },
  GUARDIAN: { phone_number: '9876543230', password: 'Password123', name: 'Sarah Kumar', roleLabel: 'Guardian (Family Responder)', roleKey: 'GUARDIAN', color: '#10b981' },
  VOLUNTEER: { phone_number: '9876543240', password: 'Password123', name: 'Priya Sharma', roleLabel: 'Volunteer Responder', roleKey: 'VOLUNTEER', color: '#f59e0b' },
  SECURITY: { phone_number: '9876543220', password: 'Password123', name: 'Officer Marcus Vance', roleLabel: 'Security Officer', roleKey: 'SECURITY', color: '#8b5cf6' },
  SOCIETY_ADMIN: { phone_number: '9876543250', password: 'Password123', name: 'Anita Desai', roleLabel: 'Society Admin (Green Valley)', roleKey: 'SOCIETY_ADMIN', color: '#14b8a6' },
  PLATFORM_ADMIN: { phone_number: '9900939609', password: 'Admin@1234', name: 'System Administrator', roleLabel: 'Platform Admin', roleKey: 'PLATFORM_ADMIN', color: '#ec4899' }
};

export function getAuthToken() {
  return localStorage.getItem('cerp_jwt') || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('cerp_jwt', token);
  } else {
    localStorage.removeItem('cerp_jwt');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP Error ${res.status}`);
    }

    // Return JSON if present
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return true;
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  async login(phone_number, password) {
    const data = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ phone_number, password }),
    });
    const token = data.data?.access_token || data.access || data.access_token;
    if (token) setAuthToken(token);
    return data;
  },

  // SOS Alerts
  async getSOSAlerts() {
    try {
      const res = await request('/sos/alerts/');
      return res.results || res.data || res || [];
    } catch {
      return [];
    }
  },

  async getDashboardStats() {
    try {
      return await request('/sos/alerts/dashboard-stats/');
    } catch {
      return null;
    }
  },

  async triggerSOS(payload) {
    return await request('/sos/alerts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async respondToSOS(alertId, action = 'accepted') {
    return await request(`/sos/alerts/${alertId}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async resolveSOS(alertId, resolutionNotes = '') {
    return await request(`/sos/alerts/${alertId}/resolve/`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: resolutionNotes }),
    });
  },

  async cancelSOS(alertId, reason = '') {
    return await request(`/sos/alerts/${alertId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ cancellation_reason: reason }),
    });
  },

  async assignResponder(alertId, responderId) {
    return await request(`/sos/alerts/${alertId}/assign-responder/`, {
      method: 'POST',
      body: JSON.stringify({ responder_id: responderId }),
    });
  },

  // Emergency Escalations & Incident Reports
  async manualEscalate(payload) {
    return await request('/response/escalations/manual-escalate/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getIncidentReports() {
    try {
      const res = await request('/response/incident-reports/');
      return res.results || res.data || res || [];
    } catch {
      return [];
    }
  },

  // Directory & Communication
  async getDirectory() {
    try {
      const res = await request('/communication/contact-directory/');
      return res.results || res.data || res || [];
    } catch {
      return [];
    }
  },

  async getAnnouncements() {
    try {
      const res = await request('/communication/announcements/');
      return res.results || res.data || res || [];
    } catch {
      return [];
    }
  },

  async createAnnouncement(payload) {
    return await request('/communication/announcements/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getChatRooms() {
    try {
      const res = await request('/communication/chat-rooms/');
      return res.results || res.data || res || [];
    } catch {
      return [];
    }
  },

  async getRoomMessages(roomId) {
    try {
      const res = await request(`/communication/chat-rooms/${roomId}/messages/`);
      return res.results || res.data || res || [];
    } catch {
      return [];
    }
  }
};
