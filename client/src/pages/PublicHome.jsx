import React, { useState, useEffect } from 'react';
import { 
  Heart, Droplets, Shield, AlertTriangle, ArrowRight, 
  Search, Users, Activity, Sparkles, Award
} from '../components/Icons';
import { MapVisualizer } from '../components/MapVisualizer';

export const PublicHome = ({ setActiveTab, openChatbot }) => {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [emergencyReqs, setEmergencyReqs] = useState([]);

  // Interactive Blood Compatibility State
  const [selectedGroup, setSelectedGroup] = useState('O-');

  // Interactive Blood Reserve Gauges Data
  const stockReserves = [
    { group: 'O-', units: 12, max: 40, status: 'Critical Shortage', color: '#EF4444' },
    { group: 'O+', units: 45, max: 60, status: 'Optimal Stock', color: '#10B981' },
    { group: 'A+', units: 38, max: 50, status: 'Optimal Stock', color: '#10B981' },
    { group: 'A-', units: 15, max: 40, status: 'Moderate Reserve', color: '#F59E0B' },
    { group: 'B+', units: 30, max: 50, status: 'Optimal Stock', color: '#10B981' },
    { group: 'B-', units: 10, max: 35, status: 'Low Reserve', color: '#F59E0B' },
    { group: 'AB+', units: 25, max: 40, status: 'Optimal Stock', color: '#10B981' },
    { group: 'AB-', units: 8, max: 30, status: 'Critical Shortage', color: '#EF4444' }
  ];

  const compatibilityMap = {
    'O-': {
      canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      canReceiveFrom: ['O-'],
      note: '🌟 Universal Red Cell Donor! Your blood can save anyone in critical trauma emergencies.'
    },
    'O+': {
      canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
      canReceiveFrom: ['O+', 'O-'],
      note: 'High Demand! Most common blood type requested by hospitals worldwide.'
    },
    'A+': {
      canDonateTo: ['A+', 'AB+'],
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
      note: 'Key Red Cell Type! Needed daily for surgeries and oncology patients.'
    },
    'A-': {
      canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
      canReceiveFrom: ['A-', 'O-'],
      note: 'Rare Type! Critical for patients requiring targeted antibody compatibility.'
    },
    'B+': {
      canDonateTo: ['B+', 'AB+'],
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
      note: 'High Utility! Serves 1 in 10 patients in trauma and surgical wards.'
    },
    'B-': {
      canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
      canReceiveFrom: ['B-', 'O-'],
      note: 'Very Rare! Highly requested for pediatric and neonatal blood transfusions.'
    },
    'AB+': {
      canDonateTo: ['AB+'],
      canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      note: '🌟 Universal Recipient! You can safely receive red blood cells from any donor.'
    },
    'AB-': {
      canDonateTo: ['AB-', 'AB+'],
      canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
      note: 'Rarest Blood Group! Highly valuable plasma donor status for burn units.'
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [bbRes, hospRes, reqRes] = await Promise.all([
        fetch('/api/blood-banks'),
        fetch('/api/hospitals'),
        fetch('/api/requests')
      ]);

      if (bbRes.ok) setBloodBanks(await bbRes.json());
      if (hospRes.ok) setHospitals(await hospRes.json());
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setEmergencyReqs(reqData.filter(r => r.urgency === 'Emergency' || r.urgency === 'Urgent'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', paddingBottom: '60px' }}>
      
      {/* Hero Section with Glowing Glassmorphism Card */}
      <section className="glass-panel" style={{
        padding: '48px 36px', background: 'linear-gradient(135deg, rgba(255,23,68,0.2) 0%, rgba(10,13,20,0.92) 100%)',
        position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,23,68,0.3)',
        boxShadow: '0 12px 40px rgba(255,23,68,0.25)'
      }}>
        <div style={{ maxWidth: '850px' }}>
          <span className="badge badge-emergency" style={{ marginBottom: '16px', display: 'inline-block' }}>
            🚨 24/7 National Emergency Blood Dispatch Engine
          </span>

          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.15', fontWeight: 800, marginBottom: '18px' }}>
            Connecting Donors, Hospitals & Blood Banks <span style={{ color: 'var(--primary-red)' }}>In Real-Time</span>.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>
            PulseLife is an AI-powered blood network platform ensuring zero latency during critical medical emergencies. Register as a donor, request blood units, or track stock instantly.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('find-blood')} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <Search size={18} /> Find Blood Now
            </button>

            <button onClick={() => setActiveTab('login')} className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <Heart size={18} color="#FF2E63" /> Become A Donor
            </button>

            <button onClick={openChatbot} className="btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem', color: '#60A5FA', borderColor: 'rgba(96,165,250,0.4)' }}>
              <Sparkles size={18} /> Ask AI Assistant
            </button>
          </div>
        </div>
      </section>

      {/* Live Impact Stats Ticker */}
      <section className="grid-4">
        <div className="glass-panel glass-panel-hover" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,23,68,0.2)', padding: '14px', borderRadius: '14px', boxShadow: '0 0 15px rgba(255,23,68,0.3)' }}>
            <Users size={28} color="#FF1744" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>1,482+</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Donors</div>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.2)', padding: '14px', borderRadius: '14px' }}>
            <Droplets size={28} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>183 Units</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available In Reserve</div>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245,158,11,0.2)', padding: '14px', borderRadius: '14px' }}>
            <Activity size={28} color="#F59E0B" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>99.2%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fulfillment Rate</div>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59,130,246,0.2)', padding: '14px', borderRadius: '14px' }}>
            <Shield size={28} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFF' }}>12 Centers</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Blood Banks</div>
          </div>
        </div>
      </section>

      {/* Real-Time Live Blood Stock Reserves Visual Gauges */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-pending" style={{ marginBottom: '6px', display: 'inline-block' }}>Live Inventory Network</span>
            <h3 style={{ fontSize: '1.4rem' }}>🩸 Real-Time Blood Stock Reserves</h3>
          </div>
          <button onClick={() => setActiveTab('find-blood')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            Search Nearby Inventory <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-4">
          {stockReserves.map(item => {
            const pct = Math.round((item.units / item.max) * 100);
            return (
              <div key={item.group} className="glass-panel" style={{ padding: '16px', background: '#121927' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emergency" style={{ fontSize: '0.95rem' }}>{item.group}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color }}>{item.status}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '10px', color: '#FFF' }}>
                  {item.units} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {item.max} Units</span>
                </div>
                <div className="reserve-bar-bg">
                  <div className="reserve-bar-fill" style={{ width: `${pct}%`, background: item.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Broadcasts Alert Feed */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} color="#FF1744" className="heartbeat-icon" />
            <h3 style={{ fontSize: '1.3rem' }}>Live Emergency Blood Requests</h3>
          </div>
          <button onClick={() => setActiveTab('find-blood')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            View All Broadcasts <ArrowRight size={14} />
          </button>
        </div>

        {emergencyReqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No active emergency alerts at this time. All hospital needs are stable.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {emergencyReqs.slice(0, 3).map(req => (
              <div key={req._id} style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                padding: '18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-emergency">{req.urgency}</span>
                    <h4 style={{ fontSize: '1.15rem', color: '#FFF' }}>
                      Needed: <span style={{ color: '#F87171', fontWeight: 800 }}>{req.bloodGroup}</span> ({req.units} Units)
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    🏥 {req.hospitalId?.name || 'Emergency Medical Center'} • Reason: {req.reason}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('login')}
                  className="btn-primary" 
                  style={{ background: '#FF1744', fontSize: '0.88rem', padding: '10px 20px' }}
                >
                  Respond & Donate Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Blood Transfusion Screener Matrix */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>🩸 Interactive Blood Compatibility Screener</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Click on any blood group below to inspect instant compatibility details for donors and hospital recipients.
        </p>

        {/* Blood Group Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {Object.keys(compatibilityMap).map(bg => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={`btn-secondary ${selectedGroup === bg ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.9rem', padding: '8px 16px', fontWeight: 700 }}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* Selected Group Breakdown Panel */}
        <div className="glass-panel" style={{ padding: '20px', background: '#121927', border: '1px solid rgba(255,23,68,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span className="badge badge-emergency" style={{ fontSize: '1.1rem', padding: '6px 16px' }}>{selectedGroup}</span>
            <h4 style={{ fontSize: '1.1rem', color: '#FFF' }}>Blood Group Analysis</h4>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#60A5FA', marginBottom: '16px', fontWeight: 500 }}>
            {compatibilityMap[selectedGroup].note}
          </p>

          <div className="grid-2">
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                CAN DONATE RED BLOOD CELLS TO:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {compatibilityMap[selectedGroup].canDonateTo.map(g => (
                  <span key={g} className="badge badge-success">{g}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                CAN RECEIVE RED BLOOD CELLS FROM:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {compatibilityMap[selectedGroup].canReceiveFrom.map(g => (
                  <span key={g} className="badge badge-pending">{g}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Retention & Gamification Tiers Showcase */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Award size={24} color="#F59E0B" />
          <h3 style={{ fontSize: '1.3rem' }}>PulseLife Hero Badges & Donor Gamification Tiers</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Every donation earns points and unlocks official verified life-saver badges.
        </p>

        <div className="grid-3">
          <div className="glass-panel" style={{ padding: '20px', background: '#121927', borderTop: '4px solid #CD7F32' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🥉 Bronze LifeSaver</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Awarded for completing your first whole blood donation. Includes digital pass verification.
            </p>
            <span className="badge badge-pending">1 - 3 Donations</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', background: '#121927', borderTop: '4px solid #C0C0C0' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🥈 Silver Guardian</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Awarded for consistent quarterly donations. Unlocks priority emergency dispatch alerts.
            </p>
            <span className="badge badge-urgent">4 - 9 Donations</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', background: '#121927', borderTop: '4px solid #FFD700' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🏆 Golden Hero</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Our highest honor for community donors. Unlocks VIP recognition and emergency hero status.
            </p>
            <span className="badge badge-success">10+ Lifetime Donations</span>
          </div>
        </div>
      </section>

      {/* Geolocation Map Visualizer */}
      <MapVisualizer bloodBanks={bloodBanks} hospitals={hospitals} />

    </div>
  );
};
