import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, Shield, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function ChatView() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([
    { id: 1, name: '🚨 Emergency Response Room', topic: 'Active incident coordination' },
    { id: 2, name: '🛡️ Security Officer Desk', topic: 'Gate control & guard updates' },
    { id: 3, name: '🏥 Medical Volunteer Team', topic: 'First-aid & triage support' },
    { id: 4, name: '🏢 Block A Residents Chat', topic: 'General community updates' },
  ]);

  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [messages, setMessages] = useState([
    { id: 101, sender: 'Officer Marcus Vance', role: 'Security Officer', text: 'All security personnel report to Block A Entrance.', time: '18:30', isSelf: false },
    { id: 102, sender: 'Sarah Rostova', role: 'Primary Guardian', text: 'First aid kit ready at A-101.', time: '18:32', isSelf: false },
  ]);

  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: user?.name || 'Anonymous User',
      role: user?.roleLabel || 'Resident',
      text: inputText,
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated automated responder reply for live interaction demo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'Central Control Station',
          role: 'Automated Bot',
          text: `Message acknowledged in ${activeRoom.name}. Monitoring channel active.`,
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          isSelf: false,
        },
      ]);
    }, 1200);
  };

  return (
    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: 'calc(100vh - 140px)' }}>
      {/* Sidebar Rooms */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <MessageSquare size={18} color="var(--primary-red)" />
          EMERGENCY CHAT ROOMS
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              style={{
                background: activeRoom.id === room.id ? 'rgba(255, 71, 87, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeRoom.id === room.id ? 'var(--primary-red)' : 'var(--border-glass)'}`,
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: activeRoom.id === room.id ? 'var(--primary-red)' : 'var(--text-main)' }}>
                {room.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{room.topic}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        {/* Chat Room Header */}
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>{activeRoom.name}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Topic: {activeRoom.topic}</span>
          </div>
          <span className="badge-live">WEBSOCKET ENCRYPTED</span>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.isSelf ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                background: msg.isSelf ? 'linear-gradient(135deg, rgba(30,144,255,0.3), rgba(30,144,255,0.1))' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.isSelf ? 'rgba(30,144,255,0.4)' : 'var(--border-glass)'}`,
                padding: '10px 14px',
                borderRadius: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: msg.isSelf ? 'var(--accent-cyan)' : 'var(--primary-red)' }}>
                  {msg.sender} ({msg.role})
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{msg.time}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>{msg.text}</div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', pt: '12px', borderTop: '1px solid var(--border-glass)' }}>
          <input
            type="text"
            className="input-glass"
            placeholder={`Message ${activeRoom.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}>
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
