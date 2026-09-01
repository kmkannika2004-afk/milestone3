/* -------------------------------------------------------------------------- */
/* CERP — Application Logic & API Client                                       */
/* -------------------------------------------------------------------------- */

const API_BASE = '/api/v1';

// Pre-configured Credentials for Interactive Role Switching
const DEMO_CREDENTIALS = {
    RESIDENT: { phone_number: '9876543210', password: 'Password123', name: 'Elena Rostova', roleLabel: 'Resident (Flat A-101)' },
    SECURITY: { phone_number: '9876543220', password: 'Password123', name: 'Officer Marcus Vance', roleLabel: 'Security Officer' },
    GUARDIAN: { phone_number: '9876543230', password: 'Password123', name: 'Sarah Rostova', roleLabel: 'Primary Guardian' },
    ADMIN:    { phone_number: '9900939609', password: 'Admin@1234',  name: 'System Administrator', roleLabel: 'System Admin' }
};

let currentRole = 'SECURITY';
let currentToken = null;
let allAlerts = [];
let soundEnabled = true;
let audioCtx = null;
let activeModalAlertId = null;

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', async () => {
    updateClock();
    setInterval(updateClock, 1000);

    // Initial Login with default Security role
    await switchRole('SECURITY');

    // Auto Refresh Feed every 5 seconds for live simulation
    setInterval(() => {
        if (currentToken) {
            fetchSOSAlerts(false);
        }
    }, 5000);

    // Category Pill Selector Toggle Logic
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
});

/* -------------------------------------------------------------------------- */
/* System Clock & Audio Synth                                                 */
/* -------------------------------------------------------------------------- */

function updateClock() {
    const clockEl = document.getElementById('systemClock');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toTimeString().split(' ')[0];
    }
}

function playEmergencySiren() {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.warn('Audio playback prevented by browser audio policy.', e);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        btn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
        btn.style.color = soundEnabled ? 'var(--text-main)' : 'var(--primary-red)';
    }
}

/* -------------------------------------------------------------------------- */
/* Role Simulator & Auth                                                      */
/* -------------------------------------------------------------------------- */

async function switchRole(roleKey) {
    currentRole = roleKey;
    const creds = DEMO_CREDENTIALS[roleKey];
    if (!creds) return;

    // Update UI Badges
    document.getElementById('userName').innerText = creds.name;
    document.getElementById('userRoleLabel').innerText = creds.roleLabel;
    document.getElementById('userAvatar').innerText = creds.name.charAt(0);

    try {
        // Authenticate with DRF SimpleJWT
        const res = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone_number: creds.phone_number,
                password: creds.password
            })
        });

        if (!res.ok) {
            console.error('Login failed for role:', roleKey);
            return;
        }

        const data = await res.json();
        currentToken = data.data?.access_token || data.access || data.access_token;
        localStorage.setItem('cerp_jwt', currentToken);

        // Refresh Data Views
        await fetchSOSAlerts();
        await fetchDirectory();
        await fetchAnnouncements();
        await fetchResponders();
    } catch (err) {
        console.error('Error switching role:', err);
    }
}

/* -------------------------------------------------------------------------- */
/* Navigation Routing                                                         */
/* -------------------------------------------------------------------------- */

function navigateTo(viewId) {
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    const targetPanel = document.getElementById(`view-${viewId}`);
    const targetNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);

    if (targetPanel) targetPanel.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    if (viewId === 'analytics') renderAnalyticsCharts();
}

/* -------------------------------------------------------------------------- */
/* API Helpers                                                                */
/* -------------------------------------------------------------------------- */

async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
        ...options.headers
    };

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401) {
        // Re-authenticate silently if expired
        await switchRole(currentRole);
        return apiFetch(endpoint, options);
    }
    return res;
}

/* -------------------------------------------------------------------------- */
/* SOS Alerts Fetch & Rendering                                               */
/* -------------------------------------------------------------------------- */

async function fetchSOSAlerts(showLoading = true) {
    const feedEl = document.getElementById('alertsFeed');
    if (showLoading && feedEl) {
        feedEl.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching emergency feeds...</div>`;
    }

    try {
        const res = await apiFetch('/sos/alerts/');
        if (!res.ok) return;

        const data = await res.json();
        allAlerts = data.results || data;

        updateDashboardCounters(allAlerts);
        renderAlertsFeed(allAlerts);
        renderMyAlerts(allAlerts);
        updateEmergencyBanner(allAlerts);
    } catch (err) {
        console.error('Error fetching SOS alerts:', err);
    }
}

function updateDashboardCounters(alerts) {
    const openCnt = alerts.filter(a => a.status === 'OPEN').length;
    const activeCnt = alerts.filter(a => a.status === 'ACTIVE').length;
    const escCnt = alerts.filter(a => a.status === 'ESCALATED').length;
    const resCnt = alerts.filter(a => a.status === 'RESOLVED').length;

    document.getElementById('cntOpenAlerts').innerText = openCnt;
    document.getElementById('cntActiveAlerts').innerText = activeCnt;
    document.getElementById('cntEscalatedAlerts').innerText = escCnt;
    document.getElementById('cntResolvedAlerts').innerText = resCnt;

    const navBadge = document.getElementById('navActiveCount');
    if (navBadge) navBadge.innerText = openCnt + activeCnt + escCnt;
}

function updateEmergencyBanner(alerts) {
    const banner = document.getElementById('globalEmergencyBanner');
    const activeSOS = alerts.find(a => a.status === 'OPEN' || a.status === 'ACTIVE' || a.status === 'ESCALATED');

    if (activeSOS && banner) {
        banner.style.display = 'flex';
        document.getElementById('bannerCategory').innerText = `${activeSOS.category} EMERGENCY`;
        document.getElementById('bannerMessage').innerText = `${activeSOS.resident_name || 'Resident'} (${activeSOS.location_address || 'Flat A-101'}): ${activeSOS.message || 'Requires immediate help'}`;
        playEmergencySiren();
    } else if (banner) {
        banner.style.display = 'none';
    }
}

function renderAlertsFeed(alerts) {
    const feedEl = document.getElementById('alertsFeed');
    if (!feedEl) return;

    if (alerts.length === 0) {
        feedEl.innerHTML = `<div class="glass-card text-center p-4"><i class="fa-solid fa-shield-check text-success" style="font-size: 36px;"></i><h3 class="mt-2">No Active Emergencies</h3><p class="text-muted">All community sectors are safe and monitored.</p></div>`;
        return;
    }

    feedEl.innerHTML = alerts.map(alert => {
        const iconClass = alert.category === 'MEDICAL' ? 'fa-heart-pulse' :
                          alert.category === 'SECURITY' ? 'fa-user-shield' :
                          alert.category === 'FIRE' ? 'fa-fire-extinguisher' : 'fa-triangle-exclamation';

        const responderText = alert.assigned_responder_name ? 
            `<span class="text-muted"><i class="fa-solid fa-user-check"></i> Responder: <strong>${alert.assigned_responder_name}</strong></span>` :
            `<span class="text-muted"><i class="fa-solid fa-user-clock"></i> Unassigned</span>`;

        return `
            <div class="alert-item-card ${alert.status}">
                <div class="alert-left-details">
                    <div class="alert-type-icon ${alert.category}">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="alert-info-meta">
                        <h4>
                            SOS #${alert.id} — ${alert.category_display || alert.category}
                            <span class="status-badge ${alert.status}">${alert.status}</span>
                        </h4>
                        <div class="alert-resident-name">
                            <i class="fa-solid fa-user"></i> Resident: <strong>${alert.resident_name || 'Elena Rostova'}</strong>
                        </div>
                        <div class="alert-location">
                            <i class="fa-solid fa-location-dot"></i> ${alert.location_address || 'Block A, Greenfield Heights'}
                        </div>
                        ${alert.message ? `<div class="alert-message-text">"${alert.message}"</div>` : ''}
                    </div>
                </div>

                <div class="alert-right-actions">
                    <div class="timer-counter">
                        <i class="fa-solid fa-clock"></i> ${formatTimestamp(alert.created_at)}
                    </div>
                    <div>${responderText}</div>
                    
                    <div class="action-btn-group mt-2">
                        ${(alert.status !== 'RESOLVED' && alert.status !== 'CLOSED') ? `
                            <button class="btn btn-outline" onclick="openAssignModal(${alert.id})">
                                <i class="fa-solid fa-user-plus"></i> Assign
                            </button>
                            <button class="btn btn-success-glow" onclick="openResolveModal(${alert.id})">
                                <i class="fa-solid fa-check"></i> Resolve
                            </button>
                        ` : `
                            <button class="btn btn-outline" disabled><i class="fa-solid fa-circle-check"></i> Handled</button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderMyAlerts(alerts) {
    const listEl = document.getElementById('myAlertsList');
    if (!listEl) return;

    if (alerts.length === 0) {
        listEl.innerHTML = `<p class="text-muted">You have no prior SOS requests.</p>`;
        return;
    }

    listEl.innerHTML = alerts.slice(0, 3).map(a => `
        <div class="responder-card mb-2">
            <div>
                <strong>SOS #${a.id} [${a.category}]</strong> — <span class="status-badge ${a.status}">${a.status}</span>
                <div class="text-muted" style="font-size:12px;">${formatTimestamp(a.created_at)}</div>
            </div>
            <div>
                ${a.status === 'OPEN' || a.status === 'ACTIVE' ? `
                    <button class="btn btn-outline" onclick="cancelSOSAlert(${a.id})"><i class="fa-solid fa-xmark"></i> Cancel</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function filterAlerts(filter, btnEl) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    if (filter === 'ALL') {
        renderAlertsFeed(allAlerts);
    } else if (filter === 'ACTIVE') {
        renderAlertsFeed(allAlerts.filter(a => a.status === 'OPEN' || a.status === 'ACTIVE' || a.status === 'ESCALATED'));
    } else {
        renderAlertsFeed(allAlerts.filter(a => a.category === filter || a.status === filter));
    }
}

/* -------------------------------------------------------------------------- */
/* Resident One-Tap SOS Actions                                               */
/* -------------------------------------------------------------------------- */

async function triggerOneTapSOS() {
    const btn = document.getElementById('sosTriggerButton');
    if (btn) btn.style.transform = 'scale(0.92)';
    
    setTimeout(async () => {
        if (btn) btn.style.transform = 'none';

        const category = document.querySelector('input[name="sosCategory"]:checked')?.value || 'MEDICAL';
        const message = document.getElementById('sosMessageInput').value || 'ONE-TAP SOS BROADCAST FROM RESIDENT PORTAL';
        const location_address = document.getElementById('sosLocationInput').value;

        try {
            const res = await apiFetch('/sos/alerts/', {
                method: 'POST',
                body: JSON.stringify({ category, message, location_address })
            });

            if (res.ok) {
                playEmergencySiren();
                alert('🚨 EMERGENCY SOS BROADCASTED SUCCESSFULLY! Security and Guardians notified.');
                await fetchSOSAlerts();
                navigateTo('command-center');
            } else {
                const errData = await res.json();
                alert('SOS Trigger Failed: ' + JSON.stringify(errData));
            }
        } catch (e) {
            console.error('SOS Trigger Exception:', e);
        }
    }, 150);
}

async function triggerCustomSOS() {
    await triggerOneTapSOS();
}

async function cancelSOSAlert(alertId) {
    if (!confirm('Are you sure you want to cancel this SOS alert?')) return;
    try {
        const res = await apiFetch(`/sos/alerts/${alertId}/cancel/`, { method: 'POST' });
        if (res.ok) {
            await fetchSOSAlerts();
        }
    } catch (e) {
        console.error('Error cancelling alert:', e);
    }
}

/* -------------------------------------------------------------------------- */
/* Modal Dialog Actions                                                       */
/* -------------------------------------------------------------------------- */

function openAssignModal(alertId) {
    activeModalAlertId = alertId;
    document.getElementById('assignAlertId').innerText = alertId;
    document.getElementById('assignModal').style.display = 'flex';
}

function openResolveModal(alertId) {
    activeModalAlertId = alertId;
    document.getElementById('resolveAlertId').innerText = alertId;
    document.getElementById('resolveModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function submitAssignResponder() {
    const responderId = document.getElementById('assignResponderSelect').value;
    if (!responderId) return;

    try {
        const res = await apiFetch(`/sos/alerts/${activeModalAlertId}/assign-responder/`, {
            method: 'POST',
            body: JSON.stringify({ responder_id: responderId })
        });

        if (res.ok) {
            closeModal('assignModal');
            await fetchSOSAlerts();
        }
    } catch (e) {
        console.error('Assign failed:', e);
    }
}

async function submitResolveAlert() {
    const resolution_notes = document.getElementById('resolutionNotes').value || 'Alert resolved by security officer.';

    try {
        const res = await apiFetch(`/sos/alerts/${activeModalAlertId}/resolve/`, {
            method: 'POST',
            body: JSON.stringify({ resolution_notes })
        });

        if (res.ok) {
            closeModal('resolveModal');
            await fetchSOSAlerts();
        }
    } catch (e) {
        console.error('Resolve failed:', e);
    }
}

/* -------------------------------------------------------------------------- */
/* Responders, Directory, Announcements & Chat                                 */
/* -------------------------------------------------------------------------- */

async function fetchResponders() {
    const rosterEl = document.getElementById('responderRoster');
    const selectEl = document.getElementById('assignResponderSelect');

    const dummyResponders = [
        { id: 2, name: 'Officer Marcus Vance', role: 'Security Guard', status: 'ON_DUTY', badge: 'SEC-8891' },
        { id: 4, name: 'Dr. Anita Roy', role: 'Medical Volunteer', status: 'AVAILABLE', badge: 'MED-102' }
    ];

    if (rosterEl) {
        rosterEl.innerHTML = dummyResponders.map(r => `
            <div class="responder-card">
                <div>
                    <strong>${r.name}</strong> (${r.role})
                    <div class="text-muted" style="font-size:12px;">Badge: ${r.badge}</div>
                </div>
                <div>
                    <span class="status-badge RESOLVED">${r.status}</span>
                </div>
            </div>
        `).join('');
    }

    if (selectEl) {
        selectEl.innerHTML = dummyResponders.map(r => `<option value="${r.id}">${r.name} (${r.role})</option>`).join('');
    }
}

async function fetchDirectory() {
    const dirEl = document.getElementById('directoryList');
    if (!dirEl) return;

    try {
        const res = await apiFetch('/communication/contact-directory/');
        if (!res.ok) return;

        const data = await res.json();
        const items = data.results || data;

        dirEl.innerHTML = items.map(item => `
            <div class="responder-card mb-2">
                <div>
                    <strong>${item.service_name}</strong>
                    <div class="text-muted" style="font-size:12px;"><i class="fa-solid fa-phone"></i> ${item.phone_number} | ${item.alternate_phone || ''}</div>
                </div>
                <div>
                    <a href="tel:${item.phone_number}" class="btn btn-outline"><i class="fa-solid fa-phone-flip"></i> Call</a>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error fetching directory:', e);
    }
}

async function fetchAnnouncements() {
    const annEl = document.getElementById('announcementsList');
    if (!annEl) return;

    try {
        const res = await apiFetch('/communication/announcements/');
        if (!res.ok) return;

        const data = await res.json();
        const items = data.results || data;

        annEl.innerHTML = items.map(ann => `
            <div class="glass-card mb-3 p-3" style="border-left:4px solid var(--primary-red);">
                <div class="d-flex justify-content-between">
                    <strong style="color:white;">${ann.title}</strong>
                    <span class="status-badge OPEN">${ann.priority}</span>
                </div>
                <p class="text-muted mt-2" style="font-size:13px;">${ann.content}</p>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error fetching announcements:', e);
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatMessageInput');
    const area = document.getElementById('chatMessagesArea');
    if (!input || !input.value.trim()) return;

    const msg = input.value.trim();
    input.value = '';

    const msgNode = document.createElement('div');
    msgNode.className = 'chat-message user';
    msgNode.innerHTML = `<div class="msg-content"><strong>${DEMO_CREDENTIALS[currentRole].name}:</strong> ${msg}</div>`;

    area.appendChild(msgNode);
    area.scrollTop = area.scrollHeight;
}

/* -------------------------------------------------------------------------- */
/* Analytics Canvas Charts                                                    */
/* -------------------------------------------------------------------------- */

function renderAnalyticsCharts() {
    const catCanvas = document.getElementById('categoryChart');
    const statCanvas = document.getElementById('statusChart');

    if (catCanvas) {
        const ctx = catCanvas.getContext('2d');
        ctx.clearRect(0, 0, 300, 200);

        // Simple custom bar chart rendering
        const categories = [
            { label: 'Medical', count: 5, color: '#ff4757' },
            { label: 'Security', count: 3, color: '#1e90ff' },
            { label: 'Fire', count: 2, color: '#ffa502' },
            { label: 'Fall', count: 1, color: '#9b59b6' }
        ];

        let x = 30;
        categories.forEach(cat => {
            const h = cat.count * 25;
            ctx.fillStyle = cat.color;
            ctx.fillRect(x, 160 - h, 40, h);

            ctx.fillStyle = '#ffffff';
            ctx.font = '11px Inter';
            ctx.fillText(cat.label, x, 180);
            ctx.fillText(cat.count, x + 15, 150 - h);
            x += 65;
        });
    }

    if (statCanvas) {
        const ctx = statCanvas.getContext('2d');
        ctx.clearRect(0, 0, 300, 200);

        const statuses = [
            { label: 'Resolved', count: 12, color: '#2ed573' },
            { label: 'Active', count: 4, color: '#ffa502' },
            { label: 'Open', count: 2, color: '#ff4757' }
        ];

        let x = 40;
        statuses.forEach(s => {
            const h = s.count * 10;
            ctx.fillStyle = s.color;
            ctx.fillRect(x, 160 - h, 50, h);

            ctx.fillStyle = '#ffffff';
            ctx.font = '11px Inter';
            ctx.fillText(s.label, x, 180);
            ctx.fillText(s.count, x + 20, 150 - h);
            x += 80;
        });
    }
}

/* Helper Utilities */
function formatTimestamp(ts) {
    if (!ts) return 'Just now';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
