import React, { useState } from 'react';
import { X, MapPin, AlertTriangle, ShieldCheck, CheckCircle2, UserPlus, FileText, PhoneCall } from 'lucide-react';

export function AlertModal({ alert, onClose, onRespond, onResolve, onCancel, onAssignResponder }) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [responderName, setResponderName] = useState('Officer Marcus Vance');

  if (!alert) return null;

  const isResolved = alert.status === 'RESOLVED' || alert.status === 'resolved';
  const isCancelled = alert.status === 'CANCELLED' || alert.status === 'cancelled';
  const isResponding = alert.status === 'RESPONDING' || alert.status === 'in_progress';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 71, 87, 0.3)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} color="#ff4757" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>EMERGENCY ALERT #{alert.id}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Alert Details Body */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CATEGORY</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#ff4757',
                textTransform: 'uppercase',
                background: 'rgba(255,71,87,0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {alert.category || alert.alert_type || 'MEDICAL'}
            </span>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
            {alert.resident_name || alert.user?.full_name || 'Resident in Distress'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
            <MapPin size={15} color="var(--accent-cyan)" />
            <span>Flat {alert.flat_number || alert.location || 'A-101'}</span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '8px' }}>
            <strong>Note:</strong> {alert.note || alert.description || 'Immediate emergency assistance requested!'}
          </div>

          {alert.responder && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)', fontSize: '13px', color: '#ffa502' }}>
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} />
              <strong>Assigned Responder:</strong> {alert.responder.full_name || alert.responder_name || 'Security Response Team'}
            </div>
          )}
        </div>

        {/* Action Forms / Buttons */}
        {!isResolved && !isCancelled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!showResolveForm && !showCancelForm && (
              <>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-warning"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => onRespond(alert.id)}
                  >
                    <ShieldCheck size={16} />
                    Respond & En-route
                  </button>
                  <button
                    className="btn-success"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowResolveForm(true)}
                  >
                    <CheckCircle2 size={16} />
                    Resolve Emergency
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="input-glass"
                      placeholder="Responder Name"
                      value={responderName}
                      onChange={(e) => setResponderName(e.target.value)}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => onAssignResponder(alert.id, responderName)}
                    >
                      <UserPlus size={16} />
                      Assign
                    </button>
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowCancelForm(true)}
                  >
                    Cancel Alert
                  </button>
                </div>
              </>
            )}

            {/* Resolve Form */}
            {showResolveForm && (
              <div style={{ background: 'rgba(46,213,115,0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(46,213,115,0.3)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#2ed573' }}>Resolve Incident</h4>
                <textarea
                  className="input-glass"
                  placeholder="Enter resolution details (e.g., Security arrived, first aid administered, all safe)..."
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setShowResolveForm(false)}>
                    Back
                  </button>
                  <button
                    className="btn-success"
                    onClick={() => {
                      onResolve(alert.id, resolutionNotes);
                      onClose();
                    }}
                  >
                    Confirm Resolve
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Form */}
            {showCancelForm && (
              <div style={{ background: 'rgba(255,71,87,0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,71,87,0.3)' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#ff4757' }}>Cancel Alert (False Alarm)</h4>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Reason for cancellation (e.g. Accidental press)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => setShowCancelForm(false)}>
                    Back
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      onCancel(alert.id, cancelReason);
                      onClose();
                    }}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(isResolved || isCancelled) && (
          <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>
            This emergency alert has been <strong>{alert.status}</strong>.
          </div>
        )}
      </div>
    </div>
  );
}
