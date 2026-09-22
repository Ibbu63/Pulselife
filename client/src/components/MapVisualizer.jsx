import React, { useState } from 'react';
import { MapPin, Navigation, Shield, Hospital } from './Icons';

export const MapVisualizer = ({ bloodBanks = [], hospitals = [] }) => {
  const [selectedPin, setSelectedPin] = useState(null);

  // Mock geo-coordinates mapping for visualization layout
  const pins = [
    ...bloodBanks.map((b, idx) => ({
      id: b._id || `bb-${idx}`,
      type: 'Blood Bank',
      name: b.name,
      address: b.address,
      contact: b.contact,
      totalUnits: b.totalUnits || 15,
      x: 25 + (idx * 35),
      y: 35 + (idx * 20)
    })),
    ...hospitals.map((h, idx) => ({
      id: h._id || `hosp-${idx}`,
      type: 'Hospital',
      name: h.name,
      address: h.address,
      contact: h.phone,
      totalUnits: 'Requires Blood',
      x: 45 + (idx * 25),
      y: 65 - (idx * 25)
    }))
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} color="#E63946" /> Interactive Nearby Network & Radar
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time geolocation map of registered Blood Banks and Emergency Hospitals.
          </p>
        </div>
        <span className="badge badge-pending">📡 Live Radar Online</span>
      </div>

      {/* SVG Canvas Map Surface */}
      <div style={{
        position: 'relative', width: '100%', height: '320px', borderRadius: '14px',
        background: 'radial-gradient(circle at center, #1B2433 0%, #0F172A 100%)',
        border: '1px solid var(--border-color)', overflow: 'hidden'
      }}>
        {/* Grid lines effect */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Pulse Radar rings */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '240px', height: '240px', border: '1px solid rgba(230,57,70,0.3)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '120px', height: '120px', border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        {/* Pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            onClick={() => setSelectedPin(pin)}
            style={{
              position: 'absolute', left: `${pin.x}%`, top: `${pin.y}%`,
              transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}
          >
            <div style={{
              background: pin.type === 'Blood Bank' ? 'var(--primary-red)' : 'var(--accent-blue)',
              padding: '8px', borderRadius: '50%', boxShadow: '0 0 14px currentColor',
              display: 'flex', transition: 'all 0.2s'
            }}>
              {pin.type === 'Blood Bank' ? <Shield size={18} color="#FFF" /> : <Hospital size={18} color="#FFF" />}
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, color: '#FFF', background: 'rgba(0,0,0,0.8)',
              padding: '2px 6px', borderRadius: '4px', marginTop: '4px', whiteSpace: 'nowrap'
            }}>
              {pin.name}
            </span>
          </div>
        ))}

        {/* Selected Pin Tooltip Card */}
        {selectedPin && (
          <div className="glass-panel" style={{
            position: 'absolute', bottom: '16px', left: '16px', right: '16px',
            padding: '14px', background: '#161C26', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', zIndex: 30
          }}>
            <div>
              <span className={`badge ${selectedPin.type === 'Blood Bank' ? 'badge-emergency' : 'badge-pending'}`}>
                {selectedPin.type}
              </span>
              <h4 style={{ fontSize: '1rem', marginTop: '4px' }}>{selectedPin.name}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {selectedPin.address}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981' }}>
                📞 {selectedPin.contact}
              </div>
              <button 
                onClick={() => setSelectedPin(null)} 
                className="btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '4px 8px', marginTop: '6px' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
