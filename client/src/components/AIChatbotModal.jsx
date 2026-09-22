import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User } from './Icons';

export const AIChatbotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am PulseLife AI Assistant 🩸. How can I help you today? You can ask me about donor eligibility, blood group matching, emergency requests, or scheduling a donation!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I had trouble connecting to AI services." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '500px', height: '600px', display: 'flex',
        flexDirection: 'column', background: '#131A26', overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 20px', background: 'linear-gradient(135deg, rgba(230,57,70,0.3), rgba(59,130,246,0.3))',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#FF2E63" />
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>PulseLife AI Assistant</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Powered by Intelligent Medical Rules Engine</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%', display: 'flex', gap: '10px', alignItems: 'flex-start'
            }}>
              {m.sender === 'bot' && (
                <div style={{ background: 'rgba(230,57,70,0.2)', padding: '6px', borderRadius: '50%' }}>
                  <Bot size={18} color="#FF2E63" />
                </div>
              )}
              <div style={{
                background: m.sender === 'user' ? 'var(--primary-red)' : 'rgba(255,255,255,0.06)',
                padding: '12px 16px', borderRadius: '12px', color: '#FFF', fontSize: '0.9rem',
                border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none'
              }}>
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div style={{ background: 'rgba(59,130,246,0.2)', padding: '6px', borderRadius: '50%' }}>
                  <User size={18} color="#60A5FA" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              PulseLife AI is thinking...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            "Am I eligible to donate?",
            "What is O-Negative blood?",
            "How to submit emergency request?",
            "Donation cooldown period"
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(chip);
              }}
              style={{
                whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '4px 10px',
                borderRadius: '12px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)',
                border: '1px solid var(--border-color)'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Type your medical query or question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
