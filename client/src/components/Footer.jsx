import React from 'react';
import { Droplets, Heart, Shield } from './Icons';

export const Footer = () => {
  return (
    <footer className="glass-panel" style={{
      borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
      marginTop: 'auto', padding: '40px 24px 20px 24px', background: '#0B0F17'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--primary-red)', padding: '8px', borderRadius: '10px' }}>
              <Droplets size={20} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>PULSELIFE</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Next-Generation Blood Bank Management & Emergency Rescue Platform.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: '#FFF' }}>Emergency Hotlines</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>📞 National Emergency: <strong>100 / 112</strong></li>
            <li>🩸 Blood Dispatch Hotline: <strong>1800-419-1800</strong></li>
            <li>🏥 Hospital Requisition: <strong>044-25965596</strong></li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
         PulseLife Blood Bank Network.
      </div>
      <div style={{ paddingTop: '10px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        © {new Date().getFullYear()} All Rights Reserved.
      </div>
    </footer>
  );
};
