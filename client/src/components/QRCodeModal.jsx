import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, ShieldCheck } from './Icons';

export const QRCodeModal = ({ isOpen, onClose, title, qrValue, metadata }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '420px', padding: '28px', background: '#161C26',
        textAlign: 'center', position: 'relative'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'inline-flex', background: 'rgba(16,185,129,0.15)', padding: '10px', borderRadius: '50%', marginBottom: '14px' }}>
          <ShieldCheck size={28} color="#10B981" />
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{title || 'Digital Verification Badge'}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Scan to verify authentic blood bank transaction or donor ID status.
        </p>

        {/* QR Code Container */}
        <div style={{
          background: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'inline-block',
          marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <QRCodeSVG value={qrValue || 'PULSELIFE-VERIFIED-DONOR'} size={180} />
        </div>

        {metadata && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px',
            textAlign: 'left', fontSize: '0.85rem', marginBottom: '20px'
          }}>
            {Object.entries(metadata).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                <span style={{ fontWeight: 600, color: '#FFF' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Close Verification Badge
        </button>
      </div>
    </div>
  );
};
